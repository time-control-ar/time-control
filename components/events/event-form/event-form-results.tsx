import { File, TrashIcon, FileIcon, ListIcon } from 'lucide-react'
import { UseFormSetValue } from 'react-hook-form'
import { EventFormData, EventResponse, Gender, Modality, Runner } from '@/lib/schemas/event.schema'
import { validateFile } from '@/lib/utils'
import { useState } from 'react'
import ResultsTable from '../results-table'
import { cn } from '@/lib/utils'
import { RacecheckRunner } from '@/lib/schemas/racecheck.schema'
import RaceCheckTable from '../race-check-table'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const ALLOWED_FILE_EXTENSIONS = ['.racecheck']

const tabs = [
    {
        icon: <FileIcon className="w-4 h-4" />,
        title: 'Racecheck',
        value: 'racecheck'
    },
    {
        icon: <ListIcon className="w-4 h-4" />,
        title: 'Resultados',
        value: 'runners'
    }
]
interface EventFormResultsProps {
    setValue: UseFormSetValue<EventFormData>;
    isSubmitting: boolean;
    setToast: (toast: { message: string; type: 'success' | 'error' | 'info'; show: boolean }) => void;
    event?: EventResponse | null;
    fileName: string;
    runners: Runner[];
    modalities: Modality[];
    genders: Gender[];
    racecheckErrors: RacecheckRunner[];
}

export function EventFormResults({
    fileName,
    runners,
    modalities,
    genders,
    setValue,
    isSubmitting,
    setToast,
    racecheckErrors,
    event
}: EventFormResultsProps) {
    const [activeTab, setActiveTab] = useState<'racecheck' | 'runners'>('racecheck')

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
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
            // console.error('Error al procesar el archivo:', error)
            setToast({
                message: error instanceof Error ? error.message : 'Error al procesar el archivo',
                type: 'error',
                show: true
            })
        }
    }

    return (
        <div className="flex flex-col gap-3 w-full h-full items-center justify-center">
            <div className="flex items-center justify-start w-full gap-3 pt-1">
                {tabs.map((tab) => {
                    if (!fileName) return null

                    return (
                        <button
                            key={tab.value}
                            type="button"
                            className={cn(
                                "text-sm font-medium font-mono tracking-tight text-cblack dark:text-gray-100 text-center max-w-max flex items-center gap-2 px-2 py-2.5 rounded-full transition-all duration-75",
                                activeTab === tab.value && "bg-gray-100 dark:bg-cgray rounded-full"
                            )}
                            onClick={() => setActiveTab(tab.value as 'racecheck' | 'runners')}
                            disabled={isSubmitting || !fileName || runners.length === 0}
                        >
                            {tab.icon}
                            <p className="text-sm font-medium font-mono tracking-tight text-center max-w-max">
                                {tab.title}
                            </p>
                        </button>
                    )
                })}
            </div>

            {!fileName ? (
                <div className="w-full flex flex-col items-center justify-center">
                    <div className={`w-full flex flex-col h-max rounded-2xl shadow-lg md:shadow-none p-3 border border-dashed custom_border bg-gray-100 dark:bg-cblack hover:opacity-80 transition-all duration-75`}>
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
                                    <p className="text-xs">Archivo .racecheck</p>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-6 w-full my-auto h-full">
                    <div className="flex flex-col gap-3 w-full max-h-[80vh]">
                        {activeTab === 'racecheck' && (
                            <>
                                {fileName && (
                                    <div className="p-3 rounded-2xl border border-gray-200 dark:border-cgray flex items-center justify-between">
                                        <p className='text-sm font-medium font-mono tracking-tight text-gray-700 dark:text-gray-200'>
                                            {fileName}
                                        </p>
                                        <button
                                            type="button"
                                            className="rounded-full bg-red-600 flex items-center justify-center p-1.5 hover:bg-red-700 transition-all duration-75 w-max"
                                            onClick={() => {
                                                setValue('racecheck', null)
                                            }}
                                        >
                                            <TrashIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
                                        </button>
                                    </div>
                                )}
                                <RaceCheckTable
                                    runners={runners}
                                    racecheckErrors={racecheckErrors}
                                />
                            </>
                        )}

                        {/* Tabla de RacecheckRunner */}
                        {activeTab === 'runners' && event?._id && (
                            <ResultsTable eventId={event._id} title={fileName} runners={runners} modalities={modalities} genders={genders} />
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}