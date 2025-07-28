'use client'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { eventCreateSchema, EventFormData, EventResponse } from '@/lib/schemas/event.schema'
import { File, Loader2, CheckIcon, ListIcon, ListOrderedIcon, UnderlineIcon, BoldIcon, ItalicIcon, TrashIcon, ArrowLeftIcon, MapPinIcon, PlusIcon, SettingsIcon, InfoIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

const MAX_IMAGE_SIZE = 15 * 1024 * 1024 // 15MB
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_FILE_EXTENSIONS = ['.racecheck']

import { adminEmails, Category, eventTypes, Gender, Modality, validateFile, parseRaceData } from '@/lib/utils'
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
import { createEvent, updateEvent, uploadImageToAzure } from '@/services/eventService'
import QRGenerator from './qr-generator'
import Toast from '../ui/toast'
import SafeImage from '../ui/safe-image'
import { EventDate } from './event-card'
import RaceCheckTable from './race-check-table'

interface EventFormProps {
  event?: EventResponse | null;
}

export default function EventForm({ event }: EventFormProps) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [stayAfterCreation, setStayAfterCreation] = useState(false)
  const [isUpdatingImage, setIsUpdatingImage] = useState(false)
  const [currentImageUrl, setCurrentImageUrl] = useState<string>(event?.image || '')
  const [newCategoryModality, setNewCategoryModality] = useState<Modality | null>(null)
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    show: boolean;
  }>({
    message: '',
    type: 'info',
    show: false
  });

  const isNewEvent = !event?._id

  const defaultGenders = [{ name: 'Masculino', matchsWith: 'M' }, { name: 'Femenino', matchsWith: 'F' }]

  const defaultValues = {
    _id: event?._id ?? "",
    name: event?.name ?? "",
    image: event?.image ?? "",
    date: event?.date ?? "",
    startTime: event?.startTime ?? "",
    endTime: event?.endTime ?? "",
    locationName: event?.locationName ?? "",
    location: event?.location ?? { lat: -34.397, lng: 150.644 },
    description: event?.description ?? "",
    maxParticipants: event?.maxParticipants ?? 100,
    modalities: event?.modalities ?? [],
    racecheck: event?.racecheck ?? null,
    type: event?.type ?? "",
    genders: event?.genders ?? defaultGenders
  }

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
  const racecheckName = watch('racecheck')?.split('\n')[0]
  const { append, remove, update } = useFieldArray({
    control: control,
    name: 'modalities'
  })
  const { append: appendGender, remove: removeGender } = useFieldArray({
    control: control,
    name: 'genders'
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
        class: 'w-full h-full p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 outline-none min-h-32 focus:border-gray-400 dark:focus:border-gray-700'
      }
    },
    content: defaultValues.description,
    onUpdate: ({ editor }: { editor: Editor }) => {
      setValue('description', editor.getHTML())
    },
    immediatelyRender: false
  })


  const handleRemoveCategory = (categoryIndex: number, modalityIndex: number) => {
    const currentModality = modalities?.[modalityIndex];
    if (currentModality && currentModality.categories) {
      const updatedCategories = currentModality.categories.filter((_, index) => index !== categoryIndex);
      update(modalityIndex, { ...currentModality, categories: updatedCategories });
    }
  }
  const handleRemoveModality = (index: number) => {
    remove(index)
  }
  const handleAddCategory = (category: Category, modality: Modality) => {
    const currentModality = modalities?.find((m) => m.name === modality.name);
    if (currentModality) {
      update(modalities?.indexOf(currentModality) ?? 0, {
        ...currentModality,
        categories: [...(currentModality.categories ?? []), category]
      });
    }
  }
  const handleAddGender = (gender: Gender) => {
    appendGender(gender)
  }
  const handleRemoveGender = (index: number) => {
    removeGender(index)
  }

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

  // Actualizar el editor cuando cambien los valores por defecto
  useEffect(() => {
    if (editor && defaultValues.description !== editor.getHTML()) {
      editor.commands.setContent(defaultValues.description)
    }
  }, [editor, defaultValues.description])


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

  const racecheckData = parseRaceData(watch('racecheck') ?? '')

  const modalities = watch('modalities')
  return (
    <div className='h-screen w-screen flex flex-col overflow-auto'>
      <div className=" w-full flex justify-between items-center max-w-7xl mx-auto px-6">
        <AnimatedLogo />

        <div className="flex items-center gap-2">
          <ModeToggle />
          <SignInButton />
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full flex flex-col min-h-max mt-12"
      >
        <div className="flex flex-col lg:flex-row gap-6 h-full w-full items-center lg:items-start max-w-6xl mx-auto px-3 lg:px-0">
          <div className="flex flex-col w-full gap-8 max-w-sm h-max lg:pb-12 px-3 md:px-6">
            <div className="flex items-center gap-2">
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
              <label className="text-2xl font-medium text-gray-950 dark:text-gray-100 font-mono tracking-tight">
                {event ? "Editar evento" : "Nuevo evento"}
              </label>
            </div>

            <div className="flex items-center gap-2 px-3 lg:px-6 pb-3">
              <InfoIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <label className="text-sm font-light opacity-50 font-mono tracking-tight">
                Información
              </label>
            </div>

            <div className="flex h-max gap-2 w-full">

              <div className="flex flex-col items-start gap-1 w-full">
                <label className="label-input">Título *</label>
                <input
                  {...register("name")}
                  className="input !text-sm "
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

            <div className="flex flex-col gap-2">
              <label className="label-input">Fecha y hora *</label>

              <div className="flex items-center w-full gap-6">
                <div className="w-full flex flex-col gap-2">
                  <div className="w-full max-w-md flex flex-col">
                    <input
                      type="date"
                      {...register("date")}
                      className="input w-full"
                    />
                    {errors.date && (
                      <p className="error-input">{errors.date.message}</p>
                    )}
                  </div>

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

                <EventDate eventDate={event?.date || ''} />

              </div>
            </div>

            <div className='w-full flex flex-col gap-1'>
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

            <div className='w-full flex flex-col gap-1 relative'>
              <label className="label-input">Ubicación *</label>
              {(watch('locationName') || event?.locationName) && (
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-mono tracking-tight">{watch('locationName') ?? event?.locationName}</p>
                </div>
              )}
              <Map
                onLocationSelect={handleLocationSelect}
                value={watch('location')}
              />

              {(errors?.location || errors?.locationName) && (
                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors?.location?.message} <br />
                    {errors?.locationName?.message}
                  </p>
                </div>
              )}
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
                        <div className="rounded-xl p-1 h-5 w-5 flex items-center justify-center transition-all duration-75">
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

            <div className="max-w-sm w-full flex flex-col gap-6 mx-auto">

              <QRGenerator
                eventId={event?._id ?? ''}
                eventName={watch('name') ?? ''}
                maxParticipants={parseInt(watch('maxParticipants') as unknown as string) || 0}
                stayAfterCreation={stayAfterCreation}
                setStayAfterCreation={setStayAfterCreation}
              />

            </div>
          </div>

          <div className="flex flex-col gap-8 w-full mt-[60px] lg:px-6 overflow-y-auto">
            <div className="flex items-center gap-2 px-3 lg:px-6 pb-3">
              <SettingsIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <label className="text-sm font-light opacity-50 font-mono tracking-tight">
                Configuración
              </label>
            </div>

            <div className="flex flex-col gap-6">
              <div className={`modern-table w-full ${watch('genders')?.length === 0 ? "hidden" : ""}`}>
                <div className="p-3 lg:p-6 border-b border-gray-200 dark:border-gray-900">
                  <p className='text-sm font-medium font-mono tracking-tight text-gray-700 dark:text-gray-200'>
                    Géneros
                  </p>
                </div>
                <div className="flex flex-col gap-2 w-full max-h-[400px] overflow-y-auto">
                  <table>
                    <thead className="modern-table-header !border-b border-gray-200 dark:border-gray-900">
                      <tr>
                        <th className="w-max max-w-max px-3 lg:!px-6">Nombre</th>
                        <th className="w-full">Valor en racecheck</th>
                        <th className="w-max !text-center"></th>
                      </tr>
                    </thead>

                    <tbody className="modern-table-body">
                      {watch('genders')?.map((gender: Gender, index: number) => {
                        return (
                          <GenderRow
                            key={`${gender.name}-${index}`}
                            gender={gender}
                            index={index}
                            handleRemoveGender={handleRemoveGender}
                          />
                        )
                      }
                      )}
                    </tbody>
                  </table>
                </div>

                <div className='p-6 border-t border-gray-200 dark:border-gray-900 flex flex-col gap-2'>
                  <div className="flex flex-col gap-1">
                    <p className="label-input">Crear género</p>
                    <GendersForm handleAddGender={handleAddGender} />
                  </div>
                </div>
              </div>

              <div className={`modern-table w-full ${modalities?.length === 0 ? "hidden" : ""}`}>
                <div className="p-3 lg:p-6 border-b border-gray-200 dark:border-gray-900">
                  <p className='text-sm font-medium font-mono tracking-tight text-gray-700 dark:text-gray-200'>
                    Modalidades y categorías
                  </p>
                </div>

                <div className="flex flex-col gap-2 w-full max-h-[400px] overflow-y-auto">
                  <table>
                    <thead className="modern-table-header">
                      <tr>
                        <th className="w-max max-w-max px-3 lg:!px-6">Nombre</th>
                        <th className="w-full !border-x border-gray-200 dark:border-gray-900">Categorías</th>
                        <th className="w-max !text-center"></th>
                      </tr>
                    </thead>

                    <tbody className="modern-table-body">
                      {modalities?.map((modality: Modality, index: number) => {
                        return (
                          <ModalityRow
                            key={`${modality.name}-${index}`}
                            modality={modality}
                            index={index}
                            handleRemoveCategory={handleRemoveCategory}
                            handleRemoveModality={handleRemoveModality}
                          />
                        )
                      }
                      )}
                    </tbody>
                  </table>
                </div>
                <div className='p-6 border-t border-gray-200 dark:border-gray-900 flex flex-col gap-3'>
                  <div className="flex flex-col gap-1">
                    <p className="label-input">Crear modalidad</p>
                    <ModalityForm append={append} />
                  </div>

                  <div className="flex flex-col gap-1">
                    <p className="label-input">Crear categoría</p>
                    {modalities && modalities.length > 0 && (
                      <CategoryForm
                        handleAddCategory={handleAddCategory}
                        modalities={modalities}
                        selectedModality={newCategoryModality}
                        setSelectedModality={setNewCategoryModality}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>



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
              ) :
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
              }
            </div>
          </div>
        </div>

        <div className="flex items-center md:justify-end justify-center px-3 pt-6 pb-12 lg:p-6 w-full max-w-5xl mx-auto">
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
      </form>

      {toast?.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          dismissible={true}
          onDismiss={() => setToast({ message: '', type: 'info', show: false })}
        />
      )}
    </div >
  )
}



