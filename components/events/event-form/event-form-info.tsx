import { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form'
import { EventFormData } from '@/lib/schemas/event.schema'

interface EventFormInfoProps {
    register: UseFormRegister<EventFormData>;
    errors: FieldErrors<EventFormData>;
    watch: UseFormWatch<EventFormData>;
}

export function EventFormInfo({ register, errors, watch }: EventFormInfoProps) {
    return (
        <div className="flex h-max gap-2 w-full">
            <div className="flex flex-col items-start gap-1 w-full">
                <label className="label-input">Título *</label>
                <input
                    {...register("name")}
                    className="input !text-sm "
                    placeholder="Ej: Carrera 5K Primavera"
                />
                {errors.name && (
                    <p className="error-input">{errors.name.message}</p>
                )}
                {errors.maxParticipants && (
                    <p className="error-input">Cupos inválidos, debe ser un número mayor a 0</p>
                )}
            </div>

            <div className="w-[150px] flex flex-col items-start gap-1">
                <label className="label-input">
                    Cupos máx.
                </label>

                <input
                    type="number"
                    {...register("maxParticipants", { valueAsNumber: true })}
                    className="input"
                    placeholder="Ej: 100"
                    min="1"
                />
            </div>
        </div>
    )
}