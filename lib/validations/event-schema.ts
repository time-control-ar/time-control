import { z } from "zod"

export const eventSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio."),
  date: z.string().min(1, "La fecha es obligatoria."),
  time: z.string().min(1, "La hora es obligatoria."),
  location: z.string().min(1, "La ubicación es obligatoria."),
})

export type EventFormData = z.infer<typeof eventSchema>
