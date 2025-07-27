"use server";

import { parseRacechecks } from "../utils";
import { searchEvents } from "./eventService";

export async function obtainTicketServer(eventId: string, dorsal: string) {
 const event = await searchEvents({ query: eventId });
 const runners = parseRacechecks(event?.[0]?.racecheck || "");
 return runners.find((runner) => runner.dorsal === dorsal);
}
