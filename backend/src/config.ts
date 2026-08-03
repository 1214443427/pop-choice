import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

/** OpenAI config */
if (!process.env.AI_KEY) throw new Error("OpenAI API key is missing or invalid.");
export const openai = new OpenAI({
  baseURL: process.env.AI_URL,
  apiKey: process.env.AI_KEY,
});

/** Supabase config */
const privateKey = process.env.SUPABASE_SECRET_KEY;
if (!privateKey) throw new Error(`Expected env var SUPABASE_SECRET_KEY`);
const url = process.env.SUPABASE_URL;
if (!url) throw new Error(`Expected env var SUPABASE_URL`);
export const supabase = createClient(url, privateKey);

/** TMDB config **/
const tmdbKey = process.env.TMDB_API;
if (!tmdbKey) throw new Error(`Expected env var TMDB_API`);
