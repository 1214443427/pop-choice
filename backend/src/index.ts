import type { Request } from "express";
import express from "express";
import cors from "cors";
import type { MovieFormData } from "@shared/type.js";

const PORT = 3000;

const app = express();
app.use(express.json());
app.use(cors());

app.post("/api/movies", (req: Request<any, any, MovieFormData>, res) => {
  const { favoriteMovie, period, mood, islandPerson } = req.body;
});

app.listen(PORT, () => {
  console.log("running on port", PORT);
});
