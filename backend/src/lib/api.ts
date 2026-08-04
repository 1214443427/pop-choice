import { VECTOR_DB_MATCH_COUNT, VECTOR_DB_THRESHOLD } from "@shared/const.js";
import type { MovieDetails } from "../app.js";
import { openai, supabase } from "../config.js";
import { getEmbedModel } from "./utils.js";

//fetches poster of a movie from TMDB.
const TMDB_URL = "https://api.themoviedb.org/3/search/movie?";
const TMDB_OPTIONS = {
  method: "GET",
  headers: { accept: "application/json", Authorization: `Bearer ${process.env.TMDB_API}` },
};

export async function fetchPoster(movie: MovieDetails) {
  try {
    const fullURL = `${TMDB_URL}query=${encodeURIComponent(movie.title)}${movie.year ? `&primary_release_year=${encodeURIComponent(movie.year)}` : ""}`;
    const response = await fetch(fullURL, TMDB_OPTIONS);
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

export async function getDocumentsFromDB(userPrompt: string) {
  const result = await openai.embeddings.create({
    model: getEmbedModel(),
    input: userPrompt,
  });
  // console.log("Embed finished.", result.data[0]?.embedding, "Fetching from supabase");
  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: result.data[0]?.embedding,
    match_threshold: VECTOR_DB_THRESHOLD,
    match_count: VECTOR_DB_MATCH_COUNT,
  });
  return { data, error };
}
