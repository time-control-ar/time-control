import { RaceCheckProps } from "@/lib/schemas/racecheck.schema";
import axios from "axios";

export interface EventResponse {
 _id: string;
 name: string;
 date: string;
 time: string;
 location: string;
 description: string;
 maxParticipants: number;
 image: string;
 results: RaceCheckProps;
 createdBy: string;
 createdAt: string;
 updatedAt: string;
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