const ModalityForm = ({ append }: { append: (modality: Modality) => void }) => {
  const [name, setName] = useState<string>('')


  const handleSubmit = () => {
    if (name.trim()) {
      append({ name: name.trim(), categories: [] })
      setName('') // Limpiar el input después de agregar
    }
  }

  return (
    <div className="flex flex-col justify-end gap-2 w-full max-w-sm">
      <div className="flex gap-2 w-full">
        <input
          type="text"
          className="input"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleSubmit()
            }
          }}
        />
        <div className="w-max mt-1">
          <button
            type="button"
            className="rounded-full bg-gray-800 dark:bg-gray-300 flex items-center justify-center p-2 transition-all duration-75"
            onClick={handleSubmit}
            disabled={!name.trim()}
          >
            <PlusIcon className="w-4 h-4 text-white dark:text-gray-950" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  )
}

const CategoryForm = ({ selectedModality, setSelectedModality, modalities, handleAddCategory }: { selectedModality: Modality | null, setSelectedModality: (modality: Modality | null) => void, modalities: Modality[], handleAddCategory: (category: Category, modality: Modality) => void }) => {
  const [newCategory, setNewCategory] = useState<Category>({ name: '', matchsWith: '' })

  const handleSubmit = () => {
    if (!selectedModality) return
    if (newCategory.name.trim()) {
      handleAddCategory(newCategory, selectedModality)
      setNewCategory({ name: '', matchsWith: '' })
    }
  }

  if (modalities.length === 0) return null

  return (

    <div className="flex flex-col md:flex-row gap-2 w-full">

      <select
        className="input !py-0"
        value={selectedModality?.name ?? ''}
        required
        disabled={modalities.length === 0}
        onChange={(e) => setSelectedModality(modalities.find((m) => m.name === e.target.value) ?? modalities[0])}
      >
        <option value="" disabled>Selecciona una modalidad</option>
        {modalities.map((modality) => (
          <option key={modality.name} value={modality.name}>
            {modality.name}
          </option>
        ))}
      </select>
      <input
        type="text"
        className="input"
        placeholder="Nombre"
        value={newCategory.name}
        onChange={(e) => setNewCategory({ name: e.target.value, matchsWith: newCategory.matchsWith })}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            handleSubmit()
          }
        }}
      />

      <input
        type="text"
        className="input"
        placeholder="Valor en racecheck"
        value={newCategory.matchsWith}
        onChange={(e) => setNewCategory({ name: newCategory.name, matchsWith: e.target.value })}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            handleSubmit()
          }
        }}
      />

      <div>
        <button
          type="button"
          className="rounded-full bg-gray-800 dark:bg-gray-300 flex items-center justify-center p-2 transition-all duration-75"
          onClick={handleSubmit}
          disabled={!newCategory.name.trim()}
        >
          <PlusIcon className="w-4 h-4 text-white dark:text-gray-950" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}

