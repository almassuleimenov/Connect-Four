import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
//D:\Downloads\jules_session\src\lib\utils.ts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}