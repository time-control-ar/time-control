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

export function orderByTime(runners: Runners[]): Runners[] {
 return runners.sort((a, b) => {
  const timeA = a.tiempo.split(":");
  const timeB = b.tiempo.split(":");
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
 matchsWith?: string;
}

export interface Modality {
 name: string;
 categories?: Category[];
}
export interface Category {
 name: string;
 matchsWith?: string;
}

export interface Runners {
 sexo: string;
 nombre: string;
 chip: string;
 dorsal: string;
 modalidad: string;
 categoria: string;
 tiempo: string;
 posicion: number;
 posSex: number;
 posCat: number;
 ritmo: string;
}

interface RaceData {
 categories: string[];
 modalities: string[];
 runners: Runners[];
}

export function parseRaceData(fileContent: string): RaceData {
 const lines = fileContent
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith(";") && !line.startsWith("1|"));
 const categories = new Set<string>();
 const modalities = new Set<string>();
 const runners: Runners[] = [];

 let isHeaderRow = true;

 for (const line of lines) {
  if (line.startsWith("SEXO|")) {
   isHeaderRow = true;
   continue;
  }
  if (!isHeaderRow) {
   const [
    sexo,
    nombre,
    chip,
    dorsal,
    modalidad,
    categoria,
    tiempo,
    posicion,
    posSex,
    posCat,
    ritmo,
   ] = line.split("|");
   categories.add(categoria);
   modalities.add(modalidad);
   runners.push({
    sexo,
    nombre,
    chip,
    dorsal,
    modalidad,
    categoria,
    tiempo,
    posicion: parseInt(posicion),
    posSex: parseInt(posSex),
    posCat: parseInt(posCat),
    ritmo,
   });
  }
  isHeaderRow = false;
 }

 // Convert tiempo to seconds for sorting
 function timeToSeconds(time: string): number {
  const [hours, minutes, seconds] = time
   .split(":")
   .map((part) => parseFloat(part));
  return hours * 3600 + minutes * 60 + seconds;
 }

 // Sort runners by tiempo
 runners.sort((a, b) => timeToSeconds(a.tiempo) - timeToSeconds(b.tiempo));

 return {
  categories: Array.from(categories).sort(),
  modalities: Array.from(modalities).sort(),
  runners,
 };
}
