import React from "react";
import InputField from "./InputField";

function Form() {
  async function handleFormSubmit(data: FormData) {
    await fetch("http://localhost:3000/api/movies", {
      method: "POST",
      headers: { "Content-Type": "application/JSON" },
      body: JSON.stringify(Object.fromEntries(data)),
    });
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
