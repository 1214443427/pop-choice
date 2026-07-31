export type PersonFormData = {
  favoriteMovie: string;
  period: "new" | "classic";
  mood: "fun" | "serious" | "inspiring" | "scary";
  islandPerson: string;
};

export interface MovieFormData {
  startData: {
    peopleCount: number;
    timeAvailable: string;
  };
  personData: PersonFormData[];
}
export type MovieResponseData = {
  title: string;
  year?: number | undefined | null;
  poster?: string | undefined | null;
  description: string;
}[];
