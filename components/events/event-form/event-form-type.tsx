
import { UseFormWatch, UseFormSetValue, FieldErrors } from 'react-hook-form'
import { EventFormData } from '@/lib/schemas/event.schema'
import { eventTypes } from '@/lib/utils'
import ChipFilterOption from '@/components/ui/chip-filter-option';

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
                            <ChipFilterOption
                                key={`${type.value}-${index}`}
                                type={type}
                                isSelected={isSelected}
                                handleCategoryToggle={() => setValue("type", type.value)}
                                index={index}
                            />
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