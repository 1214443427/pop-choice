import type { Request, Response } from "express";
import type { MovieFormData, MovieResponseData } from "@shared/type.js";
import { openai } from "../config.js";
import { getAIModel, getInitialPrompts, getUserPrompt } from "../lib/utils.js";
import { zodResponseFormat } from "openai/helpers/zod.js";
import { createEmbeddingFromPrompt, fetchPoster, getDocumentsFromDB } from "../lib/api.js";
import * as z from "zod";

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

export const moviesHandler = async (
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
    const movieList: string = data.map((movie: { content: string }) => movie.content).join(" ||| ");

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
};
