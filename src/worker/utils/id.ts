// Generate a random UUID-like ID
export function generateId(): string {
  return crypto.randomUUID();
}
