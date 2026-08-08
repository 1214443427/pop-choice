import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import type { MovieFormData } from "@shared/type";
// Clean up the DOM after each test
afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.restoreAllMocks();
});

export const apiCalled = vi.fn();

export const restHandlers = [
  http.post<never, MovieFormData>(`http://localhost:3000/api/movies`, async ({ request }) => {
    const data = await request.json();
    apiCalled(data);
    return HttpResponse.json([
      {
        title: "Movie Title 1",
        description: "Movie description 1",
        year: 2000,
        poster: "https://placehold.co/600x400",
      },
      {
        title: "Movie Title 2",
        description: "Movie description 2",
      },
    ]);
  }),
];

const server = setupServer(...restHandlers);

server.listen({
  onUnhandledRequest(request, print) {
    const { hostname } = new URL(request.url);

    if (hostname === "127.0.0.1" || hostname === "localhost" || hostname === "::1") return;

    print.error();
  },
});

afterAll(() => server.close());
