import { ClockIcon, InfoIcon, MapPinIcon, PencilIcon, TrashIcon, TrophyIcon } from 'lucide-react'
import { EventResponse } from '@/lib/schemas/event.schema'
import { motion } from "framer-motion"
import SafeImage from '@/components/ui/safe-image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { adminEmails, buildResults, getRacecheckRunners } from '@/lib/utils'
import Modal from '../ui/modal'
import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { deleteEvent } from '@/services/event'
import { GoogleMap, Marker } from '@react-google-maps/api'
import { useGoogleMaps } from '@/hooks/use-google-maps'
import Image from 'next/image'
import ResultsTable from './results-table'

const tabs = [
    {
        value: 'info',
        label: 'Información',
        icon: InfoIcon
    },
    {
        value: 'results',
        label: 'Resultados',
        icon: TrophyIcon
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
                    {event?.location?.name || event?.location?.direction || 'Ubicación'}
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

export const EventDate = ({ eventDate, previewMode }: { eventDate: string, previewMode?: boolean }) => {
    const eventMonth = eventDate
        ? (() => {
            const month = new Date(eventDate).toLocaleString('es-ES', { month: 'long' });
            return month.length > 6
                ? new Date(eventDate).toLocaleString('es-ES', { month: 'short' })
                : month;
        })()
        : 'Mes'

    const eventDay = eventDate
        ? eventDate.split('T')[0].split('-')[2]
        : 'Día'

    return (
        <div className="flex flex-col items-center justify-center rounded-[14px] w-[50px] h-[60px] backdrop-blur-sm max-w-[50px] overflow-hidden z-20">
            <p className={`${previewMode ? 'text-3xl text-cdark dark:text-white' : 'text-white text-2xl'} tracking-tighter font-bold -mb-1`}>
                {eventDay}
            </p>
            <p className={`${previewMode ? 'text-[11px] text-cdark dark:text-white' : 'text-white text-xs'} tracking-tight font-medium capitalize truncate w-full text-center px-1`}>
                {eventMonth}
            </p>
        </div>
    )
}

export const EventDescription = ({ description }: { description: string }) => {
    return (
        <div className="p-4">

            <div className="whitespace-pre-wrap break-words text-base text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: description || '' }} />
        </div>
    )
}

export const EventCard = ({ event, previewMode = false }: { event: EventResponse, previewMode?: boolean }) => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { data: session } = useSession()
    const isAdmin = session?.user?.email && adminEmails.includes(session.user.email)

    const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    const [selectedTab, setSelectedTab] = useState<string>(event.racecheck ? 'results' : 'info')


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

        await deleteEvent(event._id).then((res) => {
            if (res.success) {
                setIsOpenDeleteModal(false)
                router.refresh()
            }
        }).catch((error) => {
            console.error(error)
            setIsOpenDeleteModal(false)
        })

    }


    const { validLines } = getRacecheckRunners(event?.racecheck || '', event?.modalities || [], event?.genders || [])
    const { runners: racecheckData } = buildResults(validLines, event?.modalities || [], event?.genders || [])

    useEffect(() => {
        console.log(searchParams)
        if (searchParams.get('eventId') === event._id) {
            setIsOpen(true)
        }
    }, [event._id, searchParams])

    return (
        <>
            <div className="mx-auto group relative !w-[350px] h-max">
                <div
                    className={`w-full mx-auto rounded-xl select-none cursor-pointer relative overflow-hidden`}
                    onClick={() => setIsOpen(true)}
                >
                    {isAdmin && !previewMode && (
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute top-2 right-2 z-20 md:opacity-0 group-hover:opacity-100 transition-all duration-300"
                        >
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
                                <div className="absolute -top-2 -right-2 w-[80px] h-[40px] blur-xl bg-gray-950/50 dark:bg-gray-950 -z-10" />
                            </div>
                        </div>
                    )}


                    <div className="relative w-full h-[200px] rounded-xl rounded-bl-3xl overflow-hidden">
                        <div className="z-20 absolute bottom-0 left-0 p-2 ">
                            <EventDate eventDate={event?.date || ''} />
                        </div>

                        <SafeImage
                            src={event?.image || ''}
                            alt={event?.name || ''}
                            fill
                            priority
                            fallbackText="Imagen"
                        />
                    </div>

                    <div className="flex flex-col w-full px-5 pt-4 pb-6 mx-auto md:h-max">
                        <div className="flex flex-col gap-1 items-start justify-between w-full">
                            <h2 className="text-cdark dark:text-gray-50 text-xl font-semibold tracking-tight">
                                {event?.name || 'Nombre'}
                            </h2>

                            <div className="flex flex-col gap-2 mb-6">
                                <EventSpaceTime event={event} />
                            </div>

                            {/* <div
                                className="whitespace-pre-wrap break-words text-sm text-gray-700 dark:text-gray-300 line-clamp-2" dangerouslySetInnerHTML={{ __html: event?.description }}
                            /> */}
                        </div>
                    </div>
                </div>
            </div>

            {!previewMode && (
                <>
                    <Modal
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                        showCloseButton={true}
                    >
                        <div className="flex w-full items-end pt-4 justify-start px-2 border-b border-gray-100 dark:border-cgray">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.value}
                                    type="button"
                                    onClick={() => handleTabChange(tab.value)}
                                    className={`py-3 flex items-center justify-center gap-2 px-4 border-b-2 
                                        ${selectedTab === tab.value ? 'border-cyan-300' : 'opacity-60 border-transparent'}`}
                                >
                                    <tab.icon className={`w-4 h-4 ${selectedTab === tab.value ? 'text-cyan-500' : 'text-gray-800 dark:text-white'}`} />
                                    <p className={`text-sm font-mono font-semibold tracking-tight text-gray-800 dark:text-white`}>
                                        {tab.label}
                                    </p>
                                </button>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            {selectedTab === 'info' ? (
                                <motion.div
                                    key="info"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex flex-col gap-3 p-2 h-max overflow-y-auto pb-12"
                                >
                                    <div className="flex flex-col gap-3 pb-6">
                                        <h1 className="text-2xl font-semibold tracking-tight text-gray-800 dark:text-white mb-2 px-3 pt-4">
                                            {event?.name}
                                        </h1>
                                        <div className="flex flex-col md:flex-row gap-2 w-full h-full">

                                            <div className="relative w-full h-[200px] md:h-[250px]">
                                                <div className="absolute bottom-3 left-3 z-20">
                                                    <EventDate eventDate={event?.date || ''} />
                                                </div>
                                                <SafeImage
                                                    src={event?.image || ''}
                                                    alt={event?.name || ''}
                                                    className="z-10 object-cover object-left-top rounded-bl-3xl rounded-xl h-[200px] md:h-[250px]"
                                                    fill
                                                    priority
                                                    fallbackText="Imagen"
                                                />
                                            </div>

                                            <div className="pb-6 pt-2 md:hidden">
                                                <EventDescription description={event?.description || ''} />
                                            </div>


                                            <div className="rounded-tr-3xl rounded-xl overflow-hidden h-[200px] md:h-[250px] w-full md:w-[494px]">
                                                {!previewMode ? (
                                                    <EventLocationMap event={event} />
                                                ) : (
                                                    <div className="w-full max-w-[100px] rounded-tl-3xl rounded-xl bg-gray-100 dark:bg-cgray flex items-center justify-center">
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center px-2">
                                                            Vista previa de la ubicación solo disponible en el sitio web
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col md:flex-row justify-between gap-2">
                                            <div className="w-full max-w-[450px] hidden md:block">
                                                <EventDescription description={event?.description || ''} />
                                            </div>
                                            <div className="w-[300px] p-4 flex flex-col gap-1">
                                                <p className="font-medium text-base text-cblack dark:text-white">
                                                    {event.location.name}
                                                </p>
                                                <p className="text-sm text-slate-500 dark:text-400">
                                                    {event.location.direction}
                                                </p>

                                            </div>
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
                                    className="h-full overflow-auto flex min-h-[50vh]"
                                >
                                    {racecheckData.length > 0 ? (
                                        <ResultsTable
                                            title={event?.name}
                                            runners={racecheckData ?? []}
                                            modalities={event?.modalities ?? []}
                                            genders={event?.genders ?? []}
                                            eventId={event?._id}
                                        />) : (
                                        <div className="w-full h-full flex items-center justify-center py-12">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                No hay resultados disponibles aún
                                            </p>
                                        </div>
                                    )
                                    }
                                </motion.div>
                            )}
                        </AnimatePresence>

                    </Modal>
                    <Modal
                        isOpen={isOpenDeleteModal}
                        onClose={handleClose}
                        title="Eliminar evento"
                        className="!max-w-[440px]"
                    >
                        <div className="flex flex-col h-min gap-6 p-6">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                ¿Estás seguro de querer eliminar <span className="font-medium text-black dark:text-white">{event?.name}</span>?
                                <br />Esta acción no se puede deshacer.
                            </p>

                            <div className="flex justify-end gap-2 mt-auto">
                                <button className="rounded-full bg-red-500 dark:bg-red-600 px-4 py-3 text-sm font-medium text-white hover:bg-red-700 transition-all duration-75" onClick={handleConfirm}>
                                    Si, eliminar
                                </button>
                            </div>
                        </div>
                    </Modal>
                </>
            )
            }
        </>
    )
}

// Componente de mapa circular para mostrar ubicación
const EventLocationMap = ({ event }: { event: EventResponse }) => {
    const { isLoaded, loadError } = useGoogleMaps();

    // Coordenadas por defecto (puedes ajustar según tu ubicación)
    const defaultCenter = { lat: -34.397, lng: 150.644 };

    // Si el evento tiene coordenadas, las usamos, sino usamos las por defecto
    const center = event?.location?.lat && event?.location?.lng
        ? { lat: event.location.lat, lng: event.location.lng }
        : defaultCenter;

    const mapContainerStyle = {
        width: 'full',
        height: '280px',
        overflow: 'hidden'
    };

    if (loadError) {
        return (
            <div className="w-full h-[150px] rounded-tl-3xl rounded-xl bg-gray-100 dark:bg-cblack flex items-center justify-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center px-2">
                    Error al cargar el mapa
                </p>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="w-full h-[150px] rounded-tl-3xl rounded-xl bg-gray-100 dark:bg-cblack flex items-center justify-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Cargando...
                </p>
            </div>
        );
    }

    return (
        <div className="relative">
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={14}
                options={{
                    disableDefaultUI: true,
                    zoomControl: false,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                    styles: [
                        {
                            featureType: "poi",
                            elementType: "labels",
                            stylers: [{ visibility: "off" }]
                        }
                    ]
                }}
            >
                <Marker position={center} />
            </GoogleMap>
            <button
                disabled={!center}
                type='button'
                className="absolute top-3 right-3 z-10 rounded-xl w-max h-[39px] backdrop-blur-sm bg-white/90 border-gray-300 shadow-lg flex items-center gap-1 px-3 shadow-cdark/50 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                    const url = `https://www.google.com/maps?q=${center?.lat},${center?.lng}`;
                    window.open(url, '_blank', 'noopener,noreferrer');
                }}
            >
                <p className="text-sm font-medium tracking-tight text-gray-700">
                    Ver en Maps
                </p>
                <div className="w-[16px] h-[22px] relative scale-90">
                    <Image src="/googlemaps.png" alt="Google Maps" fill />
                </div>
            </button>
        </div>
    );
};
