import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { EventFormData, EventResponse } from '@/lib/schemas/event.schema'
import { EventDate } from '../event-card'

interface EventFormDateTimeProps {
    register: UseFormRegister<EventFormData>;
    errors: FieldErrors<EventFormData>;
    event?: EventResponse | null;
}

export function EventFormDateTime({ register, errors, event }: EventFormDateTimeProps) {
    return (
        <div className="flex flex-col gap-2">
            <label className="label-input">Fecha y hora *</label>

            <div className="flex items-center w-full gap-6">
                <div className="w-full flex flex-col gap-2">
                    <div className="w-full max-w-md flex flex-col">
                        <input
                            type="date"
                            {...register("date")}
                            className="input w-full"
                        />
                        {errors.date && (
                            <p className="error-input">{errors.date.message}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-2 w-full">
                        <div className="w-full">
                            <input
                                type="time"
                                {...register("startTime")}
                                className="input w-full"
                            />
                            {errors.startTime && (
                                <p className="error-input">{errors.startTime.message}</p>
                            )}
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">a</p>
                        <div className="w-full">
                            <input
                                type="time"
                                {...register("endTime")}
                                className="input w-full"
                            />
                            {errors.endTime && (
                                <p className="error-input">{errors.endTime.message}</p>
                            )}
                        </div>
                    </div>
                </div>

                <EventDate eventDate={event?.date || ''} />
            </div>
        </div>
    )
}