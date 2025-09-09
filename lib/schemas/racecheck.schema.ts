import { EventResponse } from "./event.schema";
import { Runner } from "./event.schema";

export interface RacecheckRunner {
 sexo: string;
 nombre: string;
 chip: string;
 dorsal: string;
 modalidad: string;
 categoria: string;
 tiempo: string;
 ritmo: string;
}

export interface TicketResponse {
 runner: Runner;
 event: EventResponse;
 metrics: {
  runnersBySameModality: number;
  runnersBySameCategory: number;
  runnersBySameGender: number;
 };
}
