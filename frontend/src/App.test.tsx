import { test, expect, describe } from "vitest";
import { fireEvent, getByRole, render, screen } from "@testing-library/react";
import { userEvent, type UserEvent } from "@testing-library/user-event";
import Hero from "./assets/hero.png";

import App from "./App";
import { apiCalled } from "./test/setup";
import type { MovieFormData } from "@shared/type";

async function progressToPersonForm(user: UserEvent, person: Number, time: string) {
  const peopleCountTextbox = screen.getByPlaceholderText(/how many people/i);
  const timeTextbox = screen.getByPlaceholderText(/how much time/i);
  const actionButton = screen.getByRole("button");
  await user.type(peopleCountTextbox, String(person));
  await user.type(timeTextbox, time);
  await user.click(actionButton);
}

describe("App renders as expected.", () => {
  test("displays the app name and a form on render", () => {
    render(<App />);
    expect(screen.getByText("PopChoice")).toBeInTheDocument();
    expect(screen.getByRole("form")).toBeInTheDocument();
  });
});

const clearForm = async (user: UserEvent) => {
  const movieTextbox = screen.getByPlaceholderText(/describe your favorite movie/i);
  const actorTextbox = screen.getByPlaceholderText(/maybe your favorite actor/i);

  await user.clear(movieTextbox);
  await user.clear(actorTextbox);
};

const fill = async (user: UserEvent) => {
  const movieTextbox = screen.getByPlaceholderText(/describe your favorite movie/i);
  const classicRadio = screen.getByRole("radio", { name: "classic" });
  const inspiringRadio = screen.getByRole("radio", { name: "inspiring" });
  const actorTextbox = screen.getByPlaceholderText(/maybe your favorite actor/i);

  await user.type(movieTextbox, "Super Mario Bros");
  await user.type(actorTextbox, "Tom");
  await user.click(classicRadio);
  await user.click(inspiringRadio);

  const submitButton = screen.getByRole("button");
  await user.click(submitButton);
};

describe("App", () => {
  test("Multi-person App flow", async () => {
    const user = userEvent.setup();
    render(<App />);
    const actionButton = screen.getByRole("button");
    await progressToPersonForm(user, 2, "2 hours");

    expect(screen.getByText("1")).toBeInTheDocument();
    await fill(user);

    await clearForm(user);
    //This is only required because testing libraries has not updated to React 19. The form clears itself automatically, as seen in later tets.

    expect(await screen.findByText("2")).toBeInTheDocument();
    await fill(user);

    const expectedDataFormat: MovieFormData = {
      startData: { peopleCount: 2, timeAvailable: "2 hours" },
      personData: [
        {
          favoriteMovie: "Super Mario Bros",
          period: "classic",
          mood: "inspiring",
          islandPerson: "Tom",
        },
        {
          favoriteMovie: "Super Mario Bros",
          period: "classic",
          mood: "inspiring",
          islandPerson: "Tom",
        },
      ],
    };
    expect(apiCalled).toHaveBeenCalledOnce();
    expect(apiCalled).toHaveBeenCalledWith(expectedDataFormat);

    expect(screen.getByText(/Movie Title 1/)).toBeInTheDocument();
    expect(screen.getByText(/\(2000\)/)).toBeInTheDocument();
    expect(screen.getByText("Movie description 1")).toBeInTheDocument();
    const image = (await screen.findByRole("img")) as HTMLImageElement;
    expect(image.src).toBe("https://placehold.co/600x400");

    await user.click(actionButton);
    expect(screen.getByText(/Movie Title 2/)).toBeInTheDocument();
    expect(screen.getByText("Movie description 2")).toBeInTheDocument();
    expect(await screen.findByRole("img")).toHaveAttribute("src", Hero);

    await user.click(actionButton);
    expect(screen.getByText(/PopChoice/i)).toBeInTheDocument();
  });

  test("The form correctly resets after each page", async () => {
    const user = userEvent.setup();
    render(<App />);
    await progressToPersonForm(user, 3, "3h");
    expect(screen.getByText("1")).toBeInTheDocument();
    await fill(user);

    expect(screen.getByText("2")).toBeInTheDocument();
    const inputBox = screen.getByRole("textbox", {
      name: "What’s your favorite movie and why?",
    });
    expect(inputBox).toHaveValue("");
    expect(
      screen.getByRole("textbox", {
        name: "Which famous film person would you love to be stranded on an island with and why?",
      }),
    ).toHaveValue("");

    const radioButtons = screen.getAllByRole("radio");
    radioButtons.forEach((button) => {
      expect(button).not.toBeChecked();
    });
  });

  test("The form repopulates after failed for submission attempt.", async () => {
    const user = userEvent.setup();
    render(<App />);
    const peopleCountTextbox = screen.getByPlaceholderText(/how many people/i);
    const timeTextbox = screen.getByPlaceholderText(/how much time/i);
    const form = screen.getByRole("form");
    await user.type(peopleCountTextbox, "not-int");
    await user.type(timeTextbox, "2h");

    fireEvent.submit(form);
    expect(timeTextbox).toHaveValue("2h");

    await user.clear(peopleCountTextbox);
    await user.type(peopleCountTextbox, "2");
    fireEvent.submit(form);

    expect(screen.getByText("1")).toBeInTheDocument();
    const actorTextbox = screen.getByPlaceholderText(/maybe your favorite actor/i);
    const scaryRadio = screen.getByRole("radio", { name: "scary" });
    await user.type(actorTextbox, "Tom");
    await user.click(scaryRadio);
    fireEvent.submit(form);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(actorTextbox).toHaveValue("Tom");
    expect(scaryRadio).toBeChecked();
  });

  test("Only one radio group should be checked at a time", async () => {
    const user = userEvent.setup();
    render(<App />);
    await progressToPersonForm(user, 1, "1h");
    const funRadio = screen.getByRole("radio", { name: "fun" });
    const seriousRadio = screen.getByRole("radio", { name: "serious" });
    const inspiringRadio = screen.getByRole("radio", { name: "inspiring" });
    const scaryRadio = screen.getByRole("radio", { name: "scary" });
    const classicRadio = screen.getByRole("radio", { name: "classic" });
    const newRadio = screen.getByRole("radio", { name: "new" });

    await user.click(funRadio);
    await user.click(seriousRadio);
    await user.click(inspiringRadio);
    await user.click(scaryRadio);

    expect(funRadio).not.toBeChecked();
    expect(seriousRadio).not.toBeChecked();
    expect(inspiringRadio).not.toBeChecked();
    expect(scaryRadio).toBeChecked();

    await user.click(classicRadio);
    await user.click(newRadio);

    expect(classicRadio).not.toBeChecked();
    expect(newRadio).toBeChecked();
  });
});
