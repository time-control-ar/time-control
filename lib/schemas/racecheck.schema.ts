import { Category, Modality } from "../utils";

export interface RaceCheckProps {
 eventId: string;
 eventName: string;
 categories: Category[];
 modalities: Modality[];
 racecheck: string | null;
}
