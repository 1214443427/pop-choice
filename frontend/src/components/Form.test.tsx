import { test, expect, describe } from "vitest";
import { render, screen } from "@testing-library/react";

import Form from "./Form";
import type { FormState } from "../type";

describe("Form renders expected fields", () => {
  test("start form includes two inputs and a button.", () => {
    const initialState = {
      phase: "question",
      step: "start",
      valid: true,
    };
    render(
      <Form state={initialState as unknown as FormState} formAction={() => {}} isPending={false} />,
    );
    expect(screen.getByPlaceholderText("How many people? (Up to 10)")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("How much time do you have?")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
