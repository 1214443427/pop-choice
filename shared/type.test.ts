import { describe, it, expect } from "vitest";
import { MovieResponseSchema, PersonFormSchema, MovieFormSchema } from "./type.ts";

const personForm = {
  favoriteMovie: "The Martian",
  period: "new",
  mood: "serious",
  islandPerson: "Matt Damon",
};

describe("PersonFormSchema Testing", () => {
  it("Correctly formatted data should pass.", () => {
    expect(PersonFormSchema.safeParse(personForm).success).toBe(true);
  });
  it("Empty string should error.", () => {
    expect(PersonFormSchema.safeParse({ ...personForm, favoriteMovie: "" }).success).toBe(false);
  });
  it("Empty radio button should error.", () => {
    const { period, ...rest } = personForm;
    expect(PersonFormSchema.safeParse(rest).success).toBe(false);
  });
  it("String not defined in Enum should be rejected", () => {
    expect(PersonFormSchema.safeParse({ ...personForm, period: "futuristic" }).success).toBe(false);
  });
});

const movieForm = {
  startData: {
    peopleCount: 2,
    timeAvailable: "2 hours",
  },
  personData: [personForm, personForm],
};

describe("MovieFormSchema Testing", () => {
  it("Correctly formatted data should pass.", () => {
    expect(MovieFormSchema.safeParse(movieForm).success).toBe(true);
  });
  it.each([0, 11, 2.5, NaN, -1, "2"])("Invalid peopleCount (%s) should error", (n) => {
    expect(
      MovieFormSchema.safeParse({
        ...movieForm,
        startData: { peopleCount: n, timeAvailable: "2 hours" },
      }).success,
    ).toBe(false);
  });
  it("Missing timeAvailable should error", () => {
    expect(
      MovieFormSchema.safeParse({
        ...movieForm,
        startData: { peopleCount: 2, timeAvailable: "" },
      }).success,
    ).toBe(false);
  });
  it("Should error if peopleCount is not the same as the length of the personData array. ", () => {
    expect(
      MovieFormSchema.safeParse({
        ...movieForm,
        startData: { peopleCount: 1, timeAvailable: "2 hours" },
      }).success,
    ).toBe(false);
  });
  it("Malformed peopleData should fail.", () => {
    expect(
      MovieFormSchema.safeParse({
        startData: { peopleCount: 1, timeAvailable: "2 hours" },
        personData: personForm,
      }).success,
    ).toBe(false);

    const { mood, ...rest } = { ...personForm };
    expect(
      MovieFormSchema.safeParse({
        startData: { peopleCount: 1, timeAvailable: "2 hours" },
        personData: [rest],
      }).success,
    ).toBe(false);
  });
});

const movieResponses = [
  {
    title: "The Martian",
    year: 2015,
    poster: "https://placehold.co/600x400/EEE/31343C",
    description:
      "The inspiring story of an astronaut stranded on Mars who needs to rely on his ingenuity to come back to Earth",
  },
  {
    title: "Rescuer Dawn",
    year: 2006,
    poster: "https://placehold.co/600x400/EEE/31343C",
    description:
      "The incredible true story of Dieter Dengler epic struggle of survival after being shot down on a mission over Laos during the Vietnam War",
  },
];

function replaceProperty<T extends object, K extends keyof T>(
  array: T[],
  propertyName: K,
  newValue: any,
) {
  return array.map((obj) => ({ ...obj, [propertyName]: newValue }));
}

describe("MovieResponseSchema Testing", () => {
  it("Correctly formatted data should pass.", () => {
    expect(MovieResponseSchema.safeParse(movieResponses).success).toBe(true);
  });
  it("Response missing optional parameter should pass", () => {
    const { year, poster, ...rest } = movieResponses[0];
    expect(MovieResponseSchema.safeParse([rest, movieResponses[1]]).success).toBe(true);
  });
  it.each(["title", "description"] as const)(
    "Response missing necessary parameter should pass",
    (property) => {
      const { [property]: _removed, ...rest } = movieResponses[0];
      expect(MovieResponseSchema.safeParse([rest, movieResponses[1]]).success).toBe(false);
    },
  );
  it("Response with string year should fail", () => {
    const stringYearArray = replaceProperty(movieResponses, "year", "2026");
    expect(MovieResponseSchema.safeParse(stringYearArray).success).toBe(false);
  });
  it("Response with empty description should fail", () => {
    const newArray = replaceProperty(movieResponses, "description", undefined);
    expect(MovieResponseSchema.safeParse(newArray).success).toBe(false);
  });
});
