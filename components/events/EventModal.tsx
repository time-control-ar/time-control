// components/EventModal.tsx

"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import EventForm from "./EventForm";

const eventSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio."),
  img: z.string().min(1, "La imagen es obligatoria."),
  date: z.string().min(1, "La fecha es obligatoria."),
  time: z.string().min(1, "La hora es obligatoria."),
  location: z.string().min(1, "La ubicación es obligatoria."),
});

export type EventFormData = z.infer<typeof eventSchema>;

export default function EventModal() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  const onSubmit = async (data: EventFormData) => {
    console.log("Form enviado con datos:", data);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Error creando evento");

      const result = await res.json();
      console.log("Evento creado", result);
      reset(); // limpiamos el form si todo sale bien
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="outline">
          Crear Evento
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[100]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 max-w-lg w-full p-6 bg-[hsl(var(--sidebar-background))] rounded-md shadow-lg -translate-x-1/2 -translate-y-1/2 z-[101]">
          <Dialog.Title className="text-xl font-bold mb-4">Nuevo Evento</Dialog.Title>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <EventForm register={register} errors={errors} />

            <div className="flex justify-between items-center">
              <Dialog.Close asChild>
                <Button variant="outline">Cerrar</Button>
              </Dialog.Close>
              <Button type="submit">Guardar evento</Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
