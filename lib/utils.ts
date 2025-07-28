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

export function parseRacechecks(fileContent: string): RacecheckRunner[] {
 // Validar entrada
 if (!fileContent || typeof fileContent !== "string") {
  console.warn("parseRacechecks: Contenido del archivo inválido");
  return [];
 }

 const lines = fileContent.trim().split("\n");

 // Validar que hay contenido
 if (lines.length <= 1) {
  console.warn("parseRacechecks: Archivo vacío o sin datos válidos");
  return [];
 }

 // Eliminar la primera línea (nombre del evento)
 lines.splice(0, 1);

 // Función para validar si una línea es un header
 const isHeaderLine = (line: string): boolean => {
  const parts = line.split("|").map((item) => item.trim());
  return parts.length < 11 && parts[0]?.toUpperCase() === "SEXO";
 };

 // Función para validar si una línea tiene datos válidos
 const isValidDataLine = (line: string): boolean => {
  const parts = line.split("|").map((item) => item.trim());
  return parts.length >= 11 && !isHeaderLine(line);
 };

 // Filtrar líneas válidas
 const validLines = lines.filter(isValidDataLine);

 if (validLines.length === 0) {
  console.warn("parseRacechecks: No se encontraron líneas de datos válidas");
  return [];
 }

 const runners: RacecheckRunner[] = [];

 for (const line of validLines) {
  try {
   const parts = line.split("|").map((item) => item.trim());

   // Validar que tenemos suficientes partes
   if (parts.length < 11) {
    console.warn(`parseRacechecks: Línea con formato inválido: ${line}`);
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

   // Validar campos requeridos
   if (!name || !time) {
    console.warn(
     `parseRacechecks: Campos requeridos faltantes en línea: ${line}`
    );
    continue;
   }

   // Validar formato de tiempo (HH:MM:SS.mmm)
   const timeRegex = /^\d{1,2}:\d{2}:\d{2}\.\d{3}$/;
   if (!timeRegex.test(time)) {
    console.warn(`parseRacechecks: Formato de tiempo inválido: ${time}`);
    continue;
   }

   const parsedRunner: RacecheckRunner = {
    name: name || "N/A",
    chip: chip || "N/A",
    sex: sex || "N/A",
    time: time,
    modality: modality || "N/A",
    category: category || "N/A",
    dorsal: dorsal || "N/A",
    position: position || "N/A",
    positionSex: positionSex || "N/A",
    positionCategory: positionCategory || "N/A",
    pace: pace || "N/A",
   };

   runners.push(parsedRunner);
  } catch (error) {
   console.error(`parseRacechecks: Error procesando línea: ${line}`, error);
   continue;
  }
 }

 if (runners.length === 0) {
  console.warn("parseRacechecks: No se pudieron procesar corredores válidos");
  return [];
 }

 console.log(
  `parseRacechecks: Procesados ${runners.length} corredores exitosamente`
 );
 return orderByTime(runners);
}
