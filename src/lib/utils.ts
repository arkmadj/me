import type { Velocity } from "@/pages/Home/types";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isDeepEqual(obj1: Velocity, obj2: Velocity) {
  // Check if both are the exact same value or primitive
  if (obj1 === obj2) return true;

  // Handle null or non-object types
  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
    return false;
  }

  // Get keys of both objects
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  // Must have the same number of properties
  if (keys1.length !== keys2.length) return false;


  return true;
}
