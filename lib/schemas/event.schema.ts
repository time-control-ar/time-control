import { z } from "zod";
import { raceCheckSchema } from "./racecheck.schema";

export const eventCreateSchema = z.object({
 name: z
  .string()
  .min(1, "El nombre es obligatorio.")
  .max(100, "El nombre no puede exceder 100 caracteres."),
 date: z
  .string()
  .min(1, "La fecha es obligatoria.")
  .refine((date) => {
   const parsedDate = new Date(date);
   return !isNaN(parsedDate.getTime());
  }, "La fecha no es válida."),
 time: z
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
  .string()
  .min(1, "La ubicación es obligatoria.")
  .max(200, "La ubicación no puede exceder 200 caracteres."),
 description: z.string().optional(),
 maxParticipants: z
  .number()
  .min(1, "Debe tener al menos 1 participante.")
  .optional(),
 image: z.any().optional(),
 results: raceCheckSchema.optional(),
});

export type EventFormData = z.infer<typeof eventCreateSchema>;
