import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
 return twMerge(clsx(inputs));
}

export const adminEmails = [
 "jeronimodonato@gmail.com",
 "timenoetinger@gmail.com",
];

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
  name: "Carrera de obstáculos",
  value: "obstacle",
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

export function validateImageUrl(url: string): string {
 if (!url) return "";

 if (
  url.startsWith("https://") &&
  url.includes("timecontrol.blob.core.windows.net")
 ) {
  return url;
 }

 if (url.startsWith("/") || url.startsWith("blob:")) {
  return url;
 }

 return "";
}

export function generateQRUrl(eventId: string, dorsal: number): string {
 const baseUrl =
  process.env.NEXT_PUBLIC_QR_URL ||
  (typeof window !== "undefined" ? window.location.origin : "");
 return `${baseUrl}/?eventId=${eventId}&dorsal=${dorsal}`;
}

export function validateFile(
 file: File,
 options: {
  maxSize: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
 }
) {
 if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
  throw new Error("Tipo de archivo no válido");
 }

 if (
  options.allowedExtensions &&
  !options.allowedExtensions.some((ext) =>
   file.name.toLowerCase().endsWith(ext)
  )
 ) {
  throw new Error("Extensión de archivo no válida");
 }

 if (file.size > options.maxSize) {
  throw new Error(
   `El archivo excede el tamaño máximo de ${options.maxSize / 1024 / 1024}MB`
  );
 }

 return true;
}

export interface Category {
 name: string;
 matchsWith: string;
}
export interface Modality {
 name: string;
 matchsWith: string;
}

export interface Runner {
 sex: string;
 name: string;
 chip: string;
 dorsal: number;
 modality: string;
 category: string;
 time: string;
 position: number;
 positionSex: number;
 positionCategory: number;
 pace: string;
}

export interface ParsedRace {
 eventName: string;
 runners: Runner[];
 categories: Category[];
 modalities: Modality[];
}

function timeToMinutes(time: string): number {
 const [hours, minutes, seconds] = time
  .split(":")
  .map((part) => parseFloat(part));
 return hours * 60 + minutes + seconds / 60;
}

function calculatePace(time: string, distanceKm: number): string {
 if (distanceKm === 0) return "00:00 min/Km";
 const minutes = timeToMinutes(time);
 const pace = minutes / distanceKm;
 const paceMinutes = Math.floor(pace);
 const paceSeconds = Math.round((pace - paceMinutes) * 60);
 return `${paceMinutes.toString().padStart(2, "0")}:${paceSeconds
  .toString()
  .padStart(2, "0")} min/Km`;
}

export function parseRacechecks(
 fileContent: string,
 categories: Category[],
 modalities: Modality[]
): ParsedRace {
 const result: ParsedRace = {
  eventName: "",
  runners: [],
  categories: categories || [],
  modalities: modalities || [],
 };

 // Separar el contenido del archivo en líneas
 const lines = fileContent.trim().split("\n");

 // Verificar que hay líneas para procesar
 if (lines.length === 0) {
  throw new Error("El archivo está vacío");
 }

 // La primera línea es el nombre del evento
 if (lines[0] && lines[0].includes("|")) {
  result.eventName = lines[0].split("|")[1]?.trim() || "Evento sin nombre";
 } else {
  result.eventName = "Evento sin nombre";
 }

 // Procesar cada línea
 for (const line of lines) {
  if (line.startsWith("M|") || line.startsWith("F|")) {
   // Línea de corredor
   const parts = line.split("|").map((item) => item.trim());

   // Verificar que hay suficientes partes
   if (parts.length < 11) {
    console.warn("Línea de corredor incompleta:", line);
    continue;
   }

   const [
    sex,
    name,
    chip,
    dorsal,
    modality,
    category,
    time,
    position,
    positionSex,
    positionCategory,
    pace,
   ] = parts;

   // Buscar modalidad y categoría correspondientes
   const modalityFound =
    modalities.length > 0
     ? modalities.find((m) =>
        m.matchsWith
         .trim()
         .toLowerCase()
         .includes(modality.trim().toLowerCase())
       )
     : null;

   const categoryFound =
    categories.length > 0
     ? categories.find((c) =>
        c.matchsWith
         .trim()
         .toLowerCase()
         .includes(category.trim().toLowerCase())
       )
     : null;

   // Si no hay categorías o modalidades definidas, usar los valores del archivo
   const finalModality = modalityFound?.name || modality;
   const finalCategory = categoryFound?.name || category;

   const parsedRunner: Runner = {
    sex,
    name,
    chip,
    dorsal: parseInt(dorsal) || 0,
    modality: finalModality,
    category: finalCategory,
    time,
    position: parseInt(position) || 0,
    positionSex: parseInt(positionSex) || 0,
    positionCategory: parseInt(positionCategory) || 0,
    pace,
   };

   result.runners.push(parsedRunner);
  }
 }

 return result;
}