const GendersForm = ({ handleAddGender }: { handleAddGender: (gender: Gender) => void }) => {
  const [newGender, setNewGender] = useState<Gender>({ name: '', matchsWith: '' })


  return (
    <div key={`new-gender`} className='flex w-full items-start gap-2'>

      <div className='flex flex-col gap-1'>
        <input
          type="text"
          className="input"
          placeholder="Nombre"
          value={newGender.name}
          onChange={(e) => setNewGender({ name: e.target.value, matchsWith: newGender.matchsWith })}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAddGender(newGender)
              setNewGender({ name: '', matchsWith: '' })
            }
          }}
        />
      </div>

      <div className="flex flex-col gap-1">
        <input
          type="text"
          className="input"
          placeholder="Valor en racecheck"
          value={newGender.matchsWith}
          onChange={(e) => setNewGender({ name: newGender.name, matchsWith: e.target.value })}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAddGender(newGender)
              setNewGender({ name: '', matchsWith: '' })
            }
          }}
        />
      </div>

      <div className="flex flex-col gap-1 px-1 items-center mt-1">
        <button
          type="button"
          className="rounded-full bg-gray-800 dark:bg-gray-300 flex items-center justify-center p-2 transition-all duration-75"
          onClick={() => {
            handleAddGender(newGender)
            setNewGender({ name: '', matchsWith: '' })
          }}
          disabled={!newGender.name.trim()}
        >
          <PlusIcon className="w-4 h-4 text-white dark:text-gray-950" strokeWidth={2.5} />
        </button>
      </div >
    </div>
  )
}

