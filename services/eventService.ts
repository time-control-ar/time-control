import { EventResponse } from "@/lib/schemas/event.schema";
import axios from "axios";

export async function uploadImageToAzure(
 imageFile: File,
 eventId?: string
): Promise<{ success: boolean; data: { url: string } }> {
 try {
  const formData = new FormData();
  formData.append("file", imageFile);
  formData.append("eventId", eventId || "temp");

  const res = await axios({
   method: "POST",
   url: `/api/upload`,
   data: formData,
  });

  return res.data;
 } catch (error) {
  console.error("Error subiendo imagen a Azure:", error);
  throw error;
 }
}

export async function createEvent(
 formData: FormData
): Promise<{ success: boolean; data: EventResponse[] }> {
 try {
  const res = await axios({
   method: "POST",
   url: `/api/events`,
   data: formData,
  });

  return res.data;
 } catch (error) {
  console.error("Error en eventService:", error);
  throw error;
 }
}

export async function updateEvent(
 id: string,
 formData: FormData
): Promise<{ success: boolean; data: EventResponse[] }> {
 try {
  const res = await axios({
   method: "PUT",
   url: `/api/events/${id}`,
   data: formData,
  });

  return res.data;
 } catch (error) {
  console.error("Error en eventService:", error);
  throw error;
 }
}

export async function deleteEvent(
 id: string
): Promise<{ success: boolean; message: string }> {
 try {
  const res = await axios({
   method: "DELETE",
   url: `/api/events/${id}`,
  });

  return res.data;
 } catch (error) {
  console.error("Error en eventService:", error);
  throw error;
 }
}

export async function obtainEvents(): Promise<EventResponse[]> {
 try {
  const res = await axios({
   method: "GET",
   url: `/api/events`,
  });

  return res.data.data || [];
 } catch (error) {
  console.error("Error al obtener eventos:", error);
  return [];
 }
}
