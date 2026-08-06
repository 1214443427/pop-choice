import { VECTOR_DB_MATCH_COUNT, VECTOR_DB_THRESHOLD } from "@shared/const.js";
import type { MovieDetails } from "../app.js";
import { openai, supabase } from "../config.js";
import { getEmbedModel } from "./utils.js";
import { TMDB_URL } from "../const.js";

//fetches poster of a movie from TMDB.
const TMDB_OPTIONS = {
  method: "GET",
  headers: { accept: "application/json", Authorization: `Bearer ${process.env.TMDB_API}` },
};

export async function fetchPoster(movie: MovieDetails) {
  try {
    const fullURL = `${TMDB_URL}?query=${encodeURIComponent(movie.title)}${movie.year ? `&primary_release_year=${encodeURIComponent(movie.year)}` : ""}`;
    const response = await fetch(fullURL, TMDB_OPTIONS);
    if (!response.ok) {
      return;
    }
    const movieFullDetail = (await response.json()) as { results: { poster_path?: string }[] };
    const baseURL = "https://image.tmdb.org/t/p/w500";
    // console.log(movieFullDetail);
    const posterURL = movieFullDetail.results[0]?.poster_path;

    if (!posterURL) {
      return;
    }
    return `${baseURL}${posterURL}`;
  } catch (error) {
    console.error(error);
    return;
  }
}

export async function createEmbeddingFromPrompt(userPrompt: string) {
  try {
    const result = await openai.embeddings.create({
      model: getEmbedModel(),
      input: userPrompt,
    });
    if (!result.data[0]) {
      throw new Error("Embedding creation failed.");
    }
    return result.data[0].embedding;
  } catch (error) {
    throw error;
  }
}

export async function getDocumentsFromDB(embedding: number[]) {
  // console.log("Embed finished.", result.data[0]?.embedding, "Fetching from supabase");
  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: embedding,
    match_threshold: VECTOR_DB_THRESHOLD,
    match_count: VECTOR_DB_MATCH_COUNT,
  });
  return { data, error };
}
