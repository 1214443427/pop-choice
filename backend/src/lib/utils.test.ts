import type { MovieFormData } from "@shared/type.js";
import { describe, it, expect } from "vitest";
import { getUserPrompt } from "./utils.js";

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

describe("Testing getUserPrompt", () => {
  it("The function should throw error if the data is malformed.", () => {
    expect(() => {
      getUserPrompt({ ...personFormData, startData: {} } as unknown as MovieFormData);
    }).toThrow();
    expect(() => {
      getUserPrompt({ ...personFormData, startData: { peopleCount: 1, timeAvailable: "2h" } });
    }).toThrow();
    expect(() => {
      getUserPrompt({
        ...personFormData,
        personData: personFormData.personData[0],
      } as unknown as MovieFormData);
    }).toThrow();
  });

  it("The function should return a user prompt with 2 correctly indexed `Person` Blocks", () => {
    expect(getUserPrompt(personFormData)).toContain("--- Person 1");
    expect(getUserPrompt(personFormData)).toContain("--- Person 2");
    expect(getUserPrompt(personFormData)).not.toContain("--- Person 0");
  });

  it("There should be a newline divider between the first person and the second person", () => {
    expect(getUserPrompt(personFormData)).toContain("Matt Damon\n --- Person");
  });

  it("The returned user prompt should contain the correct form data", () => {
    expect(getUserPrompt(personFormData)).toContain("The Martian");
    expect(getUserPrompt(personFormData)).toContain("Rescue Dawn");
    expect(getUserPrompt(personFormData)).toContain("inspiring");
    expect(getUserPrompt(personFormData)).toContain("new");
  });
});
