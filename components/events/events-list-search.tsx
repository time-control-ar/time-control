'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { ChartBarIcon, InfoIcon, SearchIcon, SlidersIcon, XIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { AnimatedText } from '../ui/animated-text'
import RaceCheckTable from './race-check-table'
import { EventCard } from './event-card'
import { debounce } from 'lodash'
import Modal from '../ui/modal'
import { EventResponse } from '@/services/eventService'

function serializeText(text: string) {
    return text.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '')
}

const EventsListSearch = ({ eventsData }: { eventsData: EventResponse[] }) => {
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

    const eventsByMonth = useMemo(() => {
        return eventsData.reduce((acc, event) => {
            const month = new Date(event.date).getMonth()
            acc[month] = acc[month] || []
            acc[month].push(event)
            return acc
        }, {} as Record<number, EventResponse[]>)
    }, [eventsData])

    console.log(eventsByMonth)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return null


    return (
        <>
            <AnimatedText
                text="Eventos"
                className="text-4xl font-medium text-gray-800 dark:text-white px-6 pt-12 pb-6"
            />

            <AnimatePresence mode="wait">
                <motion.div
                    initial={{ opacity: 0, transition: { duration: 0.3 } }}
                    animate={{ opacity: 1, transition: { duration: 0.3 } }}
                    exit={{ opacity: 0, transition: { duration: 0.1 } }}
                    className={`sticky top-0 z-40 pt-3 pb-1 mb-6 max-w-screen-lg mx-auto
                w-full flex items-start justify-between gap-6 px-6 
                bg-gradient-to-b backdrop-blur-md
                from-white via-white/60 to-transparent 
                dark:from-gray-950 dark:via-gray-950/60 dark:to-transparent`}
                >

                    <motion.div key='search-open' className="flex relative">
                        <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-20" />
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
                            <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setSearch('')} disabled={!search}>
                                <XIcon className="w-5 h-5 text-gray-500 z-20 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-75 disabled:opacity-50 disabled:cursor-not-allowed" />
                            </button>
                        )}
                    </motion.div>


                    <button
                        className="h-10 rounded-full w-max pl-3 pr-4
                          relative select-none flex items-center gap-2
                          bg-white/80 dark:bg-gray-950/80 
                          border border-gray-200 dark:border-gray-500
                          outline-none ring-0 transition-all duration-75 shadow-sm md:hover:shadow-md
                          p-3"
                        onClick={() => setFiltersOpen(!filtersOpen)}
                    >
                        <SlidersIcon strokeWidth={2.5} className="w-4 h-4 text-gray-500 z-20" />
                        <p className="text-gray-700 dark:text-gray-300 text-sm font-medium tracking-tight">
                            Filtrar
                        </p>
                    </button>
                </motion.div>
            </AnimatePresence>

            <div className='flex flex-col h-full w-full'>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-6 max-w-screen-2xl mx-auto">
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
            </div>

            <Modal
                isOpen={!!selectedEvent}
                onClose={() => setSelectedEvent(undefined)}
                title={selectedEvent?.name}
                showCloseButton={true}
            >
                <div className="flex w-full gap-2 px-4 border-b border-gray-200 dark:border-gray-600">
                    <button
                        onClick={() => handleTabChange('info')}
                        className={`-mb-[0.9px] px-2 py-4 transition-all duration-100 flex items-center justify-center gap-3 bg-transparent border-b ${selectedTab === 'info' ? '!border-black dark:border-blue-300' : 'border-transparent opacity-60'}`}
                    >
                        <InfoIcon className={`w-4 h-4 ${selectedTab === 'info' ? 'text-black dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`} />
                        <p className={`text-sm tracking-tight`}>
                            Información
                        </p>
                    </button>

                    <button
                        onClick={() => handleTabChange('results')}
                        className={`-mb-[0.9px] px-2 py-4 transition-all duration-100 flex items-center justify-center gap-3 bg-transparent border-b ${selectedTab === 'results' ? '!border-black dark:border-blue-300' : 'border-transparent opacity-60'}`}>
                        <ChartBarIcon className={`w-4 h-4 ${selectedTab === 'results' ? 'text-black dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`} />
                        <p className={`text-sm tracking-tight`}>
                            Resultados
                        </p>
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
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-light tracking-tight text-justify">
                                {selectedEvent?.description}
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="p-4 h-full flex flex-col overflow-y-auto"
                        >
                            <RaceCheckTable results={selectedEvent?.results} />
                        </motion.div>
                    )}
                </AnimatePresence>

            </Modal>
        </>
    )
}

export default EventsListSearch