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

import { adminEmails, buildResults, getRacecheckRunners } from '@/lib/utils'
import { Category, Gender, Modality } from '@/lib/schemas/event.schema'
import { SignInButton } from '../../ui/sign-in-button'
import AnimatedLogo from '../../ui/animated-logo'
import { ModeToggle } from '../../mode-toggle'
import { createEvent, updateEvent } from '@/services/event'
import QRGenerator from '../qr-generator'
import Toast from '../../ui/toast'

import { EventFormHeader } from './event-form-header'
import { EventFormInfo } from './event-form-info'
import { EventFormImage } from './event-form-image'
import { EventFormDateTime } from './event-form-datetime'
import { EventFormLocation } from './event-form-location'
import { EventFormResults } from './event-form-results'
import { EventFormConfig } from './event-form-config'
import { EventFormType } from './event-form-type'


interface EventFormProps {
    event?: EventResponse | null;
}

export default function EventForm({ event }: EventFormProps) {
    const router = useRouter()
    const { data: session, status } = useSession()
    const [activeTab, setActiveTab] = useState(0)
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
        location: event?.location ?? { lat: -34.397, lng: 150.644, name: '', direction: '' },
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

    const { append, remove } = useFieldArray({
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

    const handleChangeLocation = (location: { lat: number; lng: number }, name: string, direction: string) => {
        setValue('location', { lat: location.lat, lng: location.lng, name, direction });
    }

    const handleRemoveCategory = (categoryIndex: number, modalityIndex: number) => {
        const currentModalities = watch('modalities') || [];
        const currentModality = currentModalities[modalityIndex];
        if (currentModality && currentModality.categories) {
            const updatedCategories = currentModality.categories.filter((_, index) => index !== categoryIndex);
            const updatedModalities = [...currentModalities];
            updatedModalities[modalityIndex] = { ...currentModality, categories: updatedCategories };
            setValue('modalities', updatedModalities);
        }
    }

    const handleRemoveModality = (index: number) => {
        remove(index)
    }

    const handleAddCategory = (category: Category, modality: Modality) => {
        const currentModalities = watch('modalities') || [];

        if (editingCategory) {
            // Modo edición: usar la modalidad original de la categoría que se está editando
            const currentModality = currentModalities[editingCategory.modalityIndex];
            if (currentModality) {
                const updatedCategories = [...(currentModality.categories ?? [])];
                updatedCategories[editingCategory.categoryIndex] = category;
                const updatedModalities = [...currentModalities];
                updatedModalities[editingCategory.modalityIndex] = {
                    ...currentModality,
                    categories: updatedCategories
                };
                setValue('modalities', updatedModalities);
                setEditingCategory(null);
            }
        } else {
            // Modo adición: agregar nueva categoría
            const currentModality = currentModalities.find((m) => m.name === modality.name);
            if (currentModality) {
                const modalityIndex = currentModalities.indexOf(currentModality);
                const updatedModalities = [...currentModalities];
                updatedModalities[modalityIndex] = {
                    ...currentModality,
                    categories: [...(currentModality.categories ?? []), category]
                };
                setValue('modalities', updatedModalities);
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

    const handleReplaceImage = async (url: string) => {
        setValue('image', url)
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
                const { success, data } = await createEvent(safeParsedData.data);
                if (success) {
                    setToast({
                        message: 'Evento creado exitosamente',
                        type: 'success',
                        show: true
                    })
                    router.push(`/eventos/editar/${data._id}`)
                } else {
                    setToast({
                        message: 'Error al crear el evento',
                        type: 'error',
                        show: true
                    })
                }
            } else {
                await updateEvent(event._id, safeParsedData.data);
                setToast({
                    message: 'Evento actualizado exitosamente',
                    type: 'success',
                    show: true
                })
            }

            if (!event?._id) {
                reset()
            }

        } catch (e) {
            console.log("error", e)
            setToast({
                message: 'Error al procesar el evento',
                type: 'error',
                show: true
            })
        }
    }

    const { invalidLines, validLines } = getRacecheckRunners(watch('racecheck') ?? '', watch('modalities') ?? [], watch('genders') ?? [])
    const { runners: results } = buildResults(validLines, watch('modalities') ?? [], watch('genders') ?? [])
    const racecheckUnassignedCategories = invalidLines.map(line => line.categoria).filter((category, index, self) => self.indexOf(category) === index)

    // Actualizar el editor cuando cambien los valores por defecto
    useEffect(() => {
        if (editor && defaultValues.description !== editor.getHTML()) {
            editor.commands.setContent(defaultValues.description)
        }
    }, [editor, defaultValues.description])

    const eventLocation = watch('location')


    if (!session?.user?.email && status === 'unauthenticated') return (
        <div className="h-screen w-full flex items-center justify-center">
            <div className="flex flex-col gap-4 max-w-md mx-auto w-full h-full px-3 md:px-6 py-10">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Debes iniciar sesión para gestionar eventos
                </p>

                <div className="flex items-center justify-between gap-4 w-full">
                    <button type="button" className="rounded-btn !min-w-max !bg-gray-100 dark:!bg-gray-800 !border-gray-300 flex items-center gap-2"
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
        <div className='w-full flex flex-col overflow-auto relative h-screen'>
            <div className=" w-full flex justify-between items-center max-w-7xl mx-auto px-6">
                <AnimatedLogo />

                <div className="flex items-center gap-2">
                    <ModeToggle />
                    <SignInButton />
                </div>
            </div>

            <EventFormHeader
                event={event}
                router={router}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isSubmitting={isSubmitting}
            />

            <form
                onSubmit={handleSubmit(onSubmit)}
                className='flex flex-col h-full'
            >
                {activeTab === 0 && (
                    <div className="px-6 gap-8 flex flex-col xl:flex-row max-w-7xl w-full mx-auto items-center xl:items-start">

                        <div className="flex flex-col gap-6 w-full max-w-md">

                            <EventFormInfo
                                register={register}
                                errors={errors}
                                editor={editor}
                            />
                            <EventFormDateTime
                                register={register}
                                errors={errors}
                                event={event}
                            />


                        </div>

                        <div className="flex flex-col gap-6 w-full max-w-md">
                            <EventFormLocation
                                eventLocation={eventLocation ?? { lat: -34.397, lng: 150.644, name: '', direction: '' }}
                                handleChangeLocation={handleChangeLocation}
                                errors={errors}
                            />
                            <EventFormType
                                watch={watch}
                                setValue={setValue}
                                errors={errors}
                            />


                        </div>

                        <div className="flex flex-col gap-6 w-full max-w-[320px]">
                            <EventFormImage
                                eventId={event?._id}
                                eventImage={watch('image')}
                                replaceUrl={handleReplaceImage}
                                setToast={setToast}
                            />
                            <QRGenerator
                                eventId={event?._id ?? ''}
                                eventName={watch('name') ?? ''}
                                maxParticipants={parseInt(watch('maxParticipants') as unknown as string) || 0}
                            />
                        </div>

                    </div>
                )}
                {activeTab === 1 && (
                    <div className="flex flex-col xl:flex-row gap-12 w-full max-w-7xl mx-auto px-6">
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
                            racecheckUnassignedCategories={racecheckUnassignedCategories}
                        />

                        <div className="flex flex-col gap-6 xl:sticky top-14 inset-1 h-max w-full max-w-[60vw]">
                            <EventFormResults
                                runners={results}
                                racecheckErrors={invalidLines}
                                modalities={watch('modalities') ?? []}
                                genders={watch('genders') ?? []}
                                fileName={watch('racecheck')?.split('\n')[0] ?? ''}
                                setValue={setValue}
                                isSubmitting={isSubmitting}
                                setToast={setToast}
                                event={event}
                            />

                        </div>
                    </div>
                )}


                <div className="max-w-7xl mx-auto px-6 mt-12 pb-12 flex items-end justify-end gap-6 w-full">
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


            <Toast
                isVisible={toast.show}
                message={toast.message}
                type={toast.type}
                dismissible={true}
                onDismiss={() => setToast((prev) => ({ ...prev, show: false }))}
            />
        </div >
    )
}