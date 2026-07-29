import type { Request, Response } from "express";
import express from "express";
import cors from "cors";
import type { MovieFormData, MovieResponseData } from "@shared/type.js";
import { openai, supabase } from "./config.js";
import { getAIModel, getEmbedModel } from "./lib/utils.js";
import * as z from "zod";
import { zodResponseFormat } from "openai/helpers/zod.js";

type Role = "user" | "assistant" | "system" | "developer";
interface Message {
  role: Role;
  content: string;
}

const MovieDetails = z.object({
  title: z.string(),
  year: z.number().optional(),
  description: z.string(),
});

export type MovieDetails = z.infer<typeof MovieDetails>;

const TMDB_URL = "https://api.themoviedb.org/3/search/movie?";
const TMDB_OPTIONS = {
  method: "GET",
  headers: { accept: "application/json", Authorization: `Bearer ${process.env.TMDB_API}` },
};

const PORT = 3000;

const app = express();
app.use(express.json());

const corsOptions = {
  origin: ["http://localhost:5173"], // Allowed domains
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

async function fetchPoster(movie: MovieDetails) {
  try {
    const response = await fetch(
      `${TMDB_URL}query=${movie.title}${movie.year ? `&year=${movie.year}` : ""}`,
      TMDB_OPTIONS,
    );
    const movieFullDetail = (await response.json()) as { results: { poster_path?: string }[] };
    const baseURL = "https://image.tmdb.org/t/p/w500";
    console.log(movieFullDetail);
    const posterURL = movieFullDetail.results[0]?.poster_path;
    if (!posterURL) {
      return;
    }
    return `${baseURL}${posterURL}`;
  } catch (error) {
    console.log(error);
    return;
  }
}

app.post(
  "/api/movies",
  async (
    req: Request<any, any, MovieFormData>,
    res: Response<MovieResponseData[] | { message: string }>,
  ) => {
    const { favoriteMovie, period, mood, islandPerson } = req.body;
    try {
      const userPrompt = `I am looking for something ${period}.\n It should be ${mood}.\n ${favoriteMovie}\n ${islandPerson}`;
      console.log("generating embedding");
      const result = await openai.embeddings.create({
        model: getEmbedModel(),
        input: userPrompt,
      });
      console.log("Embed finished.", result.data[0]?.embedding, "Fetching from supabase");
      const { data, error } = await supabase.rpc("match_documents", {
        query_embedding: result.data[0]?.embedding,
        match_threshold: 0.25,
        match_count: 3,
      });
      if (error) {
        console.error("supabase error", error);
        res.status(500).json({ message: "Internal DB error" });
      } else {
        const messages: Message[] = [
          {
            role: "system",
            content:
              "You are a helpful AI that gives the user a reason to watch a movie provided by our services. Your user prompt will consists of the user's favorite movies, favorite actors, their mood for movie type, and most importantly, our list of available movies, filtered based on the user's interest. You must only recommend movies from our list. If the list is empty, suggest our latests release: Toy Story 5 released in 2026. Inform the user that we don't have any recommendations for now and try this new release in the description. If the list is not empty, generate a short description (around 40 words) for the movie, and emphasis on the part that the user might be interested in. The description must be based on our list. ",
          },
          {
            role: "user",
            content: `I am looking for something classic.\nIt should be fun.\nMy favorite movie is the grand budapest hotel. I like the humorous nature with a hint of history. \nMy favorite actor is the guy from Batman. ---LIST:  Jojo Rabbit (2019) Jojo is a lonely German boy who discovers that his single mother is hiding a Jewish girl in their attic. Aided only by his imaginary friend -- Adolf Hitler -- Jojo must confront his blind nationalism as World War II continues to rage on. |||  Green Book (2018)  Dr. Don Shirley is a world-class African-American pianist who's about to embark on a concert tour in the Deep South in 1962. In need of a driver and protection, Shirley recruits Tony Lip, a tough-talking bouncer from an Italian-American neighborhood in the Bronx. Despite their differences, the two men soon develop an unexpected bond while confronting racism and danger in an era of segregation. |||  American Hustle(2013) Irving Rosenfeld (Christian Bale) dabbles in forgery and loan-sharking, but when he falls for fellow grifter Sydney Prosser (Amy Adams), things change in a big way. Caught red-handed by FBI agent Richie DiMaso (Bradley Cooper), Irv and Sydney are forced to work undercover as part of DiMaso's sting operation to nail a New Jersey mayor (Jeremy Renner). Meanwhile, Irv's jealous wife (Jennifer Lawrence) may be the one to bring everyone's world crashing down. Based on the 1970s Abscam case. `,
          },
          {
            role: "assistant",
            content: JSON.stringify({
              movies: [
                {
                  title: "Jojo Rabbit",
                  year: 2019,
                  description:
                    "A lonely German boy in the last days of WWII takes life advice from his " +
                    "imaginary friend — a buffoonish Adolf Hitler — until the Jewish girl " +
                    "hidden in his attic starts dismantling everything he's been taught. ",
                },
                {
                  title: "Green Book (2018)",
                  year: 2018,
                  description:
                    "A 1962 road trip through the segregated South, built on the odd-couple " +
                    "chemistry between a refined Black concert pianist and the brash Bronx " +
                    "bouncer he hires to drive him. Warm, funny, and grounded in a " +
                    "real friendship.",
                },
                {
                  title: "American Hustle",
                  year: 2013,
                  description:
                    "Christian Bale — your Batman — disappears completely into a paunchy, " +
                    "combover-sporting con artist, and he's clearly having the time of his " +
                    "life. He and his partner get squeezed by the FBI into a sting on a New " +
                    "Jersey mayor, and everyone's scheming against everyone else.",
                },
              ],
            }),
          },
          {
            role: "user",
            content: `I am looking for something classic.\nIt should be serious.\n My favorite movie is the one with an astronaut and spaceship.\n My favorite actor is Jeff ---LIST: `,
          },
          {
            role: "assistant",
            content: JSON.stringify({
              movies: [
                {
                  title: "Toy Story 5",
                  year: 2026,
                  description:
                    "I can't find anything, but you should definitely check out our latest addition! ",
                },
              ],
            }),
          },
        ];
        const movieList: string[] = data.map((movie: { content: string }) => movie.content);
        console.log("fetched movie data:", movieList, data);
        messages.push({
          role: "user",
          content: `${userPrompt} ---LIST: ${movieList.join(" ||| ")}`,
        });

        const response = await openai.chat.completions.parse({
          model: getAIModel(),
          messages: messages,
          response_format: zodResponseFormat(z.array(MovieDetails), "movies"),
        });
        console.log(response);
        const choice = response.choices[0];
        if (!choice) {
          return res.status(400).json({ message: "Sorry, we couldn't recommend a movie for you." });
        }
        if (choice.message.refusal) {
          return res.status(400).json({ message: choice.message.refusal });
        }
        const movies = choice.message.parsed as MovieDetails[];
        const moviesWithPosters: MovieResponseData[] = await Promise.all(
          movies.map(async (movie) => ({
            ...movie,
            poster: await fetchPoster(movie),
          })),
        );
        res.status(200).json(moviesWithPosters);
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: "Sorry, there was an issue with our server. " });
    }
  },
);

app.listen(PORT, () => {
  console.log("running on port", PORT);
});

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
