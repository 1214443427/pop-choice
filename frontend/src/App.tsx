import React, { useActionState } from "react";
import hero from "./assets/hero.png";
import spinner from "./assets/spinner.svg";
import "./App.css";
import Form from "./components/Form";
import type { MovieData } from "@shared/type";

export type FormState =
  | {
      phase: "result";
      success: true;
      movieRecommendation: MovieData;
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
    };

function App() {
  const [state, formAction, isPending] = useActionState(handleFormSubmit, { phase: "question" });
  async function handleFormSubmit(prevState: FormState, data: FormData): Promise<FormState> {
    console.log(prevState);
    if (prevState.phase === "question") {
      try {
        const result = await fetch("http://localhost:3000/api/movies", {
          method: "POST",
          headers: { "Content-Type": "application/JSON" },
          body: JSON.stringify(Object.fromEntries(data)),
        });
        if (!result.ok) {
          const error = (await result.json()) as { message: string };
          return {
            phase: "result",
            success: false,
            error: {
              code: result.status,
              message: error.message,
            },
          };
        }
        const movie = (await result.json()) as MovieData;
        // const movie = {
        //   title: "The Martian",
        //   poster: "",
        //   description:
        //     "The inspiring story of an astronaut stranded on Mars who needs to rely on his ingenuity to come back to Earth",
        // };
        if (!movie) {
          return {
            phase: "result",
            success: false,
            error: {
              code: 400,
              message: "Sorry, we couldn't recommend a movie for you.",
            },
          };
        }

        return {
          phase: "result",
          success: true,
          movieRecommendation: movie,
        };
      } catch (error) {
        return {
          phase: "result",
          success: false,
          error: {
            code: 500,
            message: "We couldn't establish a connection with the server.",
          },
        };
      }
    } else {
      return {
        phase: "question",
      };
    }
  }
  return (
    <div className="background">
      <main className="app-container">
        {state.phase === "question" ? (
          <div className="hero">
            <img src={hero} />
            <h1>PopChoice</h1>
          </div>
        ) : state.success ? (
          <section className="movie-section">
            <h2 className="movie-title">{state.movieRecommendation.title}</h2>
            <img className="movie-image" src={state.movieRecommendation.poster} />
            <p className="movie-description">{state.movieRecommendation.description}</p>
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
