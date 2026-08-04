import type { FormState } from "../Type";
import InputField from "./InputField";

function RadioOptions({
  options,
  name,
  isPending,
  restoredValue,
}: {
  options: string[];
  name: string;
  isPending: boolean;
  restoredValue: string;
}) {
  return (
    <div className="radio-buttons">
      {options.map((option, index) => (
        <div key={index} className="radio-button">
          <input
            name={name}
            id={`${name}-${index}`}
            type="radio"
            value={option}
            required
            disabled={isPending}
            defaultChecked={restoredValue === option}
          />
          <label htmlFor={`${name}-${index}`} className="label-text capitalize radio-label">
            {option}
          </label>
        </div>
      ))}
    </div>
  );
}

function Form({
  state,
  formAction,
  isPending,
}: {
  state: FormState;
  formAction: (payload: FormData) => void;
  isPending: boolean;
}) {
  const notValid = state.phase === "question" && state.valid === false;
  return (
    <form action={formAction}>
      {state.phase === "question" &&
        (state.step === "start" ? (
          <fieldset>
            <InputField name="peopleCount" error={state.valid === false ? state.error : null}>
              <input
                className="text-input"
                name="peopleCount"
                placeholder="How many people? (Up to 10)"
                type="number"
                min={1}
                max={10}
                required
                defaultValue={notValid ? state.defaultValue.peopleCount : undefined}
              ></input>
            </InputField>
            <InputField name="timeAvailable" error={state.valid === false ? state.error : null}>
              <input
                className="text-input"
                placeholder="How much time do you have?"
                name="timeAvailable"
                defaultValue={notValid ? state.defaultValue.timeAvailable : undefined}
              ></input>
            </InputField>
          </fieldset>
        ) : (
          <fieldset>
            <InputField
              label="What’s your favorite movie and why?"
              name="favoriteMovie"
              error={state.valid === false ? state.error : null}
            >
              <textarea
                name="favoriteMovie"
                id="favoriteMovie"
                placeholder="Describe your favorite movie..."
                className="text-input"
                required
                readOnly={isPending}
                defaultValue={notValid ? state.defaultValue.favoriteMovie : undefined}
              ></textarea>
            </InputField>
            <InputField name="period" error={state.valid === false ? state.error : null}>
              <legend> Are you in the mood for something new or a classic?</legend>
              <RadioOptions
                options={["new", "classic"]}
                name="period"
                isPending={isPending}
                restoredValue={notValid ? state.defaultValue.period : ""}
              />
            </InputField>
            <InputField name="mood" error={state.valid === false ? state.error : null}>
              <legend>What are you in the mood for?</legend>
              <RadioOptions
                options={["fun", "serious", "inspiring", "scary"]}
                name="mood"
                isPending={isPending}
                restoredValue={notValid ? state.defaultValue.mood : ""}
              />
            </InputField>
            <InputField
              label="Which famous film person would you love to be stranded on an island with and why?"
              name="islandPerson"
              error={state.valid === false ? state.error : null}
            >
              <textarea
                name="islandPerson"
                id="islandPerson"
                placeholder="Maybe your favorite actor..."
                className="text-input"
                required
                readOnly={isPending}
                defaultValue={notValid ? state.defaultValue.islandPerson : undefined}
              ></textarea>
            </InputField>
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
