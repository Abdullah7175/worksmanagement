import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function cn2(...inputs) {
  return inputs.filter(Boolean).join(" ")
}


export const role=1