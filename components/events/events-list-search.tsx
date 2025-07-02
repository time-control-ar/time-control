'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { events as eventsData } from '../../app/eventos/page'
import { debounce } from 'lodash'
import { ChartBarIcon, InfoIcon, SearchIcon, SlidersIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { AnimatedText } from '../ui/animated-text'
import { EventProps } from '@/lib/utils'
import { EventCard } from './event-card'
import Modal from '../ui/modal'

function serializeText(text: string) {
    return text.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '')
}



const EventsListSearch = () => {
    const [events, setEvents] = useState(eventsData)
    const [searchOpen, setSearchOpen] = useState(false)
    const [search, setSearch] = useState('')

    const [selectedEvent, setSelectedEvent] = useState<EventProps | undefined>(undefined)
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
        }, {} as Record<number, EventProps[]>)
    }, [eventsData])

    console.log(eventsByMonth)

    return (
        <>
            <AnimatedText
                text="Eventos"
                className="text-4xl font-medium text-gray-800 dark:text-white px-6 pt-12 pb-6"
            />

            <AnimatePresence mode="wait">
                <motion.div
                    layout='position'
                    initial={{ opacity: 0, transition: { duration: 0.3 } }}
                    animate={{ opacity: 1, transition: { duration: 0.3 } }}
                    exit={{ opacity: 0, transition: { duration: 0.1 } }}
                    className={`sticky top-0 z-20 pt-3 pb-1 mb-6 
                w-full flex items-start justify-between gap-6 px-6 
                bg-gradient-to-b backdrop-blur-md
                from-white via-white/60 to-transparent 
                dark:from-gray-950 dark:via-gray-950/60 dark:to-transparent`}
                >
                    {searchOpen ? (
                        <motion.div key='search-open' className="flex relative">
                            <SearchIcon className="w-5 h-5 text-gray-500 z-20 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input

                                type="text"
                                placeholder="Buscar"
                                className="w-full rounded-full px-10 h-10 bg-white/80 dark:bg-gray-950/80 border border-gray-200 dark:border-gray-500 outline-none ring-0 transition-all duration-75 shadow-sm md:hover:shadow-md placeholder:text-gray-500 dark:placeholder:text-gray-400 placeholder:tracking-tight"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        e.currentTarget.blur()
                                    }
                                }}
                            />
                        </motion.div>
                    ) : (
                        <motion.button
                            key='search-closed'
                            onClick={() => setSearchOpen(!searchOpen)}
                            className="h-10 rounded-full w-max pl-3 pr-4
                      relative select-none flex items-center gap-2
                      bg-white/80 dark:bg-gray-950/80 
                      border border-gray-200 dark:border-gray-500
                      outline-none ring-0 transition-all duration-75 shadow-sm md:hover:shadow-md"
                        >
                            <SearchIcon className="w-5 h-5 text-gray-500 z-20" />
                            <p className="text-gray-700 dark:text-gray-300 text-sm font-medium tracking-tight">
                                Buscar
                            </p>
                        </motion.button>
                    )}

                    <button
                        className="h-10 rounded-full w-max pl-3 pr-4
                          relative select-none flex items-center gap-2
                          bg-white/80 dark:bg-gray-950/80 
                          border border-gray-200 dark:border-gray-500
                          outline-none ring-0 transition-all duration-75 shadow-sm md:hover:shadow-md
                          p-3"
                        onClick={() => setSearchOpen(!searchOpen)}
                    >
                        <SlidersIcon strokeWidth={2.5} className="w-4 h-4 text-gray-500 z-20" />
                        <p className="text-gray-700 dark:text-gray-300 text-sm font-medium tracking-tight">
                            Filtrar
                        </p>
                    </button>
                </motion.div>
            </AnimatePresence>

            <div className='flex flex-col h-full w-full'>


                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-6">
                    <AnimatePresence mode="wait">
                        {events?.length > 0 ? (
                            <div className="flex flex-col gap-12 px-8">
                                {events?.map((event, index) => (
                                    <motion.div
                                        key={event.id}
                                        animate={{ opacity: 1, y: 0 }}
                                        initial={{ opacity: 0, y: 20 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.2, delay: 0.1 * index }}
                                        viewport={{ once: true }}
                                    >
                                        <EventCard event={event} setSelectedEvent={setSelectedEvent} />
                                    </motion.div>
                                ))}

                                <div className="flex items-center justify-center">
                                    <p className="text-gray-500 text-sm">
                                        {events.length} eventos encontrados
                                    </p>
                                </div>
                            </div>
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
                    <div className="flex flex-col items-center gap-3 px-4">
                        {/* Title is now handled by the modal component */}
                    </div>

                    <div className="flex w-full gap-3 pt-6">
                        <button
                            onClick={() => handleTabChange('info')}
                            className={`rounded-btn ${selectedTab === 'info' ? '!bg-gray-200 !dark:bg-gray-700' : '!bg-transparent'}`}>
                            <InfoIcon className="w-4 h-4 text-gray-500 z-20" />
                            <p className="text-xs font-medium tracking-tight text-gray-950 dark:text-white t">
                                Información
                            </p>
                        </button>
                        <button
                            onClick={() => handleTabChange('results')}
                            className={`rounded-btn ${selectedTab === 'results' ? '!bg-gray-200 !dark:bg-gray-700' : '!bg-transparent'}`}>
                            <ChartBarIcon className="w-4 h-4 text-gray-500 z-20" />
                            <p className="text-xs font-medium tracking-tight text-gray-950 dark:text-white t">
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
                                    className="flex flex-col gap-3"
                                >
                                    <p className="text-gray-500 dark:text-gray-400 text-sm font-light tracking-tight text-justify">
                                        {/* {selectedEvent.} */}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </Modal>
            </div>
        </>
    )
}

export default EventsListSearch