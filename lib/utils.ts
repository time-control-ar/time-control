import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Modality, Gender, Runner } from "./schemas/event.schema";
import { RacecheckRunner } from "./schemas/racecheck.schema";

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

export const adminEmails = [
 "jeronimodonato@gmail.com",
 "timenoetinger@gmail.com",
];

const rlineKeys = {
 sexo: 0,
 nombre: 1,
 chip: 2,
 dorsal: 3,
 modalidad: 4,
 categoria: 5,
 tiempo: 6,
 ritmo: 10,
};

export function cn(...inputs: ClassValue[]) {
 return twMerge(clsx(inputs));
}

export function orderByTime(runners: RacecheckRunner[]): RacecheckRunner[] {
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

export function validateImageUrl(url: string): string {
 if (!url) return "";

 if (url.startsWith("https://")) {
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

const isRunnerLine = (line: string) => {
 return (
  line && !line.startsWith(";") && line.trim() !== "" && line.trim() !== "N/A"
 );
};

export const getRacecheckRunners = (
 racecheck: string,
 modalities: Modality[],
 genders: Gender[]
): {
 invalidLines: RacecheckRunner[];
 validLines: RacecheckRunner[];
} => {
 const result: {
  invalidLines: RacecheckRunner[];
  validLines: RacecheckRunner[];
 } = {
  invalidLines: [],
  validLines: [],
 };
 const categories =
  modalities?.flatMap((modality) => modality.categories ?? []) ?? [];
 const racecheckLines =
  racecheck
   ?.split("\n")
   ?.splice(1)
   .map((l) => l.trim())
   .filter((l) => isRunnerLine(l)) ?? [];

 racecheckLines?.map((line) => {
  const lineValues = line.split("|") ?? [];
  const rsex = lineValues[rlineKeys["sexo"]];
  const rname = lineValues[rlineKeys["nombre"]];
  const rchip = lineValues[rlineKeys["chip"]];
  const rdorsal = lineValues[rlineKeys["dorsal"]];
  const rmodality = lineValues[rlineKeys["modalidad"]];
  const rcategory = lineValues[rlineKeys["categoria"]];
  const rtime = lineValues[rlineKeys["tiempo"]];
  const rpace = lineValues[rlineKeys["ritmo"]];

  const matchedGender = genders?.find((gender) =>
   rsex.startsWith(gender.matchsWith)
  );
  const matchedCategory = categories?.find((category) =>
   rcategory.startsWith(category.matchsWith)
  );

  const racecheckRunner: RacecheckRunner = {
   sexo: rsex,
   nombre: rname,
   chip: rchip,
   dorsal: rdorsal,
   modalidad: rmodality,
   categoria: rcategory,
   tiempo: rtime,
   ritmo: rpace,
  };

  if (matchedGender && matchedCategory) {
   result.validLines.push(racecheckRunner);
  } else {
   result.invalidLines.push(racecheckRunner);
  }
 });

 return result;
};

export const buildResults = (
 runners: RacecheckRunner[],
 modalities: Modality[],
 genders: Gender[]
): { runners: Runner[] } => {
 const result: Runner[] = [];

 modalities.forEach((modality) => {
  const categories = modality.categories ?? [];

  const runnersOfTheModality = runners.filter((runner) => {
   return categories.some((category) =>
    runner.categoria.startsWith(category?.matchsWith)
   );
  });

  const orderedRunners = orderByTime(runnersOfTheModality);

  orderedRunners.forEach((runner, indexRunner) => {
   const matchedGender = genders.find((gender) =>
    runner.sexo.startsWith(gender.matchsWith)
   );
   const matchedCategory = categories.find((category) =>
    runner.categoria.startsWith(category?.matchsWith)
   );

   if (matchedGender && matchedCategory) {
    result.push({
     racecheck: runner,
     posGeneral: indexRunner + 1,
     posCat: 0,
     posSexo: 0,
     modality: modality,
     category: matchedCategory,
     gender: matchedGender,
    });
   }
  });
 });

 modalities.forEach((modality) => {
  const categories = modality.categories ?? [];

  categories.forEach((category) => {
   const runnersInCategory = result.filter(
    (runner) => runner.modality === modality && runner.category === category
   );

   const orderedByTime = orderByTime(runnersInCategory.map((r) => r.racecheck));

   orderedByTime.forEach((racecheckRunner, index) => {
    const runnerIndex = result.findIndex(
     (r) => r.racecheck === racecheckRunner
    );
    if (runnerIndex !== -1) {
     result[runnerIndex].posCat = index + 1;
    }
   });
  });
  genders.forEach((gender) => {
   const runnersInGender = result.filter(
    (runner) => runner.gender === gender && runner.modality === modality
   );

   const orderedByTime = orderByTime(runnersInGender.map((r) => r.racecheck));

   orderedByTime.forEach((racecheckRunner, index) => {
    const runnerIndex = result.findIndex(
     (r) => r.racecheck === racecheckRunner
    );
    if (runnerIndex !== -1) {
     result[runnerIndex].posSexo = index + 1;
    }
   });
  });
 });

 return { runners: result };
};
