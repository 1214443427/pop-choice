import type { Request, Response } from "express";
import express from "express";
import cors from "cors";
import type { MovieFormData, MovieResponseData } from "@shared/type.js";
import { openai } from "./config.js";
import { getAIModel, getInitialPrompts, getUserPrompt } from "./lib/utils.js";
import * as z from "zod";
import { zodResponseFormat } from "openai/helpers/zod.js";
import { createEmbeddingFromPrompt, fetchPoster, getDocumentsFromDB } from "./lib/api.js";

const MovieDetails = z.object({
  title: z.string(),
  year: z.number().optional().nullable(),
  description: z.string(),
});

const RootResponseSchema = z.object({
  movieTitles: z.array(z.string()).describe("Every movie title found in the input, listed first."), //Used to force LLM to enumerate for multiple entries.
  movies: z
    .array(MovieDetails)
    .describe("A list of movie objects. Each object must represent an entry from the movie list."),
});

export type MovieDetails = z.infer<typeof MovieDetails>;

export const app = express();
app.use(express.json());

const corsOptions = {
  origin: ["http://localhost:5173"], // Allowed domains
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.post(
  "/api/movies",
  async (
    req: Request<any, any, MovieFormData>,
    res: Response<MovieResponseData | { message: string }>,
  ) => {
    // console.log(req.body);

    // Create a user prompt based on the information from the request. It consists of the user's favorite movie, preference for classic/new movies, the type of movie they are in the mood for, and their favorite actor.
    let userPrompt;
    try {
      userPrompt = getUserPrompt(req.body);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error parsing sent data.";
      return res.status(400).json({ message });
    }

    //Initialize a messages array with a system prompt, and 2 few-shot examples.
    const messages = getInitialPrompts();

    // return res.status(200).json([{ message: "Improper response body" }]);
    try {
      // Creates embedding of the user's prompt and fetch matches from the DB using the embeddings.
      const embedding = await createEmbeddingFromPrompt(userPrompt);
      const { data, error } = await getDocumentsFromDB(embedding);
      if (error) {
        console.error("supabase error", error);
        return res.status(500).json({ message: "Internal DB error" });
      }

      // Extract the text content from the fetched array and join them into a single string, separated by `|||`
      const movieList: string = data
        .map((movie: { content: string }) => movie.content)
        .join(" ||| ");

      // Add user's prompt and the fetched list of movies to the messages array
      messages.push({
        role: "user",
        content: `${userPrompt} ---LIST: ${movieList}`,
      });

      const response = await openai.chat.completions.create({
        model: getAIModel(),
        messages: messages,
        response_format: zodResponseFormat(RootResponseSchema, "movies"),
      });

      const choice = response.choices[0];

      // console.log(choice);

      if (!choice) {
        return res.status(500).json({ message: "Sorry, we couldn't recommend a movie for you." });
      }
      if (choice.message.refusal) {
        return res.status(500).json({ message: choice.message.refusal });
      }
      if (!choice.message.content) {
        return res.status(500).json({ message: "Sorry, we couldn't recommend a movie for you." });
      }

      const movies = JSON.parse(choice.message.content).movies as MovieDetails[];

      const moviesWithPosters: MovieResponseData = await Promise.all(
        movies.map(async (movie) => ({
          ...movie,
          poster: await fetchPoster(movie),
        })),
      );
      res.status(200).json(moviesWithPosters);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Sorry, there was an issue with our server. " });
    }
  },
);

/*
The json schema that was replaced by zod.
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "movie_suggestion",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                movies: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      title: { type: "string" },
                      year: { type: "number" },
                      description: { type: "string" },
                    },
                    required: ["title", "description"],
                  },
                },
              },
              required: ["movies"],
            },
          },
        },


*/

//Movie List used to test LLM without fetching from DB.
// const movieList = [
//   "Title: Avatar: The Way of the Water, Release Year: 2022, Content: Avatar: The Way of Water (3 hr 10 min): Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na'vi race to protect their home. Action, Adventure, Fantasy film released in 2022. Directed by James Cameron Written by James Cameron, Rick Jaffa and Amanda Silver. Starring Sam Worthington, Zoe Saldana and Sigourney Weaver. Rated 7.6 on IMDB",
//   "Title: Spider-Man: Across the Spider-Verse, Release Year: 2023, Content: Spider-Man: Across the Spider-Verse (2 hr 20 min): Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero. Animation, Action, Adventure film released in 2023. Directed by Joaquim Dos Santos, Kemp Powers an Justin K. Thompson. Written by Phil Lord, Christopher Miller and Dave Callaham. Starring: Shameik Moore, Hailee Steinfeld and Brian Tyree Henry. Rated 8.7 on IMDB",
//   "The Super Mario Bros. Movie: 2023 | PG | 1h 32m | 7.1 rating --- Synopsis: 'The Super Mario Bros. Movie': While working underground to fix a water main, Brooklyn plumbers and brothers Mario and Luigi are transported through a mysterious pipe to a magical new world. But when the siblings are separated, an epic adventure begins to save a captured princess. The Super Mario Bros. Movie is an animated adventure comedy directed by Aaron Horvath, Michael Jelenic and Pierre Leduc. It's voiced by the actors Chris Pratt, Anya Taylor-Joy and Charlie Day.",
// ];
