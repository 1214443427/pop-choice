import React, { useActionState } from "react";
import hero from "./assets/hero.png";
import spinner from "./assets/spinner.svg";
import "./App.css";
import Form from "./components/Form";
import type { MovieResponseData } from "@shared/type";

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
    };

function App() {
  const [state, formAction, isPending] = useActionState(handleFormSubmit, { phase: "question" });
  async function handleFormSubmit(prevState: FormState, data: FormData): Promise<FormState> {
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
        const movies = (await result.json()) as MovieResponseData;
        // const movie = {
        //   title: "The Martian",
        //   poster: "https://image.tmdb.org/t/p/w500/u8u3KVq0qfJYmNDsaTVOXy4So6f.jpg",
        //   description:
        //     "The inspiring story of an astronaut stranded on Mars who needs to rely on his ingenuity to come back to Earth",
        // };
        if (!movies) {
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
      if (
        !prevState.success ||
        prevState.movieRecommendations.length - 1 <= prevState.recommendationIndex
      ) {
        return {
          phase: "question",
        };
      }
      return {
        ...prevState,
        recommendationIndex: (prevState.recommendationIndex += 1),
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
            <h2 className="movie-title">
              {state.movieRecommendations[state.recommendationIndex].title}
              {state.movieRecommendations[state.recommendationIndex].year &&
                ` (${state.movieRecommendations[state.recommendationIndex].year})`}
            </h2>
            <img
              className="movie-image"
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
