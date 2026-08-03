import * as z from "zod";
import { MAX_PEOPLE } from "@shared/const.js";

export const PersonFormSchema = z.object({
  favoriteMovie: z.string(),
  period: z.enum(["new", "classic"]),
  mood: z.enum(["fun", "serious", "inspiring", "scary"]),
  islandPerson: z.string(),
});

export const MovieFormSchema = z
  .object({
    startData: z.object({
      peopleCount: z.number().min(1).max(MAX_PEOPLE),
      timeAvailable: z.string(),
    }),
    personData: z.array(PersonFormSchema),
  })
  .refine((data) => data.personData.length === data.startData.peopleCount);

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
