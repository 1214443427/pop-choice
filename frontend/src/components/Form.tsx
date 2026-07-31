import type { FormState } from "../Type";
import InputField from "./InputField";

function Form({
  state,
  formAction,
  isPending,
}: {
  state: FormState;
  formAction: (payload: FormData) => void;
  isPending: boolean;
}) {
  return (
    <form action={formAction}>
      {state.phase === "question" &&
        (state.step === "start" ? (
          <fieldset>
            <input
              className="text-input"
              placeholder="How many people?"
              name="people"
              type="number"
              min={1}
              required
            />
            <input
              className="text-input"
              placeholder="How much time do you have?"
              name="time"
              required
            />
          </fieldset>
        ) : (
          <fieldset>
            <InputField
              label="What’s your favorite movie and why?"
              placeholder="Describe your favorite movie..."
              name="favoriteMovie"
            />
            <InputField
              label="Are you in the mood for something new or a classic?"
              name="period"
              radioOptions={["new", "classic"]}
            />
            <InputField
              label="What are you in the mood for?"
              name="mood"
              radioOptions={["fun", "serious", "inspiring", "scary"]}
            />
            <InputField
              label="Which famous film person would you love to be stranded on an island with and why?"
              placeholder="Maybe your favorite actor..."
              name="islandPerson"
            />
          </fieldset>
        ))}

      <button className="form-button" disabled={isPending}>
        {state.phase === "question"
          ? "Get Movie"
          : state.success && state.recommendationIndex < state.movieRecommendations.length - 1
            ? "Next Movie"
            : "Go Again"}
      </button>
    </form>
  );
}

export default Form;
