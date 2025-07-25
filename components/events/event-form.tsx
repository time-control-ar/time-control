'use client'

import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { eventCreateSchema, EventFormData, EventResponse } from '@/lib/schemas/event.schema'
import { File, Loader2, ArrowLeftIcon, EyeIcon, CheckIcon, ListIcon, ListOrderedIcon, UnderlineIcon, BoldIcon, ItalicIcon, TrashIcon, PlusIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

const MAX_IMAGE_SIZE = 15 * 1024 * 1024 // 15MB
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_FILE_EXTENSIONS = ['.racecheck']

import { adminEmails, eventTypes, validateFile, Category, Modality } from '@/lib/utils'
import { SignInButton } from '../ui/sign-in-button'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
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
import { z } from 'zod'
import { createEvent, updateEvent, uploadImageToAzure } from '@/services/eventService'
import QRGenerator from './qr-generator'
import Toast from '../ui/toast'

const NewCategoryForm = ({ append }: { append: (category: Category) => void }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Category>({
    resolver: zodResolver(z.object({
      name: z.string().min(1, "Campo requerido"),
      matchsWith: z.string().min(1, "Campo requerido")
    }))
  })

  const onSubmit = (data: Category) => {
    append(data)
    reset()
  }

  return (
    <div className='flex items-end gap-2 w-full mt-4'>
      <div className='grid grid-cols-2 gap-2 w-full'>
        <div className='flex flex-col gap-1'>
          <input
            type="text"
            className='input w-full'
            placeholder='ej. 10K'
            {...register('name')}
          />
          {errors.name && (
            <p className="error-input">{errors.name.message}</p>
          )}
        </div>

        <div className='flex flex-col gap-1 w-full'>
          <input
            type="text"
            className='input w-full'
            placeholder='ej. 10K L'
            {...register('matchsWith')}
          />
          {errors.matchsWith && (
            <p className="error-input">{errors.matchsWith.message}</p>
          )}
        </div>
      </div>

      <button
        type='button'
        className='rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-75 w-max h-max mb-2'
        onClick={handleSubmit(onSubmit)}
      >
        <PlusIcon className='w-4 h-4 text-gray-500 dark:text-gray-400' />
      </button>
    </div >
  )
}
const NewModalityForm = ({ append }: { append: (modality: Modality) => void }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Modality>({
    resolver: zodResolver(z.object({
      name: z.string().min(1, "Campo requerido"),
      matchsWith: z.string().min(1, "Campo requerido")
    }))
  })

  const onSubmit = (data: Modality) => {
    append(data)
    reset()
  }

  return (
    <div className='flex items-end gap-2 w-full mt-4'>
      <div className='grid grid-cols-2 gap-2 w-full'>
        <div className='flex flex-col gap-1'>
          <input
            type="text"
            className='input w-full'
            placeholder='ej. 10K'
            {...register('name')}
          />
          {errors.name && (
            <p className="error-input">{errors.name.message}</p>
          )}
        </div>

        <div className='flex flex-col gap-1 w-full'>
          <input
            type="text"
            className='input w-full'
            placeholder='ej. 10K L'
            {...register('matchsWith')}
          />
          {errors.matchsWith && (
            <p className="error-input">{errors.matchsWith.message}</p>
          )}
        </div>
      </div>

      <button
        type='button'
        className='rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-75 w-max h-max mb-2'
        onClick={handleSubmit(onSubmit)}
      >
        <PlusIcon className='w-4 h-4 text-gray-500 dark:text-gray-400' />
      </button>
    </div >
  )
}

interface EventFormProps {
  event?: EventResponse | null;
}

export default function EventForm({ event }: EventFormProps) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [stayAfterCreation, setStayAfterCreation] = useState(false)

  const defaultValues = {
    name: event?.name || "",
    image: event?.image || "",
    date: event?.date || "",
    startTime: event?.startTime || "",
    endTime: event?.endTime || "",
    locationName: event?.locationName || "",
    location: event?.location || { lat: -34.397, lng: 150.644 },
    description: event?.description || "",
    maxParticipants: event?.maxParticipants || 100,
    categories: event?.categories || [],
    modalities: event?.modalities || [],
    racecheck: event?.racecheck || null,
    type: event?.type || "",
  }

  const isNewEvent = !event?._id

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting }
  } = useForm<EventFormData>({
    resolver: zodResolver(eventCreateSchema),
    mode: 'onBlur',
    defaultValues
  })

  const { fields: modalities, append: appendModality, remove: removeModality } = useFieldArray({
    control,
    name: 'modalities'
  })
  const { fields: categories, append: appendCategory, remove: removeCategory } = useFieldArray({
    control,
    name: 'categories'
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
        class: 'w-full h-full p-3.5 rounded-2xl border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 outline-none min-h-32 focus:border-gray-400 dark:focus:border-gray-700'
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

  const onSubmit = async (data: EventFormData) => {
    try {
      const safeParsedData = eventCreateSchema.safeParse(data)
      if (!safeParsedData.success) {
        setToast({
          message: safeParsedData.error.message,
          type: 'error',
          show: true
        })
        return
      }


      if (isNewEvent) {
        await createEvent(safeParsedData.data);

        setToast({
          message: 'Evento creado exitosamente',
          type: 'success',
          show: true
        })
      } else {
        await updateEvent(event._id, safeParsedData.data);
        setToast({
          message: 'Evento actualizado exitosamente',
          type: 'success',
          show: true
        })
      }

      reset()

      router.push(`/`)


    } catch {
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
    <div className='flex flex-col w-full h-screen overflow-auto relative'>
      <div className="px-6 w-full flex justify-between items-center max-w-5xl mx-auto">
        <AnimatedLogo />

        <div className="flex items-center gap-2">
          <ModeToggle />
          <SignInButton />
        </div>
      </div>

      <div className="px-6 w-full my-6 bg-white dark:bg-gray-950 py-3">
        <div className="flex items-center max-w-sm lg:max-w-5xl mx-auto px-4 gap-3">

          <button
            type="button"
            className={`h-8 rounded-full w-8 flex items-center justify-center
            relative select-none gap-2
            bg-gradient-to-b from-white to-white dark:from-gray-950 dark:to-gray-950
            border-2 border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
            onClick={() => router.push('/')}
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button >

          <h1 className='text-2xl font-semibold text-start tracking-tight'>
            {event ? "Editar evento" : "Nuevo evento"}
          </h1>
        </div>
      </div>


      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-12 lg:flex-row mx-auto h-max w-full max-w-5xl items-center lg:items-start"
      >

        <div className="flex flex-col gap-8 px-6 max-w-md h-max lg:pb-12">

          <div className="flex h-max gap-1 w-full">
            <div className="flex flex-col items-start gap-1 w-full">
              <label className="label-input">Título *</label>
              <input
                {...register("name")}
                className="input"
                placeholder="Ej: Carrera 5K Primavera"
              />
              {errors.name && (
                <p className="error-input">{errors.name.message}</p>
              )}
              {errors.maxParticipants && (
                <p className="error-input">Cupos inválidos, debe ser un número mayor a 0</p>
              )}
            </div>

            <div className="w-[150px] flex flex-col items-start gap-1">
              <label className="label-input">
                Cupos máx.
              </label>

              <input
                type="number"
                {...register("maxParticipants", { valueAsNumber: true })}
                className="input"
                placeholder="Ej: 100"
                min="1"
              />
            </div>
          </div>

          <div className='w-full flex flex-col gap-1'>
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
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-600 font-medium">
                  Advertencia de ubicación:
                </p>
                <p className="text-sm text-yellow-600 mt-1">
                  {errors.locationName.message}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-start w-full flex-col gap-4">
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

          <div className="flex flex-col gap-2">
            <label className="label-input">Tipo de evento *</label>
            <div className="flex items-center gap-2 w-full">
              <div className="flex gap-2 w-full flex-wrap">
                {eventTypes?.map((type, index) => {
                  const isSelected = watch("type") === type.value
                  return (
                    <button
                      type='button'
                      key={`${type.value}-${index}`}
                      className={`chip_filter
                        ${isSelected ? "" : "opacity-50"}`}
                      onClick={() => setValue("type", type.value)}
                    >
                      <div className="rounded-xl p-1 h-5 w-5 bg-gray-100 dark:bg-gray-800 flex items-center justify-center transition-all duration-75">
                        {isSelected && (
                          <div>
                            <CheckIcon className="w-5 h-5 text-gray-950 dark:text-white" />
                          </div>
                        )}

                      </div>
                      <p className={`text-sm font-medium ${isSelected ? "text-gray-950 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>
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

          <div className='w-full flex flex-col gap-1'>
            <label className="label-input">Imagen del evento</label>
            <div
              className={`w-full h-max rounded-2xl shadow-lg md:shadow-none p-3 border-2 
                ${!currentImageUrl ? "border-dashed" : ""} 
                border-gray-100 dark:border-gray-800`}
            >
              {isUpdatingImage ? (
                <div className="flex items-center justify-center w-full gap-2">
                  <Loader2 size={20} className="animate-spin text-black dark:text-white" />
                  <span className="text-sm font-medium ml-2">Actualizando imagen...</span>
                </div>
              ) : currentImageUrl ? (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3 w-full">
                    <File size={20} className="text-black dark:text-white" />
                    <span className="text-sm font-medium truncate">Imagen actual</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="rounded-full bg-red-600 flex items-center justify-center p-2 hover:bg-red-700 transition-all duration-75 w-max"
                      onClick={() => {
                        setCurrentImageUrl('')
                        setValue('image', '')
                      }}
                    >
                      <TrashIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-3">
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
          </div>

          <div className='flex flex-col gap-1 mt-4'>
            <label className="label-input">Resultados (.racecheck)</label>

            <div className={`w-full h-max rounded-2xl shadow-lg md:shadow-none p-3 border-2 
              ${watch('racecheck') ? "" : "border-dashed"} border-gray-100 dark:border-gray-800`}>

              {watch('racecheck') ? (
                <div className="flex gap-3 relative -mx-3">
                  <div className="flex items-center gap-2 w-full px-3">
                    <div>
                      <File className="text-black dark:text-white w-5 h-5" />
                    </div>
                    <p className="text-sm w-full font-medium truncate">
                      Resultados actuales
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
                </div>
              ) : (
                <div className="text-center">
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
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className='label-input'>
              Modalidades ({modalities.length})
            </label>

            <div className='rounded-3xl overflow-hidden border-2 border-gray-50 dark:border-gray-800 p-3'>

              <div className='flex px-2' >
                <label className='label-input w-full'>Nombre</label>
                <label className='label-input w-full -ml-3'>Empieza con <br />
                  <span className='text-xs text-gray-500 dark:text-gray-400'>(en .racecheck)</span>
                </label>
              </div>

              <div className="flex flex-col gap-3 divide divide-gray-100 dark:divide-y-800">

                {modalities?.map((modality: Modality, index: number) => (
                  <div className='flex items-end gap-2 w-full' key={index}>
                    <div className="px-3 w-full">
                      {modality.name}
                    </div>
                    <div className="px-3 w-full">
                      {modality.matchsWith}
                    </div>
                    <button type='button' className='rounded-full bg-red-600 flex items-center justify-center p-2 hover:bg-red-700 transition-all duration-75 w-max h-max' onClick={() => removeModality(index)}>
                      <TrashIcon className='w-4 h-4 text-white' strokeWidth={2.5} />
                    </button>
                  </div>
                ))}
              </div>

              <NewModalityForm append={appendModality} />
            </div>

          </div>

          <div className="flex flex-col gap-1">
            <label className='label-input'>
              Categorías ({categories.length})
            </label>

            <div className='rounded-3xl overflow-hidden border-2 border-gray-50 dark:border-gray-800 p-3'>
              <div className='flex px-2' >
                <label className='label-input w-full'>Nombre</label>
                <label className='label-input w-full -ml-3'>Empieza con <br />
                  <span className='text-xs text-gray-500 dark:text-gray-400'>(en .racecheck)</span>
                </label>
              </div>

              <div className="flex flex-col gap-3 divide divide-gray-100 dark:divide-y-800">

                {categories?.map((category: Category, index: number) => (
                  <div className='flex items-end gap-2 w-full' key={index}>
                    <div className="px-3 w-full">
                      {category.name}
                    </div>
                    <div className="px-3 w-full">
                      {category.matchsWith}
                    </div>
                    <button type='button' className='rounded-full bg-red-600 flex items-center justify-center p-2 hover:bg-red-700 transition-all duration-75 w-max h-max' onClick={() => removeCategory(index)}>
                      <TrashIcon className='w-4 h-4 text-white' strokeWidth={2.5} />
                    </button>
                  </div>
                ))}
              </div>

              <NewCategoryForm append={appendCategory} />
            </div>

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

          <div className="max-w-sm w-full flex flex-col gap-6 mx-auto">

            <QRGenerator
              eventId={event?._id || ''}
              eventName={watch('name') as string}
              maxParticipants={parseInt(watch('maxParticipants') as unknown as string) || 0}
              stayAfterCreation={stayAfterCreation}
              setStayAfterCreation={setStayAfterCreation}
            />

          </div>

          <div className="lg:flex items-center justify-end hidden">
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

        <div className="flex flex-col gap-3 sticky top-0 max-w-2xl w-full h-max pb-6">
          <div className="flex flex-col gap-6 px-6 max-w-max m-auto lg:pt-16">

            <div className="flex items-center gap-2 w-full justify-center">
              <EyeIcon className="w-4 h-4 text-gray-400 dark:text-gray-700" />
              <p className="text-base font-medium tracking-tight text-gray-400 dark:text-gray-700">
                Vista previa
              </p>
            </div>



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
                image: currentImageUrl,
                createdBy: session?.user?.email || '',
                createdAt: event?.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                type: watch('type') as string,
                categories: watch('categories') || [],
                modalities: watch('modalities') || [],
                racecheck: watch('racecheck') || null
              }}
              previewMode={true}
            />

          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="lg:hidden block rounded-btn !bg-gray-950 dark:!bg-white max-w-max mx-auto my-6"
          >
            <div className="flex items-center gap-2">
              <p className='text-sm font-medium tracking-tight text-white dark:text-gray-950'>
                {isSubmitting ? 'Procesando...' : (event ? 'Guardar cambios' : 'Crear evento')}
              </p>
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin w-4 h-4 text-white dark:text-gray-950" />
              ) : (
                <CheckIcon className="w-4 h-4 text-white dark:text-gray-950" />
              )}
            </div>
          </button>


        </div>

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
