'use client'

import { useState, useCallback, useEffect } from 'react'
import { ChartBarIcon, ClockIcon, InfoIcon, MapPinIcon, PlusIcon, SearchIcon, SlidersIcon, XIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import RaceCheckTable from './race-check-table'
import { EventCard } from './event-card'
import { debounce } from 'lodash'
import Modal from '../ui/modal'
import { EventResponse } from '@/services/eventService'
import SafeImage from '../ui/safe-image'
import { useSession } from 'next-auth/react'
import { adminEmails } from '@/lib/utils'
import { useRouter } from 'next/navigation'

function serializeText(text: string) {
    return text.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '')
}

const EventsListSearch = ({ eventsData }: { eventsData: EventResponse[] }) => {
    const router = useRouter()
    const session = useSession()
    const isAdmin = adminEmails.includes(session.data?.user?.email || '')
    const [filtersOpen, setFiltersOpen] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    const [events, setEvents] = useState(eventsData)
    const [search, setSearch] = useState('')

    const [selectedEvent, setSelectedEvent] = useState<EventResponse | undefined>(undefined)
    const [selectedTab, setSelectedTab] = useState<'info' | 'results'>('info')

    const handleTabChange = (tab: 'info' | 'results') => {
        setSelectedTab(tab)
    }

    const handleSearch = useCallback(
        debounce((searchTerm: string) => {
            if (!searchTerm.trim()) {
                setEvents(eventsData)
                return
            }

            const serializedSearch = serializeText(searchTerm)
            const filteredEvents = eventsData.filter(event =>
                serializeText(event.name).includes(serializedSearch) ||
                serializeText(event.location).includes(serializedSearch) ||
                serializeText(event.description).includes(serializedSearch)
            )

            setEvents(filteredEvents)
        }, 300),
        []
    )

    useEffect(() => {
        handleSearch(search)
    }, [search, handleSearch])

    // const eventsByMonth = useMemo(() => {
    //     return eventsData.reduce((acc, event) => {
    //         const month = new Date(event.date).getMonth()
    //         acc[month] = acc[month] || []
    //         acc[month].push(event)
    //         return acc
    //     }, {} as Record<number, EventResponse[]>)
    // }, [eventsData])

    // console.log(eventsByMonth)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return null


    return (
        <div className='flex flex-col w-full h-full'>
            <motion.div
                layout
                animate={{ overflow: filtersOpen ? 'hidden' : 'visible', height: filtersOpen ? 'auto' : 'auto' }}
                transition={{ duration: 0.2 }}
                className={`
                    sticky top-0 z-40 pt-3 pb-2 mb-6 max-w-screen-lg mx-auto backdrop-blur-md
                    w-full flex flex-col items-start justify-between px-6 
                    bg-gradient-to-b
                    from-white via-white to-white/90
                    dark:from-gray-950 dark:via-gray-950 dark:to-gray-950/50
                    `}
            >

                <div className="flex items-center justify-between w-full gap-6">
                    <div className="flex relative">
                        <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-white z-20" />
                        <input
                            type="text"
                            placeholder="Buscar"
                            className="rounded-search-input"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    e.currentTarget.blur()
                                }
                            }}
                        />

                        {search && (
                            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setSearch('')} disabled={!search}>
                                <XIcon className="w-5 h-5 text-gray-500 z-20 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-75 disabled:opacity-50 disabled:cursor-not-allowed" />
                            </button>
                        )}
                    </div>


                    <button
                        type="button"
                        className={`h-10 rounded-full w-max p-3
                          relative select-none flex items-center gap-2
                          bg-gradient-to-t from-white to-white dark:from-gray-800 dark:to-gray-900
                          border ${filtersOpen ? 'border-gray-300 dark:border-gray-700' : ' border-gray-200 dark:border-gray-800'}
                          outline-none ring-0 transition-all duration-75 shadow-sm md:hover:shadow-md
                          p-3`}
                        onClick={() => setFiltersOpen(!filtersOpen)}
                    >
                        {filtersOpen ? (
                            <XIcon strokeWidth={2.5} className="w-4 h-4 text-gray-500 dark:text-white z-20" />
                        ) : (
                            <SlidersIcon strokeWidth={2.5} className="w-4 h-4 text-gray-500 dark:text-white z-20" />
                        )}
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {filtersOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                            animate={{ opacity: 1, height: 'auto', overflow: 'hidden' }}
                            exit={{ opacity: 0, height: 0, overflow: 'hidden', transition: { duration: 0.1 } }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="w-full flex flex-col gap-4 p-4">

                                <div className="flex flex-col gap-4">
                                    <p className='text-gray-500 dark:text-gray-400 text-sm font-medium tracking-tight'>Filtros</p>
                                </div>


                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-10 gap-x-2 pb-20 max-w-screen-2xl md:px-6 mx-auto w-full h-full">
                {isAdmin && (
                    <button
                        type="button"
                        className="bg-gray-100 dark:bg-gray-800 rounded-3xl overflow-hidden hover:shadow-lg  dark:shadow-gray-950/50 flex items-center justify-center gap-2 h-full flex-col max-w-[300px] mx-auto w-full min-h-[300px] cursor-pointer select-none border-2 border-dashed border-gray-300 dark:border-gray-700 transition-all duration-75"
                        onClick={() => router.push('/eventos/nuevo')}
                    >
                        <PlusIcon className="w-4 h-4 text-gray-500 dark:text-white" />
                        <p className="text-sm font-medium tracking-tight text-gray-600 dark:text-gray-400">Nuevo evento</p>
                    </button>
                )}
                <AnimatePresence mode="wait">
                    {events?.length > 0 ? (
                        <>
                            {events?.map((event, index) => (
                                <motion.div
                                    key={event._id}
                                    animate={{ opacity: 1, y: 0 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.2, delay: 0.1 * index }}
                                    viewport={{ once: true }}
                                >
                                    <EventCard event={event} setSelectedEvent={setSelectedEvent} />
                                </motion.div>
                            ))}
                        </>
                    ) : (
                        <div className="flex items-center justify-center col-span-full">
                            <p className="text-gray-500 text-sm">
                                No se encontraron eventos
                            </p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <Modal
                isOpen={!!selectedEvent}
                onClose={() => setSelectedEvent(undefined)}
                title={selectedEvent?.name}
                showCloseButton={true}
            >
                <div className="flex w-full items-center justify-start px-6 pb-3 gap-2">
                    <button
                        type="button"
                        onClick={() => handleTabChange('info')}
                        className={`h-10 px-4 rounded-full flex items-center justify-center
                           relative select-none gap-2
                           bg-gradient-to-t from-white to-white dark:from-gray-800 dark:to-gray-900
                           border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
                    >
                        <div className={`${selectedTab === 'info' ? 'opacity-100' : 'opacity-60'} flex items-center justify-center gap-2`}>

                            <InfoIcon className={`w-4 h-4 text-blue-400 dark:text-cyan-300`} />
                            <p className={`text-xs font-semibold tracking-tight`}>
                                Información
                            </p>
                        </div>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTabChange('results')}
                        className={`h-10 px-4 rounded-full flex items-center justify-center
                           relative select-none gap-2
                           bg-gradient-to-t from-white to-white dark:from-gray-800 dark:to-gray-900
                           border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
                    >
                        <div className={`${selectedTab === 'results' ? 'opacity-100' : 'opacity-60'} flex items-center justify-center gap-2`}>

                            <ChartBarIcon className={`w-4 h-4 text-orange-500 dark:text-orange-400`} />
                            <p className={`text-xs font-semibold tracking-tight`}>
                                Resultados
                            </p>
                        </div>
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {selectedTab === 'info' ? (
                        <motion.div
                            key="info"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col gap-3 p-6 h-full overflow-y-auto"
                        >
                            <SafeImage
                                src={selectedEvent?.image || ''}
                                alt={selectedEvent?.name || ''}
                                className="z-10 object-cover rounded-3xl md:!min-h-[300px]"
                                fill
                                priority
                                fallbackText="Imagen"
                            />

                            <div className="flex flex-col gap-4 h-max">
                                <div className="flex items-end justify-start max-w-max gap-3">
                                    <div className="flex flex-col rounded-2xl bg-gradient-to-b dark:from-gray-900 dark:to-gray-800 from-gray-100 to-white backdrop-blur-sm px-3 py-2 w-max items-center">
                                        <p className="text-gray-950 dark:text-white text-3xl font-semibold tracking-tight -mb-1">
                                            {new Date(selectedEvent?.date || '').getDate()}
                                        </p>
                                        <p className="text-gray-950 dark:text-white text-sm tracking-tight font-medium capitalize">
                                            {new Date(selectedEvent?.date || '').toLocaleString('es-ES', { month: 'long' })}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-2 items-center w-full">
                                            <ClockIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                            <p className="text-black dark:text-white text-base tracking-tight">
                                                {selectedEvent?.startTime} a {selectedEvent?.endTime} hs
                                            </p>
                                        </div>

                                        <div className="flex gap-2 items-center w-full">
                                            <MapPinIcon className="w-5 h-5 text-red-500 dark:text-red-500" />
                                            <p className="text-black dark:text-white text-base tracking-tight">
                                                {selectedEvent?.location || 'Ubicación'}
                                            </p>
                                        </div>

                                    </div>
                                </div>

                                <div className="px-3">
                                    <p className="text-gray-500 dark:text-gray-400 text-base font-light tracking-tight text-justify">
                                        {selectedEvent?.description}
                                    </p>
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
                            className="h-full flex flex-col overflow-y-auto px-4 relative"
                        >
                            <RaceCheckTable results={selectedEvent?.results} />
                        </motion.div>
                    )}
                </AnimatePresence>

            </Modal>
        </div>
    )
}

export default EventsListSearch