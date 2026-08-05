import { describe, it, expect } from "vitest";
import { fetchPoster } from "./api.js";
import { FIGHTING_CLUB_PATH, MARIO_PATH } from "../test/testConst.js";

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
});
