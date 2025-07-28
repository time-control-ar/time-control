"use server";

import { parseRaceData, Runners } from "../utils";
import { searchEvents } from "./eventService";

export async function obtainTicketServer(eventId: string, dorsal: string) {
 const event = await searchEvents({ query: eventId });
 const runners = parseRaceData(event?.[0]?.racecheck || "");
 return runners.runners?.find((runner: Runners) => runner.dorsal === dorsal);
}
