export interface MovieFormData {
  favoriteMovie: string;
  period: "new" | "classic";
  mood: "fun" | "serious" | "inspiring" | "scary";
  islandPerson: string;
}

export interface MovieData {
  title: string;
  poster: string;
  description: string;
}
