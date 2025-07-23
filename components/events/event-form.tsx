'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { eventCreateSchema, EventFormData } from '@/lib/schemas/event.schema'
import { File, Trash, Loader2, ArrowLeftIcon, EyeIcon, CheckIcon, ListIcon, ListOrderedIcon, UnderlineIcon, BoldIcon, ItalicIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

const MAX_IMAGE_SIZE = 15 * 1024 * 1024 // 15MB
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_FILE_EXTENSIONS = ['.racecheck', '.xlsx']

import { EventResponse, createEvent, updateEvent, updateEventImage, deleteEventImage } from '@/services/eventService'
import { adminEmails, eventTypes, textToJsonRaceResults } from '@/lib/utils'
import { RaceCheckProps } from '@/lib/schemas/racecheck.schema'
import { SignInButton } from '../ui/sign-in-button'
import { AnimatedText } from '../ui/animated-text'
import { useEffect, useState, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import Toast from '../ui/toast'
import AnimatedLogo from '../ui/animated-logo'
import { ModeToggle } from '../mode-toggle'
import { useEditor, EditorContent } from '@tiptap/react'
import { Editor } from "@tiptap/core";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import History from "@tiptap/extension-history";
import Underline from "@tiptap/extension-underline";
import BulletList from "@tiptap/extension-bullet-list"
import ListItem from "@tiptap/extension-list-item";
import OrderedList from "@tiptap/extension-ordered-list";
import Map from './map'
import { EventCard } from './event-card'

interface EventFormProps {
  event?: EventResponse | null;
}

export default function EventForm({ event }: EventFormProps) {
  const router = useRouter()
  const { data: session, status } = useSession()

  const defaultValues = useMemo(() => event ? {
    name: event.name,
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    locationName: event.locationName || "",
    location: event.location,
    description: event.description || "",
    maxParticipants: event.maxParticipants,
    type: event.type || [],
  } : {
    name: "",
    date: new Date().toISOString().split('T')[0],
    startTime: "09:00",
    endTime: "10:00",
    locationName: "",
    location: { lat: -34.397, lng: 150.644 },
    description: "",
    maxParticipants: 100,
    type: [],
  }, [event])

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
    defaultValues
  })

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      Underline,
      BulletList.configure({
        HTMLAttributes: {
          class: 'list-disc ml-4',
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'list-decimal ml-4',
        },
      }),
      ListItem,
      History
    ],
    editorProps: {
      attributes: {
        class: 'w-full h-full p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gradient-to-b from-white to-white dark:from-gray-950 dark:to-gray-950 outline-none min-h-32'
      }
    },
    content: defaultValues.description,
    onUpdate: ({ editor }: { editor: Editor }) => {
      setValue('description', editor.getHTML())
    },
    immediatelyRender: false
  })

  // Actualizar el editor cuando cambien los valores por defecto
  useEffect(() => {
    if (editor && defaultValues.description !== editor.getHTML()) {
      editor.commands.setContent(defaultValues.description)
    }
  }, [editor, defaultValues.description])

  const [isMounted, setIsMounted] = useState(false)
  const [eventFile, setEventFile] = useState<File | undefined>(undefined)
  const [imageFile, setImageFile] = useState<File | undefined>(undefined)
  const [parsedResults, setParsedResults] = useState<RaceCheckProps | undefined>(event?.results)
  const [isUpdatingImage, setIsUpdatingImage] = useState(false)
  const [currentImageUrl, setCurrentImageUrl] = useState<string>(event?.image || '')
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    show: boolean;
  }>({
    message: '',
    type: 'info',
    show: false
  });

  const imageUrl = useMemo(() => {
    if (imageFile) {
      return URL.createObjectURL(imageFile)
    }
    return currentImageUrl || ''
  }, [imageFile, currentImageUrl])

  // Limpiar URLs de objetos cuando cambie el archivo
  useEffect(() => {
    let objectUrl: string | undefined

    if (imageFile) {
      objectUrl = URL.createObjectURL(imageFile)
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [imageFile])

  const onSubmit = async (data: EventFormData) => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('date', data.date);
      formData.append('startTime', data.startTime);
      formData.append('endTime', data.endTime);
      formData.append('locationName', data.locationName || "");
      formData.append('location', JSON.stringify({ lat: data.location.lat, lng: data.location.lng }));
      formData.append('description', data.description || '');
      formData.append('maxParticipants', data.maxParticipants?.toString() || '0');

      // Corregir el envío del array de tipos
      if (data.type && data.type.length > 0) {
        data.type.forEach((type, index) => {
          formData.append(`type[${index}]`, type);
        });
      }

      if (parsedResults) {
        formData.append('results', JSON.stringify(parsedResults));
      }
      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (event?._id) {
        await updateEvent(event._id, formData);
        setToast({
          message: 'Evento actualizado exitosamente',
          type: 'success',
          show: true
        })
      } else {
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
      setValue('results', undefined)
      router.push('/')
    } catch (error) {
      console.error('Error procesando evento:', error)
      setToast({
        message: 'Error al procesar el evento',
        type: 'error',
        show: true
      })
    }
  }

  const handleLocationSelect = (location: { lat: number; lng: number }, locationName: string) => {
    setValue('location', { lat: location.lat, lng: location.lng });
    setValue('locationName', locationName);
  };

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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      validateFile(file, {
        maxSize: MAX_IMAGE_SIZE,
        allowedTypes: ALLOWED_IMAGE_TYPES
      })

      // Si estamos editando un evento existente, actualizar la imagen inmediatamente
      if (event?._id) {
        setIsUpdatingImage(true)
        try {
          const result = await updateEventImage(event._id, file, true)
          setToast({
            message: 'Imagen actualizada exitosamente',
            type: 'success',
            show: true
          })
          // Actualizar la URL de la imagen en el estado sin recargar la página
          setCurrentImageUrl(result.data.imageUrl)
          setImageFile(undefined) // Limpiar el archivo temporal
        } catch (error) {
          console.error('Error actualizando imagen:', error)
          setToast({
            message: 'Error al actualizar la imagen',
            type: 'error',
            show: true
          })
        } finally {
          setIsUpdatingImage(false)
        }
      } else {
        // Para nuevos eventos, solo guardar el archivo temporalmente
        setImageFile(file)
      }
    } catch (error) {
      if (error instanceof Error) {
        setToast({
          message: error.message,
          type: 'error',
          show: true
        })
      }
    }
  }

  const handleDeleteImage = async () => {
    if (!event?._id) return

    setIsUpdatingImage(true)
    try {
      await deleteEventImage(event._id)
      setToast({
        message: 'Imagen eliminada exitosamente',
        type: 'success',
        show: true
      })
      // Actualizar el estado sin recargar la página
      setCurrentImageUrl('')
    } catch (error) {
      console.error('Error eliminando imagen:', error)
      setToast({
        message: 'Error al eliminar la imagen',
        type: 'error',
        show: true
      })
    } finally {
      setIsUpdatingImage(false)
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

      const results = await textToJsonRaceResults(await file.text())
      console.log(file)
      setParsedResults(results)
      setValue('results', results)

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

  if (!session?.user?.email && status === 'unauthenticated') return (
    <div className="h-screen w-full flex items-center justify-center">
      <div className="flex flex-col gap-4 max-w-md mx-auto w-full h-full px-3 md:px-6 py-10">
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
        <div className="flex flex-col md:flex-row gap-4 mx-auto w-full h-max overflow-hidden relative">
          {/* form content */}
          <div className="flex flex-col gap-6 max-w-xl mx-auto w-full h-full px-3 md:pb-10 overflow-y-auto relative">

            <div className="flex w-full items-center gap-3 py-2">
              <button
                type="button"
                className={`h-10 rounded-full w-10 flex items-center justify-center
                           relative select-none gap-2
                           bg-gradient-to-b from-white to-white dark:from-gray-950 dark:to-gray-950
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

            <div>
              <label className="label-input">Descripción</label>
              <div className="flex flex-col w-full gap-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`p-2 rounded ${editor?.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700' : 'bg-transparent'}`}
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                  >
                    <BoldIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>

                  <button
                    type="button"
                    className={`p-2 rounded ${editor?.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700' : 'bg-transparent'}`}
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                  >
                    <ItalicIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>

                  <button
                    type="button"
                    className={`p-2 rounded ${editor?.isActive('underline') ? 'bg-gray-200 dark:bg-gray-700' : 'bg-transparent'}`}
                    onClick={() => editor?.chain().focus().toggleMark('underline').run()}
                  >
                    <UnderlineIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>

                  <button
                    type="button"
                    className={`p-2 rounded ${editor?.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-700' : 'bg-transparent'}`}
                    onClick={() => editor?.chain().focus().toggleBulletList().run()}
                    title="Lista con viñetas"
                  >
                    <ListIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>

                  <button
                    type="button"
                    className={`p-2 rounded ${editor?.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-700' : 'bg-transparent'}`}
                    onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                    title="Lista numerada"
                  >
                    <ListOrderedIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>

                <EditorContent editor={editor} />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="label-input">Tipo de evento *</label>
              <div className="flex items-center gap-2 w-full">
                <div className="flex gap-2 w-full flex-wrap">
                  {eventTypes?.map((type) => {
                    const isSelected = watch("type")?.includes(type.value)
                    return (
                      <button type='button' key={type.value} className={`rounded-btn !bg-transparent ${isSelected ? "" : "opacity-50"}`}
                        onClick={() => {
                          const currentTypes = watch("type") || []
                          if (isSelected) {
                            setValue("type", currentTypes.filter((t) => t !== type.value))
                          } else {
                            setValue("type", [...currentTypes, type.value])
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
              {errors.type && (
                <p className="error-input">{errors.type.message}</p>
              )}
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

              <Map
                onLocationSelect={handleLocationSelect}
                value={watch('location')}
              />

              {errors.location && (
                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-5 h-5 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
                        <span className="text-red-600 dark:text-red-400 text-xs font-medium">!</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.location.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {errors.locationName && (
                <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                    Advertencia de ubicación:
                  </p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                    {errors.locationName.message}
                  </p>
                </div>
              )}
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
                {isUpdatingImage ? (
                  <div className="flex items-center justify-center w-full py-4">
                    <Loader2 size={20} className="animate-spin text-blue-500" />
                    <span className="text-sm font-medium ml-2">Actualizando imagen...</span>
                  </div>
                ) : imageFile?.name || currentImageUrl ? (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3 w-full">
                      <File size={20} className="text-blue-500" />
                      <span className="text-sm font-medium truncate">{imageFile?.name || "Imagen actual"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {event?._id && currentImageUrl && (
                        <button
                          type="button"
                          onClick={handleDeleteImage}
                          className="p-1 hover:bg-red-50 rounded"
                          title="Eliminar imagen actual"
                        >
                          <Trash size={16} className="text-red-500" />
                        </button>
                      )}
                      {imageFile && (
                        <button
                          type="button"
                          onClick={() => setImageFile(undefined)}
                          className="p-1 hover:bg-red-50 rounded"
                          title="Cancelar nueva imagen"
                        >
                          <Trash size={16} className="text-red-500" />
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <input
                      accept={ALLOWED_IMAGE_TYPES.join(',')}
                      onChange={handleImageChange}
                      className="hidden"
                      type="file"
                      id="image-upload"
                      disabled={isUpdatingImage}
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
            </div>

            <div className='w-full flex flex-col gap-1'>
              <label className="label-input">Archivo de resultados (.racecheck o .xlsx)</label>
              <div className="file-input">
                {parsedResults ? (
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
                        setValue('results', { categories: [], participants: [] })
                        const fileInput = document.getElementById('race-check-file') as HTMLInputElement
                        if (fileInput) {
                          fileInput.value = ''
                        }
                      }}
                      className="p-1 hover:bg-red-50 rounded"
                      title={eventFile?.name ? "Eliminar archivo seleccionado" : "Eliminar resultados actuales"}
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
                      disabled={isSubmitting}
                    />
                    <label htmlFor="race-check-file" className={`cursor-pointer ${isSubmitting ? 'opacity-50' : ''}`}>
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

            <div className="md:flex items-center justify-end hidden">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-2xl px-5 py-3 !bg-gray-950 dark:!bg-white"
              >
                <div className="flex items-center gap-2">
                  <p className='text-sm font-medium tracking-tight text-white dark:text-gray-950'>
                    {isSubmitting ? 'Procesando...' : (event ? 'Guardar cambios' : 'Crear evento')}
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
          < div className="w-full flex flex-col gap-3 h-full items-center justify-start p-3 overflow-y-auto" >
            <div className="flex items-center gap-2 w-full justify-center">
              <EyeIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <p className="text-sm font-medium tracking-tight text-gray-600 dark:text-gray-400">
                Vista previa
              </p>
            </div>

            <div className="flex flex-col gap-6 w-full max-w-[300px] items-end justify-center mx-auto pb-10">
              <EventCard
                event={{
                  _id: event?._id || Date.now().toString(),
                  name: watch('name') as string,
                  date: watch('date') ? new Date(watch('date')).toISOString() : '',
                  startTime: watch('startTime'),
                  endTime: watch('endTime'),
                  location: watch('location'),
                  locationName: watch('locationName') as string,
                  description: watch('description') as string,
                  maxParticipants: parseInt(watch('maxParticipants') as unknown as string) || 0,
                  image: imageUrl,
                  results: parsedResults || {} as RaceCheckProps,
                  createdBy: session?.user?.email || '',
                  createdAt: event?.createdAt || new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  type: watch('type') as string[],
                }}
                previewMode={true}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="md:hidden block rounded-btn !bg-gray-950 dark:!bg-white"
              >
                <div className="flex items-center gap-2">
                  <p className='text-sm font-medium tracking-tight text-white dark:text-gray-950'>
                    {isSubmitting ? 'Procesando...' : (event ? 'Guardar cambios' : 'Crear evento')}
                  </p>
                  {isSubmitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <CheckIcon className="w-4 h-4 text-white dark:text-gray-950" />
                  )}
                </div>
              </button>

            </div>
          </div>

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


    </div >
  )
}