const ModalityRow = ({ modality, handleRemoveModality, handleRemoveCategory, index }: { modality: Modality, handleRemoveModality: (index: number) => void, handleRemoveCategory: (categoryIndex: number, modalityIndex: number) => void, index: number }) => {

  return (

    <tr key={index}>
      <td className='!pl-4 lg:!pl-6 h-full flex flex-col items-start'>
        <div className="chip_filter max-w-max">
          <p className='text-sm text-gray-500 dark:text-gray-400 px-2'>
            {modality.name}
          </p>
        </div>
      </td>

      <td className='!px-4'>
        <div className="flex flex-col gap-2 ">
          {modality?.categories?.map((category: Category, categoryIndex: number) => {
            return (
              <div
                key={`${category.name}-${categoryIndex}`}
                className='grid grid-cols-3 w-full gap-2'
              >
                <div className='flex gap-1 items-center col-span-2'>
                  <div className='chip_filter w-max'>
                    <p className="text-sm text-gray-500 dark:text-gray-400 px-2">
                      {category?.name}
                    </p>
                  </div>

                  {category?.matchsWith && (
                    <p className='font-mono text-sm text-gray-500 dark:text-gray-400 px-2'>
                      {category?.matchsWith}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  className='w-6 h-6 flex items-center justify-center transition-all duration-100 gap-2 rounded-full bg-red-600 hover:bg-red-700'
                  onClick={() => handleRemoveCategory(categoryIndex, index)}
                >
                  <TrashIcon className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                </button>
              </div>
            )
          })}
        </div>
      </td>

      <td className='!px-4 flex items-center justify-end'>
        <button
          type="button"
          className="rounded-full bg-red-600 flex items-center justify-center p-2 hover:bg-red-700 transition-all duration-75 w-max"
          onClick={() => handleRemoveModality(index)}
        >
          <TrashIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
        </button>
      </td>
    </tr>
  )
}

const GenderRow = ({ gender, index, handleRemoveGender }: { gender: Gender, index: number, handleRemoveGender: (index: number) => void }) => {
  return (
    <tr key={index}>
      <td className='!px-4 lg:!px-6'>
        <div className="chip_filter max-w-max">
          <p className='text-sm text-gray-500 dark:text-gray-400 px-2'>
            {gender.name}
          </p>
        </div>
      </td>

      <td className="py-2 px-3 items-center justify-center w-max">
        <p className='font-mono text-sm text-gray-500 dark:text-gray-400 px-2'>
          {gender.matchsWith}
        </p>
      </td>

      <td className="!px-4">
        <button
          type="button"
          className="rounded-full bg-red-600 flex items-center justify-center p-2 hover:bg-red-700 transition-all duration-75 w-max"
          onClick={() => handleRemoveGender(index)}
        >
          <TrashIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
        </button>
      </td>
    </tr>
  )
}
