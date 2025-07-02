'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { eventSchema, EventFormData } from '@/lib/schemas/event.schema'
import { createEvent } from '@/services/eventService'
import { File, Trash, Loader2, ArrowLeftIcon, EyeIcon, InfoIcon, ChartBarIcon, CheckIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

const MAX_IMAGE_SIZE = 15 * 1024 * 1024 // 15MB
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_FILE_EXTENSIONS = ['.racecheck', '.xlsx']

import { EventCard } from './event-card'
import { EventProps, textToJsonRaceResults } from '@/lib/utils'
import { AnimatedText } from '../ui/animated-text'
import Toast from '../ui/toast'
import Modal from '../ui/modal'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function EventForm() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    mode: 'onBlur'
  })

  const [isMounted, setIsMounted] = useState(false)
  const [eventFile, setEventFile] = useState<File | undefined>(undefined)
  const [imageFile, setImageFile] = useState<File | undefined>(undefined)
  const [parsedResults, setParsedResults] = useState<EventProps | undefined>(undefined)
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
  const [selectedTab, setSelectedTab] = useState<'info' | 'results'>('info')

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
      const formData = new FormData()

      // Agregar datos del formulario
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          formData.append(key, value.toString())
        }
      })

      // Agregar archivos si existen
      if (imageFile) formData.append('image', imageFile)
      if (eventFile) formData.append('results', eventFile)

      // Agregar datos parseados si existen
      if (parsedResults) {
        formData.append('parsedResults', JSON.stringify(parsedResults))
      }

      await createEvent(formData)

      setToast({
        message: 'Evento creado exitosamente',
        type: 'success',
        show: true
      })

      reset()
      setImageFile(undefined)
      setEventFile(undefined)
      setParsedResults(undefined)
      router.push('/eventos')
    } catch (error) {
      console.error('Error creando evento:', error)
      setToast({
        message: 'Error al crear el evento',
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

  const handleTabChange = (tab: 'info' | 'results') => {
    setSelectedTab(tab)
  }

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return (
    <>
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
        title="Preview"
        showCloseButton={true}
      >
        <div className="flex w-full gap-3 pt-6">
          <button
            onClick={() => handleTabChange('info')}
            className={`rounded-btn ${selectedTab === 'info' ? '!bg-gray-200 !dark:bg-gray-700' : '!bg-transparent'}`}>
            <InfoIcon className="w-4 h-4 text-gray-500 z-20" />
            <p className="text-xs font-medium tracking-tight text-gray-950 dark:text-white">
              Información
            </p>
          </button>
          <button
            onClick={() => handleTabChange('results')}
            className={`rounded-btn ${selectedTab === 'results' ? '!bg-gray-200 !dark:bg-gray-700' : '!bg-transparent'}`}>
            <ChartBarIcon className="w-4 h-4 text-gray-500 z-20" />
            <p className="text-xs font-medium tracking-tight text-gray-950 dark:text-white">
              Resultados
            </p>
          </button>
        </div>

        <div className="p-2">
          <AnimatePresence mode="wait">
            {selectedTab === 'info' ? (
              <motion.div
                key="info"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-3 pt-6"
              >
                <EventCard
                  event={{
                    id: '',
                    name: watch('name') as string,
                    date: watch('date') ? new Date(watch('date')).toISOString() : '',
                    time: watch('time') as string,
                    location: watch('location') as string,
                    description: watch('description') as string,
                    imageUrl: imageFile ? URL.createObjectURL(imageFile) : '',
                    categories: parsedResults?.categories || [],
                    participants: parsedResults?.participants || []
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-3 pt-6"
              >
                {parsedResults ? (
                  <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-medium">Resultados cargados</h3>
                    <div className="flex flex-col gap-2">
                      <p className="text-sm text-gray-500">
                        Categorías: {parsedResults.categories.length}
                      </p>
                      <p className="text-sm text-gray-500">
                        Participantes: {parsedResults.participants.length}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No hay resultados cargados</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Modal>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-max">

        {/* header */}
        <div className="sticky md:relative top-0 left-0 z-10 px-6 pt-2 flex items-center justify-between bg-white dark:bg-gray-900">
          <div className="flex items-center gap-3 py-4">
            <button type='button' className="rounded-full p-1.5 active:scale-95 transition-all duration-300 bg-gray-100 dark:bg-gray-800" onClick={() => router.push('/eventos')}>
              <ArrowLeftIcon className="w-4 h-4 text-gray-500 dark:text-white" />
            </button>
            <AnimatedText text="Nuevo evento" className='!text-2xl font-semibold text-start' />
          </div>

          <button type='button' className="rounded-btn !bg-transparent md:hidden" onClick={() => setShowPreview(!showPreview)}>
            <EyeIcon className="w-4 h-4 text-gray-500 dark:text-white" />
            <p className="text-sm font-medium tracking-tight text-gray-950 dark:text-white">
              Preview
            </p>
          </button>
        </div>

        {/* content */}
        <div className="flex flex-col md:flex-row gap-4 mx-auto mt-4 w-full h-full px-12">

          <div className="flex flex-col gap-4 h-max max-w-md mx-auto w-full">

            <div>
              <label className="block text-sm font-medium mb-2">Título del evento *</label>
              <input
                {...register("name")}
                className="input"
                placeholder="Ej: Carrera 5K Primavera"
              />
              {errors.name && (
                <p className="error-input">{errors.name.message}</p>
              )}
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 w-full">
              <div className="w-full max-w-md flex flex-col">
                <label className="block text-sm font-medium mb-2">Fecha *</label>
                <input
                  type="date"
                  {...register("date")}
                  className="input"
                />
                {errors.date && (
                  <p className="error-input">{errors.date.message}</p>
                )}
              </div>

              <div className="w-full max-w-md flex flex-col">
                <label className="block text-sm font-medium mb-2">Hora *</label>
                <input
                  type="time"
                  {...register("time")}
                  className="input"
                />
                {errors.time && (
                  <p className="error-input">{errors.time.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Ubicación *</label>
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
              <label className="block text-sm font-medium mb-2">Descripción</label>
              <textarea
                {...register("description")}
                rows={4}
                className="input"
                placeholder="Describe tu evento..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Máximo de participantes</label>
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

            <div>
              <label className="block text-sm font-medium mb-2">Imagen del evento</label>
              <div className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                {imageFile?.name ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <File size={20} className="text-blue-500" />
                      <span className="text-sm font-medium truncate">{imageFile.name}</span>
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
                      <div className="text-gray-500">
                        <File size={24} className="mx-auto mb-2" />
                        <p>Haz clic para seleccionar una imagen</p>
                        <p className="text-xs">PNG, JPG hasta 15MB</p>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Archivo de resultados (.racecheck o .xlsx)</label>
              <div className="w-full border-2 border-dashed border-gray-300 rounded-[12px] p-4 hover:border-gray-400 transition-colors">
                {eventFile?.name ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <File size={20} className="text-blue-500" />
                      <span className="text-sm font-medium truncate">{eventFile.name}</span>
                      {parsedResults && (
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                          ✓ Parseado
                        </span>
                      )}
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
                      <div className="text-gray-500">
                        <File size={24} className="mx-auto mb-2" />
                        <p>Haz clic para seleccionar archivo de resultados</p>
                        <p className="text-xs">Archivos .racecheck o .xlsx hasta 10MB</p>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-4 bg-white dark:bg-gray-900 z-10 py-10">
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
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className='text-sm font-medium tracking-tight text-white dark:text-white'>
                      Guardar
                    </p>
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            </div>
          </div>

          <div className="hidden md:flex h-full sticky top-0 left-0 w-full flex-col items-center justify-center p-4 md:p-6">
            <p className="text-sm font-medium tracking-tight text-gray-950 dark:text-white">
              Preview
            </p>

            <div className="flex items-center justify-center gap-3 w-full my-3">
              <button className={`rounded-btn ${selectedTab === 'info' ? '!bg-gray-100 !dark:bg-gray-700' : '!bg-transparent'}`} onClick={() => handleTabChange('info')}>
                <InfoIcon className="w-4 h-4 text-gray-500 dark:text-white" />
                <p className="text-sm font-medium tracking-tight text-gray-950 dark:text-white">
                  Información
                </p>
              </button>
              <button className={`rounded-btn ${selectedTab === 'results' ? '!bg-gray-100 !dark:bg-gray-700' : '!bg-transparent'}`} onClick={() => handleTabChange('results')}>
                <ChartBarIcon className="w-4 h-4 text-gray-500 dark:text-white" />
                <p className="text-sm font-medium tracking-tight text-gray-950 dark:text-white">
                  Resultados
                </p>
              </button>
            </div>

            <div className="w-full max-w-[350px] h-[2px] bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent rounded-full my-6 mt-4">
            </div>

            <div className="w-full max-w-[350px] sticky top-0 left-0 p-4">
              <motion.div
                className="w-full max-w-[350px]"
              >
                <EventCard
                  event={{
                    id: '',
                    name: watch('name') as string,
                    date: watch('date') ? new Date(watch('date')).toISOString() : '',
                    time: watch('time') as string,
                    location: watch('location') as string,
                    description: watch('description') as string,
                    imageUrl: imageFile ? URL.createObjectURL(imageFile) : '',
                    categories: parsedResults?.categories || [],
                    participants: parsedResults?.participants || []
                  }}
                />
              </motion.div>
            </div>
          </div>

        </div>

      </form >
    </>
  )
}
