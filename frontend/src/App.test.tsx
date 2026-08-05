import { test, expect, describe } from "vitest";
import { render, screen } from "@testing-library/react";

import App from "./App";

describe("App renders as expected.", () => {
  test("displays the app name and a form on render", () => {
    render(<App />);
    expect(screen.getByText("PopChoice")).toBeInTheDocument();
    expect(screen.getByRole("form")).toBeInTheDocument();
  });
});
