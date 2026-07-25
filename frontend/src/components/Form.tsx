import React from "react";
import InputField from "./InputField";

function Form() {
  function handleFormSubmit(data: FormData) {
    console.log(data);
  }
  return (
    <form action={handleFormSubmit}>
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
      <button className="form-button">Get Movie</button>
    </form>
  );
}

export default Form;
