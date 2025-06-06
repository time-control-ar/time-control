// components/EventForm.tsx

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { EventFormData } from "./EventModal";

type EventFormProps = {
  register: UseFormRegister<EventFormData>;
  errors: FieldErrors<EventFormData>;
};

export default function EventForm({ register, errors }: EventFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Título</label>
        <input
          {...register("name")}
          className="w-full border p-2 rounded"
          placeholder="Título del evento"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Fecha</label>
        <input type="date" {...register("date")} className="w-full border p-2 rounded" />
        {errors.date && <p className="text-red-500 text-sm">{errors.date.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Hora</label>
        <input type="time" {...register("time")} className="w-full border p-2 rounded" />
        {errors.time && <p className="text-red-500 text-sm">{errors.time.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Ubicación</label>
        <input
          {...register("location")}
          className="w-full border p-2 rounded"
          placeholder="Lugar del evento"
        />
        {errors.location && <p className="text-red-500 text-sm">{errors.location.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Imagen</label>
        <input
          {...register("img")}
          className="w-full border p-2 rounded"
          placeholder="URL de la imagen"
        />
        {errors.img && <p className="text-red-500 text-sm">{errors.img.message}</p>}
      </div>
    </div>
  );
}
