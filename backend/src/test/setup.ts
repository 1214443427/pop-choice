import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { afterAll, beforeAll } from "vitest";
import { FIGHTING_CLUB_PATH, MARIO_PATH } from "./testConst.js";
import { TMDB_URL } from "../const.js";

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

export const restHandlers = [
  http.get(TMDB_URL, ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get("query");
    const year = url.searchParams.get("primary_release_year");
    console.log(query, year);

    if (query == "Mario") {
      return HttpResponse.json(movieByQuery);
    }

    const result = year && year == "2006" ? movieResultBy2006 : movieResult;

    return HttpResponse.json(result);
  }),
];

// Set up server
const server = setupServer(...restHandlers);

// Establish the request interception layer before all tests.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

// Clean up after all tests are done, preventing this
// interception layer from affecting irrelevant tests.
afterAll(() => server.close());
