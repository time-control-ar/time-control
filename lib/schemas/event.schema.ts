import { RacecheckRunner } from "./racecheck.schema";
import { z } from "zod";

export interface Gender {
 name: string;
 matchsWith: string;
}
export interface Modality {
 name: string;
 categories?: Category[];
}
export interface Category {
 name: string;
 matchsWith: string;
}
export interface Runner {
 racecheck: RacecheckRunner;
 posGeneral: number;
 posCat: number;
 posSexo: number;
 modality: Modality;
 category: Category;
 gender: Gender;
}

export const eventCreateSchema = z.object({
 name: z
  .string()
  .min(1, "El nombre es obligatorio.")
  .max(100, "El nombre no puede exceder 100 caracteres."),
 type: z.string().min(1, "Debe seleccionar un tipo de evento."),
 date: z
  .string()
  .min(1, "La fecha es obligatoria.")
  .refine((date) => {
   const parsedDate = new Date(date);
   return !isNaN(parsedDate.getTime());
  }, "La fecha no es válida."),
 startTime: z
  .string()
  .min(1, "La hora es obligatoria.")
  .refine((time) => {
   const [hours, minutes] = time.split(":").map(Number);
   return (
    !isNaN(hours) &&
    !isNaN(minutes) &&
    hours >= 0 &&
    hours < 24 &&
    minutes >= 0 &&
    minutes < 60
   );
  }, "La hora no es válida."),
 endTime: z
  .string()
  .min(1, "La hora es obligatoria.")
  .refine((time) => {
   const [hours, minutes] = time.split(":").map(Number);
   return (
    !isNaN(hours) &&
    !isNaN(minutes) &&
    hours >= 0 &&
    hours < 24 &&
    minutes >= 0 &&
    minutes < 60
   );
  }, "La hora no es válida."),
 location: z
  .object(
   {
    name: z.string().refine(
     (name) => {
      return name.trim().length > 0;
     },
     {
      message: "El nombre de la ubicación no puede estar vacío.",
     }
    ),
    direction: z.string().refine(
     (direction) => {
      return direction.trim().length > 0;
     },
     {
      message: "La dirección no puede estar vacía.",
     }
    ),
    lat: z
     .number({
      required_error: "La latitud es obligatoria.",
      invalid_type_error: "La latitud debe ser un número válido.",
     })
     .min(-90, "La latitud debe estar entre -90 y 90 grados.")
     .max(90, "La latitud debe estar entre -90 y 90 grados."),
    lng: z
     .number({
      required_error: "La longitud es obligatoria.",
      invalid_type_error: "La longitud debe ser un número válido.",
     })
     .min(-180, "La longitud debe estar entre -180 y 180 grados.")
     .max(180, "La longitud debe estar entre -180 y 180 grados."),
   },

   {
    required_error: "Debe seleccionar una ubicación en el mapa.",
    invalid_type_error:
     "La ubicación debe ser un objeto válido con latitud y longitud.",
   }
  )
  .refine(
   (location) => {
    return !(location.lat === -34.397 && location.lng === 150.644);
   },
   {
    message:
     "Debe seleccionar una ubicación específica en el mapa. La ubicación por defecto no es válida.",
   }
  ),
 description: z.string().optional(),
 maxParticipants: z
  .number()
  .min(1, "Debe tener al menos 1 participante.")
  .optional(),
 image: z.string().optional(),
 logo: z.string().optional(),
 modalities: z
  .array(
   z.object({
    name: z.string(),
    categories: z
     .array(
      z.object({
       name: z.string(),
       matchsWith: z.string(),
      })
     )
     .optional(),
   })
  )
  .optional(),
 genders: z
  .array(
   z.object({
    name: z.string(),
    matchsWith: z.string(),
   })
  )
  .optional(),
 racecheck: z.string().nullable(),
});

export type EventFormData = z.infer<typeof eventCreateSchema>;

export interface EventResponse {
 _id: string;
 name: string;
 date: string;
 startTime: string;
 endTime: string;
 description: string;
 maxParticipants: number;
 image: string;
 logo: string;
 createdBy: string;
 createdAt: string;
 updatedAt: string;
 type: string;
 location: {
  lat: number;
  lng: number;
  name: string;
  direction: string;
 };
 genders: Gender[];
 modalities: Modality[];
 racecheck: string | null;
}
