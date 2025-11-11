export function withUpdated<T extends object>(data: T): T & { updatedAt: Date } {
  return { ...data, updatedAt: new Date() };
}
