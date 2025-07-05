import { z } from "zod";

const runnerSchema = z.object({
 sex: z.enum(["M", "F"]),
 name: z.string(),
 chip: z.string(),
 dorsal: z.number(),
 modality: z.string(),
 category: z.string(),
 time: z.string(),
 position: z.number(),
 positionSex: z.number(),
 positionCategory: z.number(),
 pace: z.string(),
});

const categorySchema = z.object({
 id: z.number(),
 name: z.string(),
});

export const raceCheckSchema = z.object({
 categories: z.array(categorySchema),
 participants: z.array(runnerSchema),
});

export interface Runner {
 sex: "M" | "F";
 name: string;
 chip: string;
 dorsal: number;
 modality: string;
 category: string;
 time: string; // Format HH:MM:SS.sss
 position: number;
 positionSex: number;
 positionCategory: number;
 pace: string; // Format MM:SS min/Km
}
export interface Category {
 id: number;
 name: string;
}
export interface RaceCheckProps {
 categories: Category[];
 participants: Runner[];
}
