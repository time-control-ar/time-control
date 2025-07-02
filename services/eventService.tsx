import { EventResponse } from "@/lib/schemas/event.schema";

export async function createEvent(formData: FormData): Promise<EventResponse> {
  try {
    const res = await fetch("/api/events", {
      method: "POST",
      body: formData,
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.message || "Error creando evento")
    }

    const result = await res.json()
    return result
  } catch (error) {
    console.error("Error en eventService:", error);
    throw error;
  }
}

export async function getEvents(): Promise<EventResponse[]> {
  try {
    const res = await fetch("/api/events", {
      method: "GET",
    });

    if (!res.ok) {
      throw new Error("Error obteniendo eventos");
    }

    const result = await res.json();
    return result.data;
  } catch (error) {
    console.error("Error en eventService:", error);
    throw error;
  }
}
