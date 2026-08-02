import { openai, supabase } from "./config.js";
import { movies } from "./data/content.js";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { readFile } from "node:fs/promises";
import { getEmbedModel } from "./lib/utils.js";

const embedModel = getEmbedModel();

async function seedFromContent() {
  for (const movie of movies) {
    console.log("Embedding ", movie.title);
    const movieDetails = `Title: ${movie.title}, Release Year: ${movie.releaseYear}, Content: ${movie.content}`;
    const result = await openai.embeddings.create({
      model: embedModel,
      input: movieDetails,
    });
    console.log("Embed cost", result.usage);
    const { data, error } = await supabase.from("documents").insert({
      content: movieDetails,
      embedding: result.data[0]?.embedding,
    });
    if (error) {
      console.log(error);
      break;
    } else {
      console.log("success embedded", movie.title);
    }
  }
}

async function seedFromMovies() {
  const response = await readFile("./src/data/movies.txt", "utf-8");
  const textArray = response.split("\n").filter((text) => text != "");

  const movieArray = [];
  for (let i = 0; i < textArray.length - 1; i += 2) {
    movieArray.push({
      meta: textArray[i],
      text: textArray[i + 1],
    });
  }

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1200,
    chunkOverlap: 180,
  });

  const promiseArray = movieArray.map(async (movie) => {
    if (movie.text) {
      const output = await splitter.createDocuments([movie.text]);
      return output.map((chunk) => `${movie.meta} --- Synopsis: ${chunk.pageContent}`);
    }
  });

  const chunksArray = await Promise.all(promiseArray);

  const seedPromises = chunksArray.flat().map(async (chunk) => {
    console.log("embedding", chunk);
    const result = await openai.embeddings.create({
      model: embedModel,
      input: chunk || "",
    });
    const { data, error } = await supabase.from("documents").insert({
      content: chunk,
      embedding: result.data[0]?.embedding,
    });
    if (error) {
      console.log(error);
      return;
    } else {
      console.log("success embedded");
    }
  });
  await Promise.all(seedPromises);
  console.log("DB seeded!");
}

seedFromMovies();
