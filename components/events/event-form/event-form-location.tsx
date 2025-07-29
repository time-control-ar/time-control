import { MapPinIcon } from 'lucide-react'
import { UseFormWatch, FieldErrors } from 'react-hook-form'
import { EventFormData, EventResponse } from '@/lib/schemas/event.schema'
import Map from '../map'

interface EventFormLocationProps {
    watch: UseFormWatch<EventFormData>;
    handleLocationSelect: (location: { lat: number; lng: number }, locationName: string) => void;
    errors: FieldErrors<EventFormData>;
    event?: EventResponse | null;
}

export function EventFormLocation({ watch, handleLocationSelect, errors, event }: EventFormLocationProps) {
    return (
        <div className='w-full flex flex-col gap-1 relative'>
            <label className="label-input">Ubicación *</label>
            {(watch('locationName') || event?.locationName) && (
                <div className="flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-mono tracking-tight">{watch('locationName') ?? event?.locationName}</p>
                </div>
            )}
            <Map
                onLocationSelect={handleLocationSelect}
                value={watch('location')}
            />

            {(errors?.location || errors?.locationName) && (
                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">
                        {errors?.location?.message} <br />
                        {errors?.locationName?.message}
                    </p>
                </div>
            )}
        </div>
    )
}