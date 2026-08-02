import type { MovieFormData, MovieResponseData } from "@shared/type";

export class APIError extends Error {
  code: number;
  constructor(code: number, message: string) {
    super();
    this.code = code;
    this.message = message;
  }
}

export async function fetchMovies(formData: MovieFormData): Promise<MovieResponseData> {
  let response;

  try {
    response = await fetch("http://localhost:3000/api/movies", {
      method: "POST",
      headers: { "Content-Type": "application/JSON" },
      body: JSON.stringify(formData),
    });
  } catch {
    throw new APIError(503, "We couldn't establish a connection with the server.");
  }

  //handle response outside of the try block so the error thrown is not immediately caught by the subsequent catch.
  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { message?: string };
    throw new APIError(response.status, error.message ?? response.statusText);
  }

  try {
    return (await response.json()) as MovieResponseData;
  } catch {
    throw new APIError(502, "Server sent a malformed response. ");
  }
}
