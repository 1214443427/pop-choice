import { test, describe, expect } from "vitest";
import { errorHandler, server } from "../test/setup";
import { http, HttpResponse } from "msw";
import { APIError, fetchMovies } from "./movies";
import { MovieResponseSchema, type MovieFormData } from "@shared/type";

const movieFormData: MovieFormData = {
  startData: {
    peopleCount: 2,
    timeAvailable: "2 hours",
  },
  personData: [
    {
      favoriteMovie: "The Martian",
      period: "new",
      mood: "fun",
      islandPerson: "Matt Damon",
    },
    {
      favoriteMovie: "Rescue Dawn",
      period: "classic",
      mood: "inspiring",
      islandPerson: "Christian Bale",
    },
  ],
};

describe("Fetch Movies logic", () => {
  test("The function should return data in the expected format", async () => {
    server.use(
      http.post(`/api/movies`, async () => {
        return HttpResponse.json([{ title: "Mario", description: "Some description" }]);
      }),
    );
    const response = await fetchMovies(movieFormData);
    expect(MovieResponseSchema.safeParse(response).success).toBe(true);
  });

  test("The function should throw a 503 error if the fetch failed.", async () => {
    server.use(
      http.post(`/api/movies`, async () => {
        return HttpResponse.error();
      }),
    );
    try {
      await fetchMovies(movieFormData);
      expect.fail("The function did not throw an error");
    } catch (error) {
      if (!(error instanceof APIError)) {
        expect.fail("The function did not throw the correct error format");
      }
      expect(error.code).toBe(503);
    }
  });

  test("The function should throw the same error code received from the server.", async () => {
    errorHandler(400, "Sorry, we couldn't recommend a movie for you.");
    try {
      await fetchMovies(movieFormData);
      expect.fail("The function did not throw an error");
    } catch (error) {
      if (!(error instanceof APIError)) {
        expect.fail("The function did not throw the correct error format");
      }
      expect(error.code).toBe(400);
      expect(error.message).toBe("Sorry, we couldn't recommend a movie for you.");
    }
  });

  test("The function should throw a 502 error when receiving a malformed response.", async () => {
    server.use(
      http.post(`/api/movies`, async () => {
        return HttpResponse.json({ message: "This is not a movie response." });
      }),
    );
    try {
      await fetchMovies(movieFormData);
      expect.fail("The function did not throw an error");
    } catch (error) {
      if (!(error instanceof APIError)) {
        expect.fail("The function did not throw the correct error format");
      }
      expect(error.code).toBe(502);
      expect(error.message).toContain("Server sent a malformed response.");
    }
  });
});
