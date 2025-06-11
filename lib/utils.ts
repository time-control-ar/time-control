import { Category, Event, Runner } from "@/app/schemas";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
 return twMerge(clsx(inputs));
}

export function textToJsonRaceResults(text: string): Event | undefined {
 try {
  const lines = text.trim().split("\n");
  const event: Event = {
   id: 0,
   name: "",
   date: "",
   time: "",
   location: "",
   categories: [],
  };
  let currentCategory: Category | null = null;

  for (const line of lines) {
   // Skip empty lines
   if (!line.trim()) continue;

   const parts = line.split("|");

   // Check if it's an event line
   if (line.startsWith("1|")) {
    event.name = parts[1].trim(); // e.g., "2 Fecha xc Andino"
    continue;
   }

   // Check if it's a category header
   if (line.match(/^;\d+\|/)) {
    // Push the previous category if it exists
    if (currentCategory) {
     event.categories.push(currentCategory);
    }
    // Start a new category
    currentCategory = {
     id: parseInt(parts[0].replace(";", "").trim()),
     name: parts[1].trim(),
     runners: [],
    };
    continue;
   }

   // Check if it's a header line (SEXO|NOMBRE|...)
   if (line.includes("SEXO|NOMBRE")) {
    continue; // Skip header
   }

   // Process runner data
   if (currentCategory && parts.length >= 11) {
    const runner: Runner = {
     sex: parts[0].trim() as "M" | "F",
     name: parts[1].trim(),
     chip: parts[2].trim(),
     dorsal: parseInt(parts[3].trim()),
     modality: parts[4].trim(),
     category: parts[5].trim(),
     time: parts[6].trim(),
     position: parseInt(parts[7].trim()),
     positionSex: parseInt(parts[8].trim()),
     positionCategory: parseInt(parts[9].trim()),
     pace: parts[10].trim(),
    };
    currentCategory.runners.push(runner);
   }
  }

  // Push the last category
  if (currentCategory) {
   event.categories.push(currentCategory);
  }

  return event ?? undefined;
 } catch (error) {
  console.error(error);
  return undefined;
 }
}
