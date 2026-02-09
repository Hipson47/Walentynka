export function sanitizeName(input: string | null): string {
  if (!input) return "";
  return input.trim().replace(/\s+/g, " ").slice(0, 40);
}
