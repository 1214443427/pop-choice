export interface MovieFormData {
  favoriteMovie: string;
  period: "new" | "classic";
  mood: "fun" | "serious" | "inspiring" | "scary";
  islandPerson: string;
}

export interface MovieResponseData {
  title: string;
  year?: number | undefined;
  poster?: string | undefined;
  description: string;
}
