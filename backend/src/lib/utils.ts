import { MovieFormSchema, type MovieFormData } from "@shared/type.js";
import type { Request } from "express";
import * as z from "zod";

export function getEmbedModel() {
  const embedModel = process.env.AI_EMBED_MODEL;
  if (!embedModel) {
    console.error("missing embed model");
    throw Error("missing embed model");
  }
  return embedModel;
}

export function getAIModel() {
  const aiModel = process.env.AI_MODEL;
  if (!aiModel) {
    console.error("missing AI model");
    throw Error("missing AI model");
  }
  return aiModel;
}

type Role = "user" | "assistant" | "system" | "developer";

interface Message {
  role: Role;
  content: string;
}

export function getInitialPrompts(): Message[] {
  const messages: Message[] = [
    {
      role: "system",
      content:
        "You are a helpful AI that gives the user a reason to watch a movie provided by our services. The user might be a single individual, or a group of people. You will recommend movies for them to watch as a whole group. Your user prompt will consists of the users' favorite movies, favorite actors, their mood for movie type, and most importantly, our list of available movies, filtered based on the user's interest. You will recommend movies from our list to the user. If the list is empty, suggest our latests release: Toy Story 5 released in 2026. Inform the user that we don't have any recommendations for now and try this new release in the description. If the list is not empty, generate a short description (around 20 words) for each movie. The description must be based on our list. Your ",
    },
    {
      role: "user",
      content: `This request came from a 2 person group. Their planned watch time is: 2 hours. Person 1: I am looking for something classic.\nIt should be fun.\nMy favorite movie is: the grand budapest hotel. I like the humorous nature with a hint of history. \nMy favorite actor is: the guy from Batman. Person 2: I am looking for something new. \nIt should be inspiring.\n My favorite movie is: Shawshank's Redemption because it of its inspiring imagery. \nFilm person that I would love to be stranded on an island with:Brad Pitt  ---LIST: Jojo Rabbit (2019) Jojo is a lonely German boy who discovers that his single mother is hiding a Jewish girl in their attic. Aided only by his imaginary friend -- Adolf Hitler -- Jojo must confront his blind nationalism as World War II continues to rage on. |||  Green Book (2018)  Dr. Don Shirley is a world-class African-American pianist who's about to embark on a concert tour in the Deep South in 1962. In need of a driver and protection, Shirley recruits Tony Lip, a tough-talking bouncer from an Italian-American neighborhood in the Bronx. Despite their differences, the two men soon develop an unexpected bond while confronting racism and danger in an era of segregation. |||  American Hustle(2013) Irving Rosenfeld (Christian Bale) dabbles in forgery and loan-sharking, but when he falls for fellow grifter Sydney Prosser (Amy Adams), things change in a big way. Caught red-handed by FBI agent Richie DiMaso (Bradley Cooper), Irv and Sydney are forced to work undercover as part of DiMaso's sting operation to nail a New Jersey mayor (Jeremy Renner). Meanwhile, Irv's jealous wife (Jennifer Lawrence) may be the one to bring everyone's world crashing down. Based on the 1970s Abscam case. `,
    },
    {
      role: "assistant",
      content: JSON.stringify({
        movieTitles: ["Jojo Rabbit", "Green Book", "American Hustle"],
        movies: [
          {
            title: "Jojo Rabbit",
            year: 2019,
            description:
              "A lonely German boy in the last days of WWII takes life advice from his " +
              "imaginary friend — a buffoonish Adolf Hitler",
          },
          {
            title: "Green Book",
            year: 2018,
            description:
              "A 1962 road trip through the segregated South, built on the " +
              "chemistry between a refined Black concert pianist and the brash Bronx bouncer.",
          },
          {
            title: "American Hustle",
            year: 2013,
            description:
              "Christian Bale — your Batman — disappears completely into a paunchy, " +
              "combover-sporting con artist. Explore an underworld where everyone's scheming against everyone else.",
          },
        ],
      }),
    },
    {
      role: "user",
      content: `This request came from a 1 person group. Their planned watch time is: 2.5 hours. Person 1: I am looking for something classic.\nIt should be serious.\n My favorite movie is: the one with an astronaut and spaceship.\n Film person that I would love to be stranded on an island with:: Jeff ---LIST: `,
    },
    {
      role: "assistant",
      content: JSON.stringify({
        movieTitles: ["Toy Story 5"],
        movies: [
          {
            title: "Toy Story 5",
            year: 2026,
            description:
              "I can't find anything, but you should definitely check out our latest addition! ",
          },
        ],
      }),
    },
  ];
  return messages;
}

export function getUserPrompt(req: Request<any, any, MovieFormData>): string {
  const parsedData = MovieFormSchema.safeParse(req.body);
  // console.log(parsedData);
  if (parsedData.success === false) {
    throw new Error("Client sent malformed data.");
  }
  const { startData, personData } = parsedData.data;
  let userPrompt = `This request came from a ${startData.peopleCount} person group. Their planned watch time is: ${startData.timeAvailable}. `;
  personData.forEach((person, index) => {
    const { period, mood, favoriteMovie, islandPerson } = person;
    userPrompt += `--- Person ${index + 1}: `;
    userPrompt += `I am looking for something ${period}.\n It should be ${mood}.\n My favorite movie is: ${favoriteMovie}\n Film person that I would love to be stranded on an island with: ${islandPerson}`;
  });
  return userPrompt;
}
