import type { Request } from "express";
import express from "express";
import cors from "cors";
import type { MovieFormData } from "@shared/type.js";

const PORT = 3000;

const app = express();
app.use(express.json());

const corsOptions = {
  origin: ["http://localhost:5173"], // Allowed domains
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.post("/api/movies", (req: Request<any, any, MovieFormData>, res) => {
  const { favoriteMovie, period, mood, islandPerson } = req.body;
  console.log(favoriteMovie, period, mood, islandPerson);
});

app.listen(PORT, () => {
  console.log("running on port", PORT);
});
