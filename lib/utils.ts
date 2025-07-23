import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Category, RaceCheckProps, Runner } from "./schemas/racecheck.schema";

export function cn(...inputs: ClassValue[]) {
 return twMerge(clsx(inputs));
}

export async function textToJsonRaceResults(
 text: string
): Promise<RaceCheckProps | undefined> {
 try {
  const lines = text.trim().split("\n");
  const raceCheck: RaceCheckProps = {
   categories: [],
   participants: [],
  };

  let currentCategory: Category | null = null;

  for (const line of lines) {
   if (!line.trim()) continue;

   const parts = line.split("|");

   if (line.match(/^;\d+\|/)) {
    if (currentCategory) {
     raceCheck.categories.push(currentCategory);
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
    raceCheck.participants.push(runner);
   }
  }

  if (currentCategory) {
   raceCheck.categories.push(currentCategory);
  }

  return raceCheck;
 } catch (error) {
  console.error(error);
  return undefined;
 }
}

export const adminEmails = [
 "jeronimodonato@gmail.com",
 "timenoetinger@gmail.com",
];

// Función para validar y limpiar URLs de imágenes
export function validateImageUrl(url: string): string {
 if (!url) return "";

 // Si la URL ya es válida, la retornamos
 if (
  url.startsWith("https://") &&
  url.includes("timecontrol.blob.core.windows.net")
 ) {
  return url;
 }

 // Si es una URL local o relativa, la retornamos tal como está
 if (url.startsWith("/") || url.startsWith("blob:")) {
  return url;
 }

 // Si no es una URL válida, retornamos string vacío
 return "";
}

// Función para obtener la URL de la imagen con fallback
export function getImageUrl(imageUrl: string, fallbackUrl?: string): string {
 const validUrl = validateImageUrl(imageUrl);
 if (validUrl) return validUrl;
 return fallbackUrl || "";
}

export const eventTypes = [
 {
  name: "Maratón",
  value: "marathon",
 },
 {
  name: "Duatlón",
  value: "duathlon",
 },
 {
  name: "Triatlón",
  value: "triathlon",
 },
 {
  name: "Aguas abiertas",
  value: "aquathlon",
 },
 {
  name: "Ciclismo de montaña",
  value: "aquaride",
 },
 {
  name: "Ciclismo de ruta",
  value: "aquasprint",
 },
];
