import { z } from "zod";

export const eventSchema = z.object({
 name: z
  .string()
  .min(1, "El nombre es obligatorio.")
  .max(100, "El nombre no puede exceder 100 caracteres."),
 date: z.string().min(1, "La fecha es obligatoria."),
 time: z.string().min(1, "La hora es obligatoria."),
 location: z
  .string()
  .min(1, "La ubicación es obligatoria.")
  .max(200, "La ubicación no puede exceder 200 caracteres."),
 description: z.string().optional(),
 maxParticipants: z
  .number()
  .min(1, "Debe tener al menos 1 participante.")
  .optional(),
 createdBy: z.string().min(1, "El creador es obligatorio."),
});

export const eventCreateSchema = eventSchema.extend({
 image: z.any().optional(),
 results: z.any().optional(),
});

export type EventFormData = z.infer<typeof eventSchema>;
export type EventCreateData = z.infer<typeof eventCreateSchema>;

// Esquema para la respuesta del servidor
export interface EventResponse {
 _id: string;
 name: string;
 date: string;
 time: string;
 location: string;
 description: string;
 maxParticipants: number;
 image: string;
 results: string;
 parsedResults: string;
 createdBy: string;
 createdAt: string;
 updatedAt: string;
}
