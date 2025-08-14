import { File, Loader2, TrashIcon } from 'lucide-react'
import SafeImage from '../../ui/safe-image'
import { useState } from 'react'
import { deleteImage, uploadImage } from '@/services/image';

interface EventFormImageProps {
    eventId: string | undefined;
    eventImage: string | undefined;
    replaceUrl: (url: string) => void;
    setToast: (toast: { message: string; type: 'success' | 'error' | 'info'; show: boolean }) => void;
}

export function EventFormImage({
    eventId,
    eventImage,
    setToast,
    replaceUrl
}: EventFormImageProps) {
    const [isUpdatingImage, setIsUpdatingImage] = useState(false)
    const [currentFile, setCurrentFile] = useState<File | undefined>(undefined)

    const handleChangeImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = e.target.files?.[0]

            if (!file) {
                setToast({
                    message: 'No se seleccionó ningún archivo',
                    type: 'error',
                    show: true
                })
                return
            }

            // Validar tipo de archivo
            if (!file.type.startsWith('image/')) {
                setToast({
                    message: 'El archivo debe ser una imagen',
                    type: 'error',
                    show: true
                })
                return
            }

            // Validar tamaño (15MB)
            if (file.size > 15 * 1024 * 1024) {
                setToast({
                    message: 'La imagen no puede superar los 15MB',
                    type: 'error',
                    show: true
                })
                return
            }

            try {
                if (!eventId) {
                    setToast({
                        message: 'Error al actualizar la imagen',
                        type: 'error',
                        show: true
                    })
                    return
                }
                setIsUpdatingImage(true)

                const newBlob = await uploadImage(eventId, file.name, file);
                replaceUrl(newBlob.url)
                setToast({
                    message: 'Imagen actualizada exitosamente',
                    type: 'success',
                    show: true
                })
            } catch (error) {
                setToast({
                    message: 'Error al actualizar la imagen',
                    type: 'error',
                    show: true
                })
                console.error(error);
            } finally {
                setIsUpdatingImage(false)
                setCurrentFile(undefined)
            }


            setCurrentFile(file)
        } catch (e) {
            console.error(e)
            setToast({
                message: 'Error al procesar la imagen',
                type: 'error',
                show: true
            })
        }
    }

    const handleDeleteImage = async () => {

        try {
            if (!eventId || !eventImage) {
                return setToast({
                    message: 'Error al eliminar la imagen',
                    type: 'error',
                    show: true
                })
            }
            setIsUpdatingImage(true)

            await deleteImage(eventId, eventImage)
            replaceUrl('')

            setCurrentFile(undefined)
            setToast({
                message: 'Imagen eliminada exitosamente',
                type: 'success',
                show: true
            })

        } catch (error) {
            console.error('Error al eliminar imagen:', error);
            setToast({
                message: 'Error al eliminar la imagen',
                type: 'error',
                show: true
            });
        } finally {
            setIsUpdatingImage(false)
        }
    }

    if (!eventId) {
        return (
            <p className='text-gray-500 text-sm p-4 border border-dashed border-gray-200 dark:border-cgray rounded-3xl'>
                Podrás agregar la imagen cuando se haya creado el evento
            </p>
        )
    }

    return (
        <div className='w-full flex flex-col gap-1'>
            <label className="label-input">
                Imagen
            </label>

            <div className="flex overflow-hidden h-[200px] items-center bg-gray-50 dark:bg-gray-500/10 border-t border-gray-100 dark:border-cgray justify-center z-10 object-cover rounded-bl-3xl rounded-xl relative">
                {isUpdatingImage ? (
                    <div className="flex items-center justify-center h-full w-full gap-2 py-3" >
                        <Loader2 size={20} className="animate-spin  text-cdark dark:text-white" />
                        <span className="text-sm font-medium ml-2">Actualizando imagen...</span>
                    </div>
                ) : eventImage ? (
                    <>
                        <SafeImage
                            src={eventImage}
                            alt={eventId}
                            className="object-cover object-left-top h-full w-full"
                            fill
                            priority
                            fallbackText="Imagen"
                        />
                        <div className="flex items-center gap-1 absolute top-2 right-2">
                            <button
                                type="button"
                                className="rounded-full bg-red-600 flex items-center justify-center p-2 hover:bg-red-700 transition-all duration-75 w-max z-10"
                                onClick={handleDeleteImage}
                                disabled={isUpdatingImage}
                            >
                                <TrashIcon
                                    className="w-4 h-4 text-white" strokeWidth={2.5}
                                />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full w-full gap-2 py-3">
                        <input
                            accept='image/*'
                            onChange={handleChangeImage}
                            disabled={isUpdatingImage}
                            className="hidden"
                            id="image-upload"
                            type="file"
                        />

                        <label htmlFor="image-upload" className={`cursor-pointer ${isUpdatingImage || !eventId || !!currentFile ? 'opacity-50' : ''}`}>
                            <div className="text-gray-500 flex flex-col items-center justify-center">
                                {currentFile ? (
                                    <>
                                        <Loader2 size={24} className="mx-auto mb-2 animate-spin" />
                                        <p className='text-sm'>Procesando imagen...</p>
                                        <p className="text-xs">{currentFile.name}</p>
                                    </>
                                ) : (
                                    <>
                                        <File size={24} className="mx-auto mb-2" />
                                        <p className='text-sm'>Haz clic para seleccionar una imagen</p>
                                        <p className="text-xs">PNG, JPG hasta 15MB</p>
                                    </>
                                )}
                            </div>
                        </label>
                    </div>
                )}
            </div>
        </div >
    )
}