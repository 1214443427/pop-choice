import { useActionState } from "react";
import hero from "./assets/hero.png";
import spinner from "./assets/spinner.svg";
import "./App.css";
import Form from "./components/Form";
import { StartFormSchema, type FormState } from "./Type";
import { APIError, fetchMovies } from "./api/movies";
import { PersonFormSchema, type MovieFormData, type PersonFormData } from "@shared/type";
import { clampMaxPeople } from "@shared/utils";
import type z from "zod";
import { ZodError } from "zod/v4";

type QuestionStates = Extract<FormState, { phase: "question" }>;

function App() {
  const [state, formAction, isPending] = useActionState(handleFormSubmit, {
    phase: "question",
    step: "start",
    valid: true,
  });

  async function requestMovieRecommendations(data: MovieFormData): Promise<FormState> {
    try {
      // Fetches movie recommendation from the Backend. An movie object looks like this.
      // const movie = {
      //   title: "The Martian",
      //   poster: "https://image.tmdb.org/t/p/w500/u8u3KVq0qfJYmNDsaTVOXy4So6f.jpg",
      //   description:
      //     "The inspiring story of an astronaut stranded on Mars who needs to rely on his ingenuity to come back to Earth",
      // };
      const movies = await fetchMovies(data);
      if (movies.length === 0) {
        return {
          phase: "result",
          success: false,
          error: {
            code: 400,
            message: "Sorry, we couldn't recommend any movie for you.",
          },
        };
      }
      return {
        phase: "result",
        success: true,
        movieRecommendations: movies,
        recommendationIndex: 0,
      };
    } catch (error) {
      if (error instanceof APIError) {
        return {
          phase: "result",
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        };
      }
    }
    return {
      phase: "result",
      success: false,
      error: {
        code: 500,
        message: "Sorry, there is an issue on our end. ",
      },
    };
  }

  function validateData<T extends z.ZodType>(data: unknown, schema: T): z.output<T> {
    const parseResult = schema.safeParse(data);
    if (!parseResult.success) {
      throw parseResult.error;
    }
    return parseResult.data;
  }

  function getZodErrorPath(error: unknown) {
    return error instanceof ZodError ? String(error.issues[0].path.at(-1)) : "generic";
  }

  function getZodErrorMessage(error: unknown) {
    return error instanceof ZodError
      ? String(error.issues[0].message)
      : "The app encountered an unexpected input. Please verify you have inputted everything correctly.";
  }

  async function handleFormAdvance(state: QuestionStates, data: FormData): Promise<FormState> {
    if (state.step === "start") {
      // console.log(data.get("peopleCount"));
      const startData = {
        peopleCount: clampMaxPeople(Number(data.get("peopleCount"))),
        timeAvailable: String(data.get("timeAvailable")),
      };
      let parsedData;
      try {
        parsedData = validateData(startData, StartFormSchema);
      } catch (error) {
        return {
          phase: "question",
          valid: false,
          step: "start",
          defaultValue: startData,
          error: {
            path: getZodErrorPath(error),
            message: getZodErrorMessage(error),
          },
        };
      }
      return {
        phase: "question",
        step: "person",
        valid: true,
        formData: {
          startData: parsedData,
          personData: [],
        },
        page: 1,
      };
    }

    const submittedPersonData = Object.fromEntries(data) as PersonFormData;
    let validatedData;
    try {
      validatedData = validateData(submittedPersonData, PersonFormSchema);
    } catch (error) {
      return {
        ...state,
        valid: false,
        error: {
          path: getZodErrorPath(error),
          message: getZodErrorMessage(error),
        },
        defaultValue: submittedPersonData,
      };
    }

    const newFormData = {
      ...state.formData,
      personData: [...state.formData.personData, validatedData],
    };
    if (state.formData.startData.peopleCount > state.page) {
      return {
        ...state,
        valid: true,
        formData: newFormData,
        page: state.page + 1,
      };
    }
    return await requestMovieRecommendations(newFormData);
  }

  async function handleFormSubmit(prevState: FormState, data: FormData): Promise<FormState> {
    if (prevState.phase === "question") {
      return await handleFormAdvance(prevState, data);
    } else {
      //reset the form if the user has reached the last movie, or the request failed.
      if (
        !prevState.success ||
        prevState.movieRecommendations.length - 1 <= prevState.recommendationIndex
      ) {
        return {
          phase: "question",
          step: "start",
          valid: true,
        };
      }
      return {
        ...prevState,
        recommendationIndex: prevState.recommendationIndex + 1,
      };
    }
  }
  return (
    <div className="background">
      <main className="app-container">
        {state.phase === "question" ? (
          <div className="hero">
            <img src={hero} />
            <h1> {state.step == "start" ? "PopChoice" : state.page} </h1>
          </div>
        ) : state.success ? (
          <section className="movie-section">
            <h2 className="movie-title">
              {state.movieRecommendations[state.recommendationIndex].title}
              {state.movieRecommendations[state.recommendationIndex].year &&
                ` (${state.movieRecommendations[state.recommendationIndex].year})`}
            </h2>
            <img
              className="movie-image"
              key={state.recommendationIndex}
              src={state.movieRecommendations[state.recommendationIndex].poster ?? hero}
            />
            <p className="movie-description">
              {state.movieRecommendations[state.recommendationIndex].description}
            </p>
          </section>
        ) : (
          <div className="error-page">
            <h2>We have encountered an error</h2>
            <h3>{state.error.code}</h3>
            <p>{state.error.message}</p>
          </div>
        )}
        {isPending && (
          <div className="loading">
            <img src={spinner} />
            <p>Thinking...</p>
          </div>
        )}
        <section>
          <Form state={state} formAction={formAction} isPending={isPending} />
        </section>
      </main>
    </div>
  );
}

export default App;
