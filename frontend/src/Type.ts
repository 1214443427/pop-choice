import {
  MovieFormSchema,
  type MovieFormData,
  type MovieResponseData,
  type PersonFormData,
} from "@shared/type";
import type z from "zod";

export type FormState =
  | {
      phase: "result";
      success: true;
      movieRecommendations: MovieResponseData;
      recommendationIndex: number;
    }
  | {
      phase: "result";
      success: false;
      error: {
        code: number;
        message: string;
      };
    }
  | {
      phase: "question";
      valid: true;
      step: "start";
    }
  | {
      phase: "question";
      valid: false;
      step: "start";
      defaultValue: StartFormType;
      error: {
        path: string;
        message: string;
      };
    }
  | {
      phase: "question";
      valid: true;
      step: "person";
      formData: MovieFormData;
      page: number;
    }
  | {
      phase: "question";
      valid: false;
      step: "person";
      formData: MovieFormData;
      page: number;
      defaultValue: PersonFormData;
      error: {
        path: string;
        message: string;
      };
    };

export const StartFormSchema = MovieFormSchema.shape.startData;

export type StartFormType = z.infer<typeof StartFormSchema>;
