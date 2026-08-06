import { describe, expect, it, vi } from "vitest";
import { MovieResponseSchema, type MovieFormData } from "@shared/type.js";

import { app } from "./app.js";
import request from "supertest";
import { chatCalled, embeddingCalled, server } from "./test/setup.js";
import { http, HttpResponse } from "msw";
import { AI_URL, SUPABASE_URL } from "./test/testConst.js";

const personFormData: MovieFormData = {
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

describe("POST to /api/movies", () => {
  it("The end point should return correctly formatted data", async () => {
    const response = await request(app).post(`/api/movies`).send(personFormData);

    expect(response.status).toBe(200);
    expect(chatCalled).toHaveBeenCalled();
    expect(MovieResponseSchema.safeParse(response.body).success).toBe(true);
  });

  it("The end point should reject incorrectly formatted input, and not attempt to embed the data", async () => {
    const response = await request(app).post(`/api/movies`).send({});
    expect(response.status).toBe(400);
    expect(embeddingCalled).not.toHaveBeenCalled();
  });

  it("The end point should handle DB error gracefully, and not make an LLM call.", async () => {
    server.use(
      http.post(`${SUPABASE_URL}/rest/v1/rpc/match_documents`, async () => {
        return HttpResponse.json(
          {
            errorMessage: "Not found",
          },
          { status: 500 },
        );
      }),
    );
    const response = await request(app).post(`/api/movies`).send(personFormData);
    expect(response.status).toBe(500);
    expect(chatCalled).not.toHaveBeenCalled();
  });

  it("The end point should handle embedding error gracefully.", async () => {
    server.use(
      http.post(`${AI_URL}/embeddings`, async () => {
        return HttpResponse.json(
          {
            errorMessage: "Not sufficient funds",
          },
          { status: 402 },
        );
      }),
    );
    const response = await request(app).post(`/api/movies`).send(personFormData);
    expect(response.ok).toBe(false);
    expect(chatCalled).not.toHaveBeenCalled();
  });

  it("The end point should handle LLM error gracefully.", async () => {
    server.use(
      http.post(`${AI_URL}/chat/completions`, async () => {
        return HttpResponse.json(
          {
            errorMessage: "Not sufficient funds",
          },
          { status: 402 },
        );
      }),
    );
    const response = await request(app).post(`/api/movies`).send(personFormData);
    expect(response.ok).toBe(false);
  });

  it("The end point should handle refusal gracefully", async () => {
    server.use(
      http.post(`${AI_URL}/chat/completions`, async () => {
        return HttpResponse.json({ choices: [{ message: { refusal: "Not safe" } }] });
      }),
    );
    const response = await request(app).post(`/api/movies`).send(personFormData);
    expect(response.ok).toBe(false);
    expect(response.body.message).toBe("Not safe");
  });
  it("The end point should handle empty response array gracefully", async () => {
    server.use(
      http.post(`${AI_URL}/chat/completions`, async () => {
        return HttpResponse.json({ choices: [] });
      }),
    );
    const response = await request(app).post(`/api/movies`).send(personFormData);
    expect(response.ok).toBe(false);
    expect(response.body.message).toContain("Sorry");
  });
  it("The end point should handle responses with missing content gracefully", async () => {
    server.use(
      http.post(`${AI_URL}/chat/completions`, async () => {
        return HttpResponse.json({ choices: [{ message: { content: undefined } }] });
      }),
    );
    const response = await request(app).post(`/api/movies`).send(personFormData);
    expect(response.ok).toBe(false);
    expect(response.body.message).toContain("Sorry");
  });
});
