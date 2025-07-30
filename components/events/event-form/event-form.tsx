'use client'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { eventCreateSchema, EventFormData, EventResponse } from '@/lib/schemas/event.schema'
import { Loader2, CheckIcon, ArrowLeftIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useEditor } from '@tiptap/react'
import Document from "@tiptap/extension-document"
import Paragraph from "@tiptap/extension-paragraph"
import Text from "@tiptap/extension-text"
import Bold from "@tiptap/extension-bold"
import Italic from "@tiptap/extension-italic"
import History from "@tiptap/extension-history"
import Underline from "@tiptap/extension-underline"
import BulletList from "@tiptap/extension-bullet-list"
import ListItem from "@tiptap/extension-list-item"
import OrderedList from "@tiptap/extension-ordered-list"

import { adminEmails, Category, Gender, Modality, parseRaceData } from '@/lib/utils'
import { SignInButton } from '../../ui/sign-in-button'
import AnimatedLogo from '../../ui/animated-logo'
import { ModeToggle } from '../../mode-toggle'
import { createEvent, updateEvent } from '@/services/eventService'
import QRGenerator from '../qr-generator'
import Toast from '../../ui/toast'

import { EventFormHeader } from './event-form-header'
import { EventFormInfo } from './event-form-info'
import { EventFormImage } from './event-form-image'
import { EventFormDateTime } from './event-form-datetime'
import { EventFormDescription } from './event-form-description'
import { EventFormLocation } from './event-form-location'
import { EventFormType } from './event-form-type'
import { EventFormConfig } from './event-form-config'
import { EventFormResults } from './event-form-results'

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
    const [editingCategory, setEditingCategory] = useState<{
        category: Category;
        categoryIndex: number;
        modalityIndex: number;
    } | null>(null)
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
                class: 'w-full h-full p-3.5 rounded-2xl custom_border input outline-none !h-max'
            }
        },
        content: defaultValues.description,
        onUpdate: ({ editor }) => {
            setValue('description', editor.getHTML())
        },
        immediatelyRender: false
    })

    const handleRemoveCategory = (categoryIndex: number, modalityIndex: number) => {
        const currentModalities = watch('modalities') || [];
        const currentModality = currentModalities[modalityIndex];
        if (currentModality && currentModality.categories) {
            const updatedCategories = currentModality.categories.filter((_, index) => index !== categoryIndex);
            update(modalityIndex, { ...currentModality, categories: updatedCategories });
        }
    }

    const handleRemoveModality = (index: number) => {
        remove(index)
    }

    const handleAddCategory = (category: Category, modality: Modality) => {
        const currentModalities = watch('modalities') || [];
        const currentModality = currentModalities.find((m) => m.name === modality.name);
        if (currentModality) {
            const modalityIndex = currentModalities.indexOf(currentModality);

            if (editingCategory) {
                // Modo edición: actualizar la categoría existente
                const updatedCategories = [...(currentModality.categories ?? [])];
                updatedCategories[editingCategory.categoryIndex] = category;
                update(modalityIndex, {
                    ...currentModality,
                    categories: updatedCategories
                });
                setEditingCategory(null);
            } else {
                // Modo adición: agregar nueva categoría
                update(modalityIndex, {
                    ...currentModality,
                    categories: [...(currentModality.categories ?? []), category]
                });
            }
        }
    }

    const handleAddGender = (gender: Gender) => {
        appendGender(gender)
    }

    const handleRemoveGender = (index: number) => {
        removeGender(index)
    }

    const handleCancelEdit = () => {
        setEditingCategory(null);
        setNewCategoryModality(null);
    }

    const handleEditCategory = (categoryIndex: number, modalityIndex: number) => {
        const currentModalities = watch('modalities') || [];
        const currentModality = currentModalities[modalityIndex];
        if (currentModality && currentModality.categories) {
            const categoryToEdit = currentModality.categories[categoryIndex];
            if (categoryToEdit) {
                // Configurar la categoría para editar en el formulario
                setEditingCategory({
                    category: categoryToEdit,
                    categoryIndex,
                    modalityIndex
                });
                // Seleccionar la modalidad correspondiente
                setNewCategoryModality(currentModality);
            }
        }
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

    const racecheckData = {
        eventId: event?._id ?? '',
        eventName: watch('name') ?? '',
        categories: watch('racecheck') ? parseRaceData(watch('racecheck') ?? '').categories : [],
        modalities: watch('racecheck') ? parseRaceData(watch('racecheck') ?? '').modalities : [],
        racecheck: watch('racecheck') ?? null
    }

    return (
        <div className='h-full w-full flex flex-col overflow-auto'>
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
                    <div className="flex flex-col w-full gap-8 max-w-sm h-max lg:pb-12 px-3">
                        <EventFormHeader event={event} router={router} />

                        {/* <div className="flex items-center gap-2 px-3 lg:px-6 pb-3">
                            <InfoIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <label className="text-sm font-light opacity-50 font-mono tracking-tight">
                                Información
                            </label>
                        </div> */}

                        <EventFormInfo
                            register={register}
                            errors={errors}
                            watch={watch}
                        />

                        <EventFormImage
                            currentImageUrl={currentImageUrl}
                            setCurrentImageUrl={setCurrentImageUrl}
                            setValue={setValue}
                            isUpdatingImage={isUpdatingImage}
                            setIsUpdatingImage={setIsUpdatingImage}
                            setToast={setToast}
                            event={event}
                        />

                        <EventFormDateTime
                            register={register}
                            errors={errors}
                            event={event}
                        />

                        <EventFormDescription
                            editor={editor}
                        />

                        <EventFormLocation
                            watch={watch}
                            handleLocationSelect={handleLocationSelect}
                            errors={errors}
                            event={event}
                        />

                        <EventFormType
                            watch={watch}
                            setValue={setValue}
                            errors={errors}
                        />

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
                        {/* <div className="flex items-center gap-2 px-3 lg:px-6 pb-3">
                            <SettingsIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <label className="text-sm font-light opacity-50 font-mono tracking-tight">
                                Configuración
                            </label>
                        </div> */}


                        <EventFormConfig
                            watch={watch}
                            handleRemoveCategory={handleRemoveCategory}
                            handleRemoveModality={handleRemoveModality}
                            handleEditCategory={handleEditCategory}
                            handleAddCategory={handleAddCategory}
                            handleAddGender={handleAddGender}
                            handleRemoveGender={handleRemoveGender}
                            append={append}
                            newCategoryModality={newCategoryModality}
                            setNewCategoryModality={setNewCategoryModality}
                            editingCategory={editingCategory}
                            handleCancelEdit={handleCancelEdit}
                        />
                        <EventFormResults
                            racecheckData={racecheckData}
                            watch={watch}
                            setValue={setValue}
                            isSubmitting={isSubmitting}
                            setToast={setToast}
                            event={event}
                        />
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