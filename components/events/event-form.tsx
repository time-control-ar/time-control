'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { eventCreateSchema, EventFormData } from '@/lib/schemas/event.schema'
import { File, Trash, Loader2, ArrowLeftIcon, EyeIcon, CheckIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

const MAX_IMAGE_SIZE = 15 * 1024 * 1024 // 15MB
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_FILE_EXTENSIONS = ['.racecheck', '.xlsx']

import { EventResponse, createEvent, updateEvent } from '@/services/eventService'
import { adminEmails, textToJsonRaceResults } from '@/lib/utils'
import { RaceCheckProps } from '@/lib/schemas/racecheck.schema'
import { SignInButton } from '../ui/sign-in-button'
import { AnimatedText } from '../ui/animated-text'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Modal from '../ui/modal'
import Toast from '../ui/toast'
import EventPreview from './event-preview'

interface EventFormProps {
  event?: EventResponse;
}

export default function EventForm({ event }: EventFormProps) {
  const router = useRouter()
  const { data: session } = useSession()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<EventFormData>({
    resolver: zodResolver(eventCreateSchema),
    mode: 'onBlur',
    defaultValues: event || {
      name: "",
      date: new Date().toISOString().split('T')[0],
      time: "09:00",
      location: "",
      description: "",
      maxParticipants: 100,
    }
  })

  const [isMounted, setIsMounted] = useState(false)
  const [eventFile, setEventFile] = useState<File | undefined>(undefined)
  const [imageFile, setImageFile] = useState<File | undefined>(undefined)
  const [parsedResults, setParsedResults] = useState<RaceCheckProps | undefined>(event?.results)
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    show: boolean;
  }>({
    message: '',
    type: 'info',
    show: false
  });
  const [showPreview, setShowPreview] = useState(false)

  const validateFile = (file: File, options: {
    maxSize: number,
    allowedTypes?: string[],
    allowedExtensions?: string[]
  }) => {
    if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
      throw new Error('Tipo de archivo no válido')
    }

    if (options.allowedExtensions &&
      !options.allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
      throw new Error('Extensión de archivo no válida')
    }

    if (file.size > options.maxSize) {
      throw new Error(`El archivo excede el tamaño máximo de ${options.maxSize / 1024 / 1024}MB`)
    }

    return true
  }

  const onSubmit = async (data: EventFormData) => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('date', data.date);
      formData.append('time', data.time);
      formData.append('location', data.location);
      formData.append('description', data.description || '');
      formData.append('maxParticipants', data.maxParticipants?.toString() || '0');

      if (parsedResults) {
        formData.append('results', JSON.stringify(parsedResults));
      }
      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (event?._id) {
        // Update existing event
        await updateEvent(event._id, formData);
        setToast({
          message: 'Evento actualizado exitosamente',
          type: 'success',
          show: true
        })
      } else {
        // Create new event
        await createEvent(formData);
        setToast({
          message: 'Evento creado exitosamente',
          type: 'success',
          show: true
        })
      }

      reset()
      setImageFile(undefined)
      setEventFile(undefined)
      setParsedResults(undefined)
      router.push('/eventos')
    } catch (error) {
      console.error('Error procesando evento:', error)
      setToast({
        message: 'Error al procesar el evento',
        type: 'error',
        show: true
      })
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      validateFile(file, {
        maxSize: MAX_IMAGE_SIZE,
        allowedTypes: ALLOWED_IMAGE_TYPES
      })
      setImageFile(file)
    } catch (error) {
      if (error instanceof Error) {
        Toast({ message: error.message, type: 'error' })
      }
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      validateFile(file, {
        maxSize: MAX_FILE_SIZE,
        allowedExtensions: ALLOWED_FILE_EXTENSIONS
      })

      setEventFile(file)

      // Parsear el archivo y guardar el resultado
      const results = await textToJsonRaceResults(await file.text())
      console.log(results)
      setParsedResults(results)

      setToast({
        message: 'Archivo parseado exitosamente',
        type: 'success',
        show: true
      })
    } catch (error) {
      if (error instanceof Error) {
        Toast({ message: error.message, type: 'error' })
      }
    }
  }

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  if (!session?.user?.email) return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-3 p-6">
      <div className="flex flex-col gap-4 max-w-md mx-auto w-full">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Debes iniciar sesión para gestionar eventos
        </p>

        <div className="flex items-center justify-between gap-4 w-full">
          <button className="rounded-btn !bg-gray-100 dark:!bg-gray-800 !border-gray-300 flex items-center gap-2"
            onClick={() => router.push('/')}
          >
            <ArrowLeftIcon className="w-4 h-4 text-gray-500 dark:text-gray-300" />
            <p className="text-xs font-semibold tracking-tight text-gray-700 dark:text-gray-300">
              Volver
            </p>
          </button>
          <SignInButton />
        </div>
      </div>
    </div>
  )

  if (session?.user?.email && !adminEmails.includes(session?.user?.email)) return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-3 p-6">
      <p className="text-gray-500 dark:text-gray-400 text-sm">
        No tienes permisos para gestionar eventos
      </p>

      <div className="flex items-center justify-between gap-4 w-full">
        <button className="rounded-btn !bg-gray-100 dark:!bg-gray-800 !border-gray-300 flex items-center gap-2"
          onClick={() => router.push('/')}
        >
          <ArrowLeftIcon className="w-4 h-4 text-gray-500 dark:text-gray-300" />
          <p className="text-xs font-semibold tracking-tight text-gray-700 dark:text-gray-300">
            Volver
          </p>
        </button>
      </div>
    </div>
  )

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col font-geist-sans w-full md:h-screen md:overflow-hidden overflow-auto">

        {/* header */}
        <div className="flex items-center justify-between bg-white dark:bg-gray-900 w-full px-6 md:px-8">
          <div className="flex items-center gap-3 py-4">
            <button type='button' className="rounded-full p-1.5 active:scale-95 transition-all duration-300 bg-gray-100 dark:bg-gray-800" onClick={() => router.push('/eventos')}>
              <ArrowLeftIcon className="w-4 h-4 text-gray-500 dark:text-white" />
            </button>
            <AnimatedText text={event ? "Editar evento" : "Nuevo evento"} className='!text-2xl font-semibold text-start' />
          </div>

          <button type='button' className="rounded-btn !bg-gray-100 md:hidden scale-90" onClick={() => setShowPreview(!showPreview)}>
            <p className="text-sm font-medium tracking-tight text-gray-600 dark:text-white">
              Vista previa
            </p>
            <EyeIcon className="w-4 h-4 text-gray-500 dark:text-white" />
          </button>
        </div>

        {/* content */}
        <div className="flex flex-col md:flex-row gap-4 mx-auto mt-4 w-full h-max overflow-hidden">

          {/* form content */}
          <div className="flex flex-col gap-4 max-w-md mx-auto w-full h-full px-6 md:px-8 md:overflow-auto">

            <div>
              <label className="label-input">Título del evento *</label>
              <input
                {...register("name")}
                className="input"
                placeholder="Ej: Carrera 5K Primavera"
              />
              {errors.name && (
                <p className="error-input">{errors.name.message}</p>
              )}
            </div>

            <div className="flex flex-row items-start gap-4 max-w-full w-full md:flex-col">
              <div className="w-full max-w-md flex flex-col">
                <label className="label-input">Fecha *</label>
                <input
                  type="date"
                  {...register("date")}
                  className="input w-full"
                />
                {errors.date && (
                  <p className="error-input">{errors.date.message}</p>
                )}
              </div>

              <div className="w-full max-w-md flex flex-col">
                <label className="label-input">Hora *</label>
                <input
                  type="time"
                  {...register("time")}
                  className="input w-full"
                />
                {errors.time && (
                  <p className="error-input">{errors.time.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="label-input">Ubicación *</label>
              <input
                {...register("location")}
                className="input"
                placeholder="Ej: Parque Central, Calle Principal 123"
              />
              {errors.location && (
                <p className="error-input">{errors.location.message}</p>
              )}
            </div>

            <div>
              <label className="label-input">Descripción</label>
              <textarea
                {...register("description")}
                rows={4}
                className="input"
                placeholder="Describe tu evento..."
              />
            </div>

            <div>
              <label className="label-input">Máximo de participantes</label>
              <input
                type="number"
                {...register("maxParticipants", { valueAsNumber: true })}
                className="input"
                placeholder="Ej: 100"
                min="1"
              />
              {errors.maxParticipants && (
                <p className="error-input">{errors.maxParticipants.message}</p>
              )}
            </div>

            <div className='w-full flex flex-col gap-1'>
              <label className="label-input">Imagen del evento</label>
              <div className="w-full border-2 border-dashed border-gray-300 rounded-[12px] p-4 hover:border-gray-400 transition-colors flex items-center justify-center">
                {imageFile?.name || event?.image ? (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3 w-full">
                      <File size={20} className="text-blue-500" />
                      <span className="text-sm font-medium truncate">{imageFile?.name || "Imagen actual"}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setImageFile(undefined)}
                      className="p-1 hover:bg-red-50 rounded"
                    >
                      <Trash size={16} className="text-red-500" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <input
                      accept={ALLOWED_IMAGE_TYPES.join(',')}
                      onChange={handleImageChange}
                      className="hidden"
                      type="file"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <div className="text-gray-500 flex flex-col items-center justify-center">
                        <File size={24} className="mx-auto mb-2" />
                        <p className='text-sm'>Haz clic para seleccionar una imagen</p>
                        <p className="text-xs">PNG, JPG hasta 15MB</p>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className='w-full flex flex-col gap-1'>
              <label className="label-input">Archivo de resultados (.racecheck o .xlsx)</label>
              <div className="w-full border-2 border-dashed border-gray-300 rounded-[12px] p-4 hover:border-gray-400 transition-colors flex items-center justify-center">
                {eventFile?.name || event?.results ? (
                  <div className="flex items-center justify-between w-full px-2">
                    <div className="flex items-center gap-3 w-full">
                      <File size={20} className="text-blue-500" />
                      <p className="text-sm w-full font-medium truncate">{eventFile?.name || "Resultados actuales"}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEventFile(undefined)
                        setParsedResults(undefined)
                      }}
                      className="p-1 hover:bg-red-50 rounded"
                    >
                      <Trash size={16} className="text-red-500 hover:text-red-600" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <input
                      accept={ALLOWED_FILE_EXTENSIONS.join(',')}
                      onChange={handleFileChange}
                      className="hidden"
                      id="race-check-file"
                      type="file"
                    />
                    <label htmlFor="race-check-file" className="cursor-pointer">
                      <div className="text-gray-500 flex flex-col items-center justify-center">
                        <File size={24} className="mx-auto mb-2" />
                        <p className='text-sm'>Haz clic para seleccionar archivo de resultados</p>
                        <p className="text-xs">Archivos .racecheck o .xlsx hasta 10MB</p>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="flex w-full items-center justify-between md:justify-end gap-4 bg-white dark:bg-gray-900 z-10 py-10">
              <button
                type="button"
                className="rounded-btn !text-gray-950 !bg-gray-100 !border-gray-300"
                onClick={() => router.push('/eventos')}
              >
                <p className='text-sm font-medium tracking-tight text-gray-950 dark:text-white'>
                  Cancelar
                </p>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-btn"
              >
                <div className="flex items-center gap-2">
                  <p className='text-sm font-medium tracking-tight text-white dark:text-white'>
                    {isSubmitting ? 'Procesando...' : (event ? 'Actualizar' : 'Guardar')}
                  </p>
                  {isSubmitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <CheckIcon className="w-4 h-4 text-white" />
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* preview pc  */}
          <div className="hidden md:flex w-full flex-col h-full overflow-y-auto items-center justify-start">
            <EventPreview
              event={{
                _id: event?._id || Date.now().toString(),
                name: watch('name') as string,
                date: watch('date') ? new Date(watch('date')).toISOString() : '',
                time: watch('time') as string,
                location: watch('location') as string,
                description: watch('description') as string,
                maxParticipants: parseInt(watch('maxParticipants') as unknown as string) || 0,
                image: imageFile ? URL.createObjectURL(imageFile) : event?.image || '',
                results: parsedResults || event?.results || {} as RaceCheckProps,
                createdBy: session?.user?.email || '',
                createdAt: event?.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }}
            />
          </div>

        </div>
      </form >

      {toast?.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          dismissible={true}
          onDismiss={() => setToast({ message: '', type: 'info', show: false })}
        />
      )}

      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Previsualización del evento"
        showCloseButton={true}
      >
        <EventPreview
          event={{
            _id: event?._id || Date.now().toString(),
            name: watch('name') as string,
            date: watch('date') ? new Date(watch('date')).toISOString() : '',
            time: watch('time') as string,
            location: watch('location') as string,
            description: watch('description') as string,
            maxParticipants: parseInt(watch('maxParticipants') as unknown as string) || 0,
            image: imageFile ? URL.createObjectURL(imageFile) : event?.image || '',
            results: parsedResults || event?.results || {} as RaceCheckProps,
            createdBy: session?.user?.email || '',
            createdAt: event?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }}
        />
      </Modal>
    </>
  )
}
