import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// FILE TYPES
export interface Runner {
 sex: "M" | "F";
 name: string;
 chip: string;
 dorsal: number;
 modality: string;
 category: string;
 time: string; // Format HH:MM:SS.sss
 position: number;
 positionSex: number;
 positionCategory: number;
 pace: string; // Format MM:SS min/Km
}
export interface Category {
 id: number;
 name: string;
}
export interface EventProps {
 id: number | string;
 name: string;
 date: string;
 time: string;
 location: string;
 categories: Category[];
 participants: Runner[];
 imageUrl: string;
 description: string;
}

export function cn(...inputs: ClassValue[]) {
 return twMerge(clsx(inputs));
}

export async function textToJsonRaceResults(
 text: string
): Promise<EventProps | undefined> {
 try {
  const lines = text.trim().split("\n");
  const event: EventProps = {
   id: Date.now().toString(),
   name: "",
   date: new Date().toISOString(),
   time: "",
   location: "",
   categories: [],
   participants: [],
   imageUrl: "",
   description: "",
  };

  let currentCategory: Category | null = null;

  for (const line of lines) {
   if (!line.trim()) continue;

   const parts = line.split("|");

   if (line.startsWith("1|")) {
    event.name = parts[1].trim();
    continue;
   }

   if (line.match(/^;\d+\|/)) {
    if (currentCategory) {
     event.categories.push(currentCategory);
    }
    currentCategory = {
     id: parseInt(parts[0].replace(";", "").trim()),
     name: parts[1].trim(),
    };
    continue;
   }

   if (line.includes("SEXO|NOMBRE")) {
    continue;
   }

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
    event.participants.push(runner);
   }
  }

  if (currentCategory) {
   event.categories.push(currentCategory);
  }

  return event;
 } catch (error) {
  console.error(error);
  return undefined;
 }
}
