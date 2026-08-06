import express from "express";
import cors from "cors";
import { moviesHandler } from "./route/movies.js";

export const app = express();
app.use(express.json());

const corsOptions = {
  origin: ["http://localhost:5173"], // Allowed domains
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.post("/api/movies", moviesHandler);

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
