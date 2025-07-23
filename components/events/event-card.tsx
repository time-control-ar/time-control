import { ChartBarIcon, ClockIcon, InfoIcon, MapPinIcon, PencilIcon, TrashIcon } from 'lucide-react'
import { EventResponse } from '@/lib/server/eventService'
import { motion } from "framer-motion"
import SafeImage from '@/components/ui/safe-image'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { adminEmails } from '@/lib/utils'
import Modal from '../ui/modal'
import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import RaceCheckTable from './race-check-table'
import { deleteEvent } from '@/services/eventService'

const tabs = [
    {
        value: 'info',
        label: 'Información',
        icon: InfoIcon
    },
    {
        value: 'results',
        label: 'Resultados',
        icon: ChartBarIcon
    }
]

export const EventSpaceTime = ({ event }: { event: EventResponse }) => {
    const parsedStartTime = event?.startTime ? event.startTime.startsWith('0') ? event.startTime.slice(1) : event.startTime : '-:-'
    const parsedEndTime = event?.endTime ? event.endTime.startsWith('0') ? event.endTime.slice(1) : event.endTime : '-:-'


    return (
        <>
            <div className="flex gap-2 items-center w-full">
                <div>
                    <MapPinIcon className="w-4 h-4 text-red-500 dark:text-red-500" />
                </div>
                <p className="text-gray-800 dark:text-white text-sm tracking-tight">
                    {event?.locationName || 'Ubicación'}
                </p>
            </div>
            <div className="flex gap-2 items-center w-full">
                <div>
                    <ClockIcon className="w-4 h-4 text-gray-800 dark:text-white" />
                </div>
                <p className="text-gray-800 dark:text-white text-sm tracking-tight">
                    {parsedStartTime} a {parsedEndTime} hs
                </p>
            </div>
        </>
    )
}

export const EventDate = ({ event }: { event: EventResponse }) => {
    const eventMonth = event?.date
        ? new Date(event?.date).toLocaleString('es-ES', { month: 'long' })
        : 'Mes'

    const eventDay = event?.date
        ? event?.date.split('T')[0].split('-')[2]
        : 'Día'

    return (
        <div className="flex flex-col rounded-2xl bg-gradient-to-t w-[60px] dark:from-gray-800 dark:to-gray-700 from-gray-100 to-white backdrop-blur-sm px-3 py-2 items-center border border-gray-200 dark:border-gray-700">
            <p className="text-gray-950 dark:text-white text-3xl font-bold tracking-tight -mb-1">
                {eventDay}
            </p>
            <p className="text-gray-950 dark:text-white text-sm tracking-tight font-medium capitalize">
                {eventMonth}
            </p>
        </div>
    )
}

