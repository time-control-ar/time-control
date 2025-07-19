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
import { adminEmails, eventTypes, textToJsonRaceResults } from '@/lib/utils'
import { RaceCheckProps } from '@/lib/schemas/racecheck.schema'
import { SignInButton } from '../ui/sign-in-button'
import { AnimatedText } from '../ui/animated-text'
import { useEffect, useState, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import Modal from '../ui/modal'
import Toast from '../ui/toast'
import EventPreview from './event-preview'
import AnimatedLogo from '../ui/animated-logo'
import { ModeToggle } from '../mode-toggle'

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
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<EventFormData>({
    resolver: zodResolver(eventCreateSchema),
    mode: 'onBlur',
    defaultValues: event || {
      name: "",
      date: new Date().toISOString().split('T')[0],
      startTime: "09:00",
      endTime: "10:00",
      location: "",
      description: "",
      maxParticipants: 100,
      type: [],
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

  // Memoizar la URL de la imagen para evitar recargas innecesarias
  const imageUrl = useMemo(() => {
    if (imageFile) {
      return URL.createObjectURL(imageFile)
    }
    return event?.image || ''
  }, [imageFile, event?.image])

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
      formData.append('startTime', data.startTime);
      formData.append('endTime', data.endTime);
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
    <div className="w-full max-w-xl mx-auto flex flex-col gap-3 p-6 min-h-full">
      <div className="flex flex-col gap-4 max-w-md mx-auto w-full h-full">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Debes iniciar sesión para gestionar eventos
        </p>

        <div className="flex items-center justify-between gap-4 w-full">
          <button type="button" className="rounded-btn !bg-gray-100 dark:!bg-gray-800 !border-gray-300 flex items-center gap-2"
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
        <button type="button" className="rounded-btn !bg-gray-100 dark:!bg-gray-800 !border-gray-300 flex items-center gap-2"
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
    <div className='w-full flex flex-col h-full overflow-hidden md:h-screen'>
      <div className="px-6 w-full flex justify-between items-center max-w-7xl mx-auto">
        <AnimatedLogo />

        <div className="flex items-center gap-2">
          <ModeToggle />
          <SignInButton />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col font-geist-sans w-full max-h-full overflow-hidden relative max-w-7xl mx-auto">

        {/* content */}
        <div className="flex flex-col md:flex-row gap-4 mx-auto mt-4 w-full h-max overflow-hidden relative">
          {/* form content */}
          <div className="flex flex-col gap-6 max-w-md mx-auto w-full h-full px-6 md:px-8 overflow-y-auto relative">

            <div className="flex w-full items-center gap-3 py-2 sticky top-0 z-10 bg-white dark:bg-gray-950">
              <button
                type="button"
                className={`h-10 rounded-full w-10 flex items-center justify-center
                           relative select-none gap-2
                           bg-gradient-to-t from-white to-white dark:from-gray-800 dark:to-gray-900
                           border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
                onClick={() => router.push('/')}
              >
                <ArrowLeftIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button >
              <AnimatedText text={event ? "Editar evento" : "Nuevo evento"} className='!text-2xl font-semibold text-start' />
            </div >

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

            <div className="flex flex-col gap-2">
              <label className="label-input">Tipo de evento *</label>
              <div className="flex items-center gap-2 w-full">
                <div className="flex gap-2 w-full flex-wrap">
                  {eventTypes.map((type) => {
                    const isSelected = watch("type").includes(type.value)
                    return (
                      <button type='button' key={type.value} className={`rounded-btn !bg-transparent ${isSelected ? "" : "opacity-50"}`}
                        onClick={() => {
                          if (isSelected) {
                            setValue("type", watch("type").filter((t) => t !== type.value))
                          } else {
                            setValue("type", [...watch("type"), type.value])
                          }
                        }}
                      >
                        <div className="rounded-xl p-1 h-6 w-6 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          {isSelected && (
                            <CheckIcon className="w-5 h-5 text-gray-950 dark:text-white" />
                          )}
                        </div>
                        <p className={`text-base font-medium tracking-tight ${isSelected ? "text-gray-950 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>
                          {type.name}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 max-w-full w-full flex-col">
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
                className="input min-h-24 h-full max-h-48 py-3"
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
              <div className="file-input">
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
              <div className="file-input">
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

            <div className="flex w-full items-center justify-between md:justify-end gap-4 z-10 py-10">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className={`h-10 px-4 rounded-full flex items-center justify-center md:hidden w-max sticky top-0 z-10
                          select-none gap-2
                           bg-gradient-to-t from-white to-white dark:from-gray-800 dark:to-gray-900
                           border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
              >
                <EyeIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <p className="text-sm font-medium tracking-tight text-gray-600 dark:text-gray-400">
                  Vista previa
                </p>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-btn !bg-gray-950 dark:!bg-white"
              >
                <div className="flex items-center gap-2">
                  <p className='text-sm font-medium tracking-tight text-white dark:text-gray-950'>
                    {isSubmitting ? 'Procesando...' : (event ? 'Actualizar' : 'Guardar')}
                  </p>
                  {isSubmitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <CheckIcon className="w-4 h-4 text-white dark:text-gray-950" />
                  )}
                </div>
              </button>
            </div>
          </div >

          {/* preview pc  */}
          < div className="hidden md:flex w-full flex-col h-full overflow-y-auto items-center justify-start" >
            <EventPreview
              event={{
                _id: event?._id || Date.now().toString(),
                name: watch('name') as string,
                date: watch('date') ? new Date(watch('date')).toISOString() : '',
                startTime: watch('startTime') as string,
                endTime: watch('endTime') as string,
                location: watch('location') as string,
                description: watch('description') as string,
                maxParticipants: parseInt(watch('maxParticipants') as unknown as string) || 0,
                image: imageUrl,
                results: parsedResults || event?.results || {} as RaceCheckProps,
                createdBy: session?.user?.email || '',
                createdAt: event?.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                type: watch('type') as string[],
              }}
            />
          </div >

        </div >
      </form >


      {toast?.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          dismissible={true}
          onDismiss={() => setToast({ message: '', type: 'info', show: false })}
        />
      )
      }

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
            startTime: watch('startTime') as string,
            endTime: watch('endTime') as string,
            location: watch('location') as string,
            description: watch('description') as string,
            maxParticipants: parseInt(watch('maxParticipants') as unknown as string) || 0,
            image: imageUrl,
            results: parsedResults || event?.results || {} as RaceCheckProps,
            createdBy: session?.user?.email || '',
            createdAt: event?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            type: watch('type') as string[],
          }}
        />
      </Modal>
    </div >
  )
}
