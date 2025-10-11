export function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(' ')
}

/**
 * Returns true when the current path matches the target link.
 * The check is prefix-aware to support nested routes while avoiding
 * false positives on similarly named paths.
 */
export function isActivePath(current: string, href: string) {
  if (!current || !href) return false
  if (href === '/') {
    return current === '/'
  }
  return current === href || current.startsWith(`${href}/`)
}
