import { File, Loader2, TrashIcon } from 'lucide-react'
import { EventResponse } from '@/lib/schemas/event.schema'
import { UseFormSetValue } from 'react-hook-form'
import { EventFormData } from '@/lib/schemas/event.schema'
import SafeImage from '../../ui/safe-image'
import { uploadImageToAzure } from '@/services/eventService'
import { validateFile } from '@/lib/utils'

const MAX_IMAGE_SIZE = 15 * 1024 * 1024 // 15MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface EventFormImageProps {
    currentImageUrl: string;
    setCurrentImageUrl: (url: string) => void;
    setValue: UseFormSetValue<EventFormData>;
    isUpdatingImage: boolean;
    setIsUpdatingImage: (updating: boolean) => void;
    setToast: (toast: { message: string; type: 'success' | 'error' | 'info'; show: boolean }) => void;
    event?: EventResponse | null;
}

export function EventFormImage({
    currentImageUrl,
    setCurrentImageUrl,
    setValue,
    isUpdatingImage,
    setIsUpdatingImage,
    setToast,
    event
}: EventFormImageProps) {

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            validateFile(file, {
                maxSize: MAX_IMAGE_SIZE,
                allowedTypes: ALLOWED_IMAGE_TYPES
            })

            setIsUpdatingImage(true)

            // Subir imagen a Azure inmediatamente
            const result = await uploadImageToAzure(file, event?._id)

            if (result.success) {
                setCurrentImageUrl(result.data.url)
                setValue('image', result.data.url)

                setToast({
                    message: 'Imagen subida exitosamente',
                    type: 'success',
                    show: true
                })
            } else {
                throw new Error('Error al subir la imagen')
            }
        } catch (error) {
            console.error('Error subiendo imagen:', error)
            setToast({
                message: error instanceof Error ? error.message : 'Error al subir la imagen',
                type: 'error',
                show: true
            })
        } finally {
            setIsUpdatingImage(false)
        }
    }

    return (
        <div className='w-full flex flex-col gap-1'>
            <label className="label-input">
                Imagen del evento
            </label>

            {currentImageUrl ? (
                <div className="flex items-center relative">
                    <SafeImage
                        src={currentImageUrl}
                        alt={event?.name || ''}
                        className="z-10 object-cover rounded-bl-3xl rounded-xl"
                        fill
                        priority
                        fallbackText="Imagen"
                    />

                    <div className="flex items-center gap-1 absolute top-2 right-2">
                        <button
                            type="button"
                            className="rounded-full bg-red-600 flex items-center justify-center p-2 hover:bg-red-700 transition-all duration-75 w-max z-10"
                            onClick={() => {
                                setCurrentImageUrl('')
                                setValue('image', '')
                            }}
                        >
                            <TrashIcon
                                className="w-4 h-4 text-white" strokeWidth={2.5}
                            />
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    className={`w-full h-max rounded-bl-3xl rounded-xl shadow-lg md:shadow-none p-3 custom_border !border-dashed`}
                >
                    {isUpdatingImage ? (
                        <div className="flex items-center justify-center w-full gap-2 py-3">
                            <Loader2 size={20} className="animate-spin text-black dark:text-white" />
                            <span className="text-sm font-medium ml-2">Actualizando imagen...</span>
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <input
                                accept={ALLOWED_IMAGE_TYPES.join(',')}
                                onChange={handleImageChange}
                                disabled={isUpdatingImage}
                                className="hidden"
                                id="image-upload"
                                type="file"
                            />
                            <label htmlFor="image-upload" className={`cursor-pointer ${isUpdatingImage ? 'opacity-50' : ''}`}>
                                <div className="text-gray-500 flex flex-col items-center justify-center">
                                    <File size={24} className="mx-auto mb-2" />
                                    <p className='text-sm'>Haz clic para seleccionar una imagen</p>
                                    <p className="text-xs">PNG, JPG hasta 15MB</p>
                                </div>
                            </label>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}