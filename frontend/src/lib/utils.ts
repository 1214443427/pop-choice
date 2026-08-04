import z, { ZodError } from "zod";

export function validateData<T extends z.ZodType>(data: unknown, schema: T): z.output<T> {
  const parseResult = schema.safeParse(data);
  if (!parseResult.success) {
    throw parseResult.error;
  }
  return parseResult.data;
}

export function getZodErrorPath(error: unknown) {
  return error instanceof ZodError ? String(error.issues[0].path.at(-1)) : "generic";
}

export function getZodErrorMessage(error: unknown) {
  return error instanceof ZodError
    ? String(error.issues[0].message)
    : "The app encountered an unexpected input. Please verify you have inputted everything correctly.";
}
