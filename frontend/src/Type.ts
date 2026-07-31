import type { MovieFormData, MovieResponseData } from "@shared/type";

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
      step: "start";
    }
  | {
      phase: "question";
      step: "person";
      formData: MovieFormData;
      page: number;
    };
