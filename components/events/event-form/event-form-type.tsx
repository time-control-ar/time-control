import { CheckIcon } from 'lucide-react'
import { UseFormWatch, UseFormSetValue, FieldErrors } from 'react-hook-form'
import { EventFormData } from '@/lib/schemas/event.schema'
import { eventTypes } from '@/lib/utils'

interface EventFormTypeProps {
    watch: UseFormWatch<EventFormData>;
    setValue: UseFormSetValue<EventFormData>;
    errors: FieldErrors<EventFormData>;
}

export function EventFormType({ watch, setValue, errors }: EventFormTypeProps) {
    return (
        <div className="flex flex-col gap-1">
            <label className="label-input">Tipo de evento *</label>

            <div className="flex items-center gap-2 w-full">
                <div className="flex gap-2 w-full flex-wrap">
                    {eventTypes?.map((type, index) => {
                        const isSelected = watch("type") === type.value
                        return (
                            <button
                                type='button'
                                key={`${type.value}-${index}`}
                                className={`chip_filter ${isSelected ? "" : "text-gray-500 dark:text-gray-400"}`}
                                onClick={() => setValue("type", type.value)}
                            >
                                <div className="rounded-xl p-1 h-5 w-5 flex items-center justify-center transition-all duration-75">
                                    {isSelected && (
                                        <div>
                                            <CheckIcon className="w-5 h-5 text-cblack dark:text-cwhite" />
                                        </div>
                                    )}
                                </div>
                                <p className={`px-2 py-1 text-sm font-medium ${isSelected ? "text-cblack dark:text-cwhite" : "text-gray-500 dark:text-gray-400"}`}>
                                    {type.name}
                                </p>
                            </button>
                        )
                    })}
                </div>
            </div>
            {errors.type && (
                <p className="error-input">{errors.type.message}</p>
            )}
        </div>
    )
}