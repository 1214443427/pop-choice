import InputField from "./InputField";
import type { FormState } from "../App";

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
      {state.phase === "question" && (
        <>
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
        </>
      )}

      <button className="form-button" disabled={isPending}>
        {state.phase === "question" ? "Get Movie" : "Go Again "}
      </button>
    </form>
  );
}

export default Form;
