import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { afterAll, afterEach } from "vitest";
import {
  AI_URL,
  EMBEDDING_DIMENSIONS,
  ERROR_MESSAGE_BAD_REQUEST,
  ERROR_MESSAGE_UNEXPECTED,
  FASTNFURIOUS_PATH,
  FIGHTING_CLUB_PATH,
  MARIO_PATH,
  SUPABASE_URL,
} from "./testConst.js";
import { TMDB_URL } from "../const.js";
import { VECTOR_DB_MATCH_COUNT, VECTOR_DB_THRESHOLD } from "@shared/const.js";
import { getAIModel } from "../lib/utils.js";
import type { MovieFormData } from "@shared/type.js";

// config.ts reads these the moment it is imported, and dotenv won't override what is
// already set. Pinning them here keeps the suite off the real APIs and keeps the
// embedding handler's URL in sync with the one the OpenAI client is built with.
process.env.AI_URL = AI_URL;
process.env.AI_KEY = "test-ai-key";
process.env.AI_MODEL = "test-ai-model";
process.env.AI_EMBED_MODEL = "test-embed-model";
process.env.TMDB_API = "test-tmdb-key";
process.env.SUPABASE_URL = "https://test.supabase.co";
process.env.SUPABASE_SECRET_KEY = "test-supabase-key";

const movieResult = {
  results: [
    {
      title: "Fight Club",
      poster_path: FIGHTING_CLUB_PATH,
      year: 1999,
    },
    {
      title: "Fight Club: Members Only",
      year: 2006,
    },
  ],
};

const movieResultBy2006 = {
  results: [
    {
      title: "Fight Club: Members Only",
      year: 2006,
    },
    {
      title: "Fight Club",
      poster_path: FIGHTING_CLUB_PATH,
      year: 1999,
    },
  ],
};

const movieByQuery = {
  results: [
    {
      title: "The Super Mario Bros. Movie",
      poster_path: MARIO_PATH,
    },
  ],
};

const fastAndFurious = {
  results: [
    {
      title: "Fast & Furious",
      poster_path: FASTNFURIOUS_PATH,
    },
  ],
};

const dbResult = [
  {
    content:
      "Title: Avatar: The Way of the Water, Release Year: 2022, Content: Avatar: The Way of Water (3 hr 10 min): Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na'vi race to protect their home. Action, Adventure, Fantasy film released in 2022. Directed by James Cameron Written by James Cameron, Rick Jaffa and Amanda Silver. Starring Sam Worthington, Zoe Saldana and Sigourney Weaver. Rated 7.6 on IMDB",
  },
  {
    content:
      "Title: Spider-Man: Across the Spider-Verse, Release Year: 2023, Content: Spider-Man: Across the Spider-Verse (2 hr 20 min): Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero. Animation, Action, Adventure film released in 2023. Directed by Joaquim Dos Santos, Kemp Powers an Justin K. Thompson. Written by Phil Lord, Christopher Miller and Dave Callaham. Starring: Shameik Moore, Hailee Steinfeld and Brian Tyree Henry. Rated 8.7 on IMDB",
  },
  {
    content:
      "The Super Mario Bros. Movie: 2023 | PG | 1h 32m | 7.1 rating --- Synopsis: 'The Super Mario Bros. Movie': While working underground to fix a water main, Brooklyn plumbers and brothers Mario and Luigi are transported through a mysterious pipe to a magical new world. But when the siblings are separated, an epic adventure begins to save a captured princess. The Super Mario Bros. Movie is an animated adventure comedy directed by Aaron Horvath, Michael Jelenic and Pierre Leduc. It's voiced by the actors Chris Pratt, Anya Taylor-Joy and Charlie Day.",
  },
];

export const restHandlers = [
  http.get(TMDB_URL, ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get("query");
    const year = url.searchParams.get("primary_release_year");

    if (query == "error") {
      return HttpResponse.json(
        {
          errorMessage: ERROR_MESSAGE_BAD_REQUEST,
        },
        { status: 500 },
      );
    }

    if (query == "Mario") {
      return HttpResponse.json(movieByQuery);
    }

    if (query == "Fast & Furious") {
      return HttpResponse.json(fastAndFurious);
    }

    const result = year && year == "2006" ? movieResultBy2006 : movieResult;

    return HttpResponse.json(result);
  }),

  http.post<never, { encoding_format?: string; input: string }>(
    `${AI_URL}/embeddings`,
    async ({ request }) => {
      const { encoding_format, input } = await request.json();
      if (input === "error") {
        return HttpResponse.json(
          {
            errorMessage: ERROR_MESSAGE_BAD_REQUEST,
          },
          { status: 401 },
        );
      }
      // Every eighth is exactly representable in float32, so the values survive the round trip.
      const values = Array.from({ length: EMBEDDING_DIMENSIONS }, (_, index) => (index % 8) / 8);
      // Unless the caller picks a format, the SDK asks for base64 and decodes it itself.
      const embedding =
        encoding_format === "float"
          ? values
          : Buffer.from(Float32Array.from(values).buffer).toString("base64");

      return HttpResponse.json({
        object: "list",
        data: [{ object: "embedding", index: 0, embedding }],
      });
    },
  ),

  http.post<never, { query_embedding: number[]; match_threshold: number; match_count: number }>(
    `${SUPABASE_URL}/rest/v1/rpc/match_documents`,
    async ({ request }) => {
      const { query_embedding, match_threshold, match_count } = await request.json();

      if (query_embedding.length != EMBEDDING_DIMENSIONS) {
        return HttpResponse.json({ message: ERROR_MESSAGE_BAD_REQUEST }, { status: 500 });
      }

      if (match_threshold != VECTOR_DB_THRESHOLD || match_count != VECTOR_DB_MATCH_COUNT) {
        return HttpResponse.json({ message: ERROR_MESSAGE_UNEXPECTED }, { status: 500 });
      }

      return HttpResponse.json(dbResult);
    },
  ),

  http.post<never, { encoding_format?: string; input: string }>(
    `${AI_URL}/${getAIModel()}`,
    async ({ request }) => {
      return HttpResponse.json({
        object: "list",
        data: [{ object: "embedding", index: 0 }],
      });
    },
  ),

  http.post<never, { formData: MovieFormData }>(`/api/movies`, async ({ request }) => {
    return HttpResponse.json({
      object: "list",
      data: [{ object: "embedding", index: 0 }],
    });
  }),
];

// Set up server
const server = setupServer(...restHandlers);

server.listen({ onUnhandledRequest: "error" });

// Drop per-test overrides so handlers can't leak between tests.
afterEach(() => server.resetHandlers());

afterAll(() => server.close());
