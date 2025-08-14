import { FieldErrors } from 'react-hook-form'
import { EventFormData } from '@/lib/schemas/event.schema'
import Map from '../map'

interface EventFormLocationProps {
    eventLocation: { lat: number; lng: number; name: string; direction: string };
    handleChangeLocation: (location: { lat: number; lng: number }, name: string, direction: string) => void;
    errors: FieldErrors<EventFormData>;
}
export function EventFormLocation({ eventLocation, handleChangeLocation, errors }: EventFormLocationProps) {

    return (
        <div className='w-full flex flex-col gap-1 relative'>
            <label className="label-input">Ubicación *</label>
            <Map
                onLocationSelect={handleChangeLocation}
                value={eventLocation}
            />

            {(errors?.location) && (
                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">
                        {errors?.location?.message} <br />
                    </p>
                </div>
            )}
        </div>
    )
}