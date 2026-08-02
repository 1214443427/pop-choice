export const MAX_PEOPLE = 10;

export function clampMaxPeople(people: number) {
  return Math.max(Math.min(Math.floor(people), MAX_PEOPLE), 1);
}
