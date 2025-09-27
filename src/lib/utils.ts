import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Basic slugify that strips diacritics and non-alphanumerics.
// If the result is empty (e.g., non-Latin scripts), caller should provide a fallback.
export function slugify(input: string, maxLength: number = 90): string {
  if (!input) return ''
  const base = input
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return base.slice(0, maxLength)
}