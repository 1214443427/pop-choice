import * as z from "zod";
import { MAX_PEOPLE } from "./const.js";

export const PersonFormSchema = z.object({
  favoriteMovie: z.string().trim().min(1, { message: "This field cannot be empty" }),
  period: z.enum(["new", "classic"], "Please select one of the above options."),
  mood: z.enum(["fun", "serious", "inspiring", "scary"], "Please select one of the above options."),
  islandPerson: z.string().trim().min(1, { message: "This field cannot be empty" }),
});

export const MovieFormSchema = z
  .object({
    startData: z.object({
      peopleCount: z.number("Please enter a number.").min(1).max(MAX_PEOPLE),
      timeAvailable: z.string().trim().min(1, { message: "This field cannot be empty" }),
    }),
    personData: z.array(PersonFormSchema),
  })
  .refine((data) => data.personData.length === data.startData.peopleCount, {
    message: "The number of forms submitted does not match the people count.",
    path: ["personData"],
  });

export const MovieResponseSchema = z.array(
  z.object({
    title: z.string(),
    year: z.number().optional().nullable(),
    poster: z.string().optional().nullable(),
    description: z.string(),
  }),
);

export type PersonFormData = z.infer<typeof PersonFormSchema>;
// export type PersonFormData = {
//   favoriteMovie: string;
//   period: "new" | "classic";
//   mood: "fun" | "serious" | "inspiring" | "scary";
//   islandPerson: string;
// };

export type MovieFormData = z.infer<typeof MovieFormSchema>;
// export interface MovieFormData {
//   startData: {
//     peopleCount: number;
//     timeAvailable: string;
//   };
//   personData: PersonFormData[];
// }

export type MovieResponseData = z.infer<typeof MovieResponseSchema>;
// export type MovieResponseData = {
//   title: string;
//   year?: number | undefined | null;
//   poster?: string | undefined | null;
//   description: string;
// }[];
