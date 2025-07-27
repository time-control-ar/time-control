import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const adminEmails = [
 "iamindev@gmail.com",
 "jeronimodonato@gmail.com",
 "timenoetinger@gmail.com",
];

export function cn(...inputs: ClassValue[]) {
 return twMerge(clsx(inputs));
}

export function orderByTime(runners: RacecheckRunner[]): RacecheckRunner[] {
 return runners.sort((a, b) => {
  const timeA = a.time.split(":");
  const timeB = b.time.split(":");
  return (
   parseInt(timeA[0]) - parseInt(timeB[0]) ||
   parseInt(timeA[1]) - parseInt(timeB[1]) ||
   parseInt(timeA[2]) - parseInt(timeB[2])
  );
 });
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

export interface Gender {
 name: string;
 matchsWith: string;
}

export interface Category {
 name: string;
 matchsWith: string;
}
export interface Modality {
 name: string;
 matchsWith: string;
}

export interface RacecheckRunner {
 sex: string;
 name: string;
 chip: string;
 dorsal: string;
 modality: string;
 category: string;
 time: string;
 position: string;
 positionSex: string;
 positionCategory: string;
 pace: string;
}

export interface ParsedRace {
 eventName: string;
 uniqueModalities: string[];
 uniqueCategories: string[];
 uniqueGenders: string[];
 runners: RacecheckRunner[];
 errors: string[];
}

export function parseRacechecks(fileContent: string): ParsedRace {
 const result: ParsedRace = {
  eventName: "",
  runners: [],
  errors: [],
  uniqueModalities: [],
  uniqueCategories: [],
  uniqueGenders: [],
 };

 // Separar el contenido del archivo en líneas
 const lines = fileContent.trim().split("\n");
 // Verificar que hay líneas
 if (lines.length === 0) {
  throw new Error("El archivo está vacío");
 }
 // Separar el nombre del evento
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
    result.errors.push(line);
    continue;
   }

   const [
    name,
    chip,
    dorsal,
    modality,
    category,
    sex,
    time,
    position,
    positionSex,
    positionCategory,
    pace,
   ] = parts;

   if (!result.uniqueModalities.includes(modality)) {
    result.uniqueModalities.push(modality);
   }

   if (!result.uniqueCategories.includes(category)) {
    result.uniqueCategories.push(category);
   }

   if (!result.uniqueGenders.includes(sex)) {
    result.uniqueGenders.push(sex);
   }

   const parsedLine: RacecheckRunner = {
    sex,
    name,
    chip,
    dorsal: dorsal || "N/A",
    modality: modality || "N/A",
    category: category || "N/A",
    time,
    position: position || "N/A",
    positionSex: positionSex || "N/A",
    positionCategory: positionCategory || "N/A",
    pace: pace || "N/A",
   };
   result.runners.push(parsedLine);
  }
 }

 result.runners = orderByTime(result.runners);

 console.log(result);

 return result;
}