// Event card component
export const EventCard = ({ event, previewMode = false }: { event: EventResponse, previewMode?: boolean, selectedTab?: string }) => {
    const router = useRouter()
    const { data: session } = useSession()
    const isAdmin = session?.user?.email && adminEmails.includes(session.user.email)

    const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    const [selectedTab, setSelectedTab] = useState<string>('info')


    const handleTabChange = (tab: string) => {
        setSelectedTab(tab)
    }

    const handleDelete = () => {
        setIsOpenDeleteModal(true)
    }

    const handleClose = () => {
        setIsOpenDeleteModal(false)
    }

    const handleConfirm = async () => {
        try {
            await deleteEvent(event._id)
            router.refresh()
            setIsOpenDeleteModal(false)
        } catch (error) {
            console.error(error)
        }
    }


    return (
        <>
            <div className="mx-auto group relative w-[300px] h-max">
                <div
                    className={`w-full mx-auto border border-gray-200 dark:border-gray-800 rounded-3xl select-none overflow-hidden shadow-lg dark:shadow-gray-950/50 cursor-pointer relative`}
                    onClick={() => setIsOpen(true)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-2 right-2 z-20 md:opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                        {isAdmin && !previewMode && (
                            <div
                                className="flex items-center gap-2 relative -inset-0"
                            >
                                <button
                                    type="button"
                                    className="rounded-full bg-red-600 flex items-center justify-center p-2 hover:bg-red-700 transition-all duration-75"
                                    onClick={handleDelete}
                                >
                                    <TrashIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
                                </button>
                                <button
                                    type="button"
                                    className="rounded-full bg-gray-100 flex items-center justify-center p-2 hover:bg-gray-200 transition-all duration-75"
                                    onClick={() => router.push(`/eventos/editar/${event._id}`)}
                                >
                                    <PencilIcon className="w-4 h-4 text-gray-500" strokeWidth={2.5} />
                                </button>
                                <div className="absolute -top-2 -right-2 w-[50px] h-[40px] blur-lg bg-gray-950/80 -z-10" />
                            </div>
                        )}

                    </div>

                    <motion.div
                        className={`w-full  overflow-hidden flex flex-col h-max mx-auto bg-white dark:bg-gray-800 relative`}
                    >
                        <div className="z-20 absolute bottom-0 left-0 p-2 flex flex-col gap-1 scale-90 md:scale-100">
                            <EventDate event={event} />
                        </div>

                        <SafeImage
                            src={event?.image || ''}
                            alt={event?.name || ''}
                            className="z-10 object-cover rounded-bl-3xl "
                            fill
                            priority
                            fallbackText="Imagen"
                        />
                    </motion.div>

                    <div className="flex flex-col w-full px-4 py-6 mx-auto bg-gradient-to-t from-white to-white dark:from-gray-900 dark:to-gray-800 h-[200px]">
                        <div className="flex flex-col gap-1 items-start justify-between w-full">
                            <h2 className="text-gray-950 dark:text-gray-50 text-xl font-semibold tracking-tight line-clamp-1">
                                {event?.name || 'Nombre'}
                            </h2>
                            <div className="flex flex-col gap-2 mb-6">
                                <EventSpaceTime event={event} />
                            </div>

                            <div
                                className="whitespace-pre-wrap break-words text-base text-gray-700 dark:text-gray-300 line-clamp-2" dangerouslySetInnerHTML={{ __html: event?.description }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title={event?.name}
                showCloseButton={true}
            >
                <div className={`flex flex-col h-full w-full ${selectedTab === 'results' ? 'overflow-y-hidden' : 'overflow-y-auto'}`}>

                    <div className="flex w-full items-center justify-start px-4 md:px-6 gap-2 sticky top-0 z-20 pt-3 pb-2
                    bg-gradient-to-b from-white via-white to-white/90
                    dark:from-gray-950 dark:via-gray-950 dark:to-gray-950/40 backdrop-blur-sm">
                        {tabs.map((tab) => (
                            <button
                                key={tab.value}
                                type="button"
                                onClick={() => handleTabChange(tab.value)}
                                className={` transition-colors rounded-full px-4 py-2
                          ${selectedTab === tab.value ? 'bg-gray-950 dark:bg-white text-white dark:text-gray-950' : 'bg-gray-100 dark:bg-gray-950 text-gray-800 dark:text-white'}`}
                            >
                                <div className={`${selectedTab === tab.value ? 'opacity-100' : 'opacity-60'} flex items-center justify-center gap-2`}>
                                    <tab.icon className={`w-4 h-4`} />
                                    <p className={`text-xs font-semibold tracking-tight `}>
                                        {tab.label}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {selectedTab === 'info' ? (
                            <motion.div
                                key="info"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col gap-3 px-4 md:px-6 h-max pb-4"
                            >

                                <div className="flex flex-col gap-3 pb-6">
                                    <div className="rounded-xl overflow-hidden relative border-[0.4px] border-gray-200 dark:border-gray-800">
                                        <SafeImage
                                            src={event?.image || ''}
                                            alt={event?.name || ''}
                                            className="z-10 object-cover md:!min-h-[300px]"
                                            fill
                                            priority
                                            fallbackText="Imagen"
                                        />
                                    </div>

                                    <div className="flex items-end justify-start max-w-max gap-3">


                                        <div className="flex flex-col gap-1 py-1">
                                            <div className="flex gap-2 items-center w-full">
                                                <ClockIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                                <p className="text-black dark:text-white text-sm tracking-tight">
                                                    {event?.startTime} a {event?.endTime} hs
                                                </p>
                                            </div>

                                            <div className="flex gap-2 items-center w-full">
                                                <MapPinIcon className="w-5 h-5 text-red-500 dark:text-red-500" />
                                                <p className="text-black dark:text-white text-sm tracking-tight">
                                                    {event?.locationName || 'Ubicación'}
                                                </p>
                                            </div>

                                        </div>
                                    </div>
                                    <div className="px-3 pt-4">
                                        <div
                                            className="whitespace-pre-wrap break-words text-base text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: event?.description || '' }}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.2 }}
                                className="h-max flex flex-col relative overflow-y-auto"
                            >
                                <RaceCheckTable results={event?.results} eventId={event._id} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </Modal>

            {/* Delete modal */}

            <Modal
                isOpen={isOpenDeleteModal}
                onClose={handleClose}
                title="Eliminar evento"
                className="!max-w-[440px]"
            >
                <div className="flex flex-col h-min gap-6 p-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        ¿Estás seguro de querer eliminar <span className="font-medium">{event?.name}</span>?
                        <br />Esta acción no se puede deshacer.
                    </p>

                    <div className="flex justify-end gap-2 mt-auto">
                        <button className="rounded-full bg-red-500 dark:bg-red-800 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 dark:hover:bg-red-700 transition-all duration-75" onClick={handleConfirm}>
                            Si, eliminar
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    )
}
