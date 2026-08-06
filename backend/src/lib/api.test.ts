import { describe, it, expect } from "vitest";
import { createEmbeddingFromPrompt, fetchPoster, getDocumentsFromDB } from "./api.js";
import {
  EMBEDDING_DIMENSIONS,
  ERROR_MESSAGE_BAD_REQUEST,
  ERROR_MESSAGE_UNEXPECTED,
  FASTNFURIOUS_PATH,
  FIGHTING_CLUB_PATH,
  MARIO_PATH,
} from "../test/testConst.js";

describe("fetchPoster", () => {
  it("Matching by query name", async () => {
    const data = await fetchPoster({ title: "Mario", description: "", year: 2025 });
    expect(data).toContain(MARIO_PATH);
  });
  it("Matching Fighting Club, the more known movie with a poster", async () => {
    const data = await fetchPoster({ title: "Fighting Club", description: "" });
    expect(data).toContain(FIGHTING_CLUB_PATH);
  });
  it("Matching Fighting Club by year to find a lesser known film, should not return a poster.", async () => {
    const data = await fetchPoster({ title: "Fighting Club", description: "", year: 2006 });
    expect(data).toEqual(undefined);
  });
  it("Searching for `Fast & Furious` should encode the `&` correctly", async () => {
    const data = await fetchPoster({ title: "Fast & Furious", description: "" });
    expect(data).toContain(FASTNFURIOUS_PATH);
  });
  it("The function should fail silently on error. ", async () => {
    const data = await fetchPoster({ title: "error", description: "" });
    expect(data).toEqual(undefined);
  });
});

describe("createEmbeddingFromPrompt", () => {
  it("The function should create an embedding with 1536 numbers", async () => {
    const embedding = await createEmbeddingFromPrompt("Mock user prompt");
    expect(embedding).toHaveLength(1536);
    expect(embedding.every((num) => typeof num === "number")).toBe(true);
  });
  it("The function should throw if an error occurs.", async () => {
    await expect(createEmbeddingFromPrompt("error")).rejects.toThrow();
  });
});

describe("getDocumentsFromDB", () => {
  it("The function should return error from upstream.", async () => {
    const { data, error } = await getDocumentsFromDB([1]);
    expect(error).not.toBe(null);
    expect(error?.message).toBe(ERROR_MESSAGE_BAD_REQUEST);
    expect(data).toBe(null);
  });
  it("The function should return data when passing an embedding.", async () => {
    const embedding = await createEmbeddingFromPrompt("Mock user prompt");
    const { data, error } = await getDocumentsFromDB(embedding);
    expect(error).toBe(null);
    expect(data).not.toBe(null);
  });
});
