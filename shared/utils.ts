import { MAX_PEOPLE } from "./const";

export function clampMaxPeople(people: number) {
  return Math.max(Math.min(Math.floor(people), MAX_PEOPLE), 1);
}
