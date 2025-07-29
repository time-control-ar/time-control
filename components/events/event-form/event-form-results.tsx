import { File, TrashIcon } from 'lucide-react'
import { UseFormWatch, UseFormSetValue } from 'react-hook-form'
import { EventFormData, EventResponse } from '@/lib/schemas/event.schema'
import RaceCheckTable from '../race-check-table'
import { validateFile } from '@/lib/utils'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_FILE_EXTENSIONS = ['.racecheck']

interface EventFormResultsProps {
    racecheckData: any;
    watch: UseFormWatch<EventFormData>;
    setValue: UseFormSetValue<EventFormData>;
    isSubmitting: boolean;
    setToast: (toast: { message: string; type: 'success' | 'error' | 'info'; show: boolean }) => void;
    event?: EventResponse | null;
}

export function EventFormResults({
    racecheckData,
    watch,
    setValue,
    isSubmitting,
    setToast,
    event
}: EventFormResultsProps) {

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            // Validar el archivo antes de procesarlo
            validateFile(file, {
                maxSize: MAX_FILE_SIZE,
                allowedExtensions: ALLOWED_FILE_EXTENSIONS
            })

            const fileContent = await file.text()

            setValue('racecheck', fileContent)

            setToast({
                message: 'Archivo procesado exitosamente',
                type: 'success',
                show: true
            })
        } catch (error) {
            console.error('Error al procesar el archivo:', error)
            setToast({
                message: error instanceof Error ? error.message : 'Error al procesar el archivo',
                type: 'error',
                show: true
            })
        }
    }

    const racecheckName = watch('racecheck')?.split('\n')[0]

    return (
        <div className="custom_border flex flex-col rounded-xl">
            <div className="p-3 lg:p-6 border-b border-gray-200 dark:border-gray-900">
                <p className='text-sm font-medium font-mono tracking-tight text-gray-700 dark:text-gray-200'>
                    Resultados
                </p>
            </div>

            {!racecheckData.runners?.length ? (
                <div className="w-full flex flex-col items-center justify-center lg:p-6">
                    <div className={`w-full flex flex-col h-max rounded-2xl shadow-lg md:shadow-none p-3 border border-dashed border-gray-200 dark:border-gray-900`}>
                        <div className="text-center w-full py-6">
                            <input
                                accept={ALLOWED_FILE_EXTENSIONS.join(',')}
                                onChange={handleFileChange}
                                disabled={isSubmitting}
                                className="hidden"
                                id="race-check-file"
                                type="file"
                            />

                            <label htmlFor="race-check-file" className={`cursor-pointer ${isSubmitting ? 'opacity-50' : ''}`}>
                                <div className="text-gray-500 flex flex-col items-center justify-center">
                                    <File size={24} className="mx-auto mb-2" />
                                    <p className='text-sm'>Haz clic para seleccionar archivo de resultados</p>
                                    <p className="text-xs">Archivos .racecheck hasta 10MB</p>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="p-6 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <p className='text-sm font-medium tracking-tight text-gray-500 dark:text-gray-400'>
                                {racecheckName}
                            </p>

                            <button
                                type="button"
                                className="rounded-full bg-red-600 flex items-center justify-center p-2 hover:bg-red-700 transition-all duration-75 w-max"
                                onClick={() => {
                                    setValue('racecheck', null)
                                }}
                            >
                                <TrashIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-2">
                            <p className="text-sm font-medium tracking-tight text-gray-500 dark:text-gray-400 font-mono">
                                {racecheckData.runners?.length} participantes cargados
                            </p>

                            <p className="text-sm font-medium tracking-tight text-gray-500 dark:text-gray-400 font-mono">
                                {racecheckData.modalities?.map((category: any) => category).join(', ')}
                            </p>
                            <p className="text-sm font-medium tracking-tight text-gray-500 dark:text-gray-400 font-mono">
                                {racecheckData.categories?.map((category: any) => category).join(', ')}
                            </p>
                        </div>
                    </div>
                    <div className='w-full flex flex-col h-max gap-6 p-3'>
                        <RaceCheckTable
                            modalities={watch('modalities') ?? []}
                            genders={watch('genders') ?? []}
                            runners={racecheckData.runners}
                            previewMode={event?._id ? { eventId: event?._id } : undefined}
                        />
                    </div>
                </>
            )}
        </div>
    )
}