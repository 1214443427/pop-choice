import React from "react";
import hero from "./assets/hero.png";
import "./App.css";
import Form from "./components/Form";

function App() {
  return (
    <div className="background">
      <main className="app-container">
        <div className="hero">
          <img src={hero} />
          <h1>PopChoice</h1>
        </div>
        <section>
          <Form />
        </section>
      </main>
    </div>
  );
}

export default App;
