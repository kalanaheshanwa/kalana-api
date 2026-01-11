export function toJsonString<T extends Record<string, unknown>>(
  obj: T,
): {
  [P in keyof T as `${Extract<P, string>}Json`]: string;
} {
  const res: Record<string, string> = {};
  for (const key of Object.keys(obj) as Array<keyof T & string>) {
    res[`${key}Json`] = JSON.stringify(obj[key]);
  }
  return res as { [P in keyof T as `${Extract<P, string>}Json`]: string };
}
