export interface MovieFormData {
  favoriteMovie: string;
  period: "new" | "classic";
  mood: "fun" | "serious" | "inspiring" | "scary";
  islandPerson: string;
}

export type MovieResponseData = {
  title: string;
  year?: number | undefined | null;
  poster?: string | undefined | null;
  description: string;
}[];
