export function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}
