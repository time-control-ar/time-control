'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { events as eventsData } from '../../app/eventos/page'
import { debounce } from 'lodash'
import { ChartBarIcon, InfoIcon, SearchIcon, SlidersIcon, XIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { AnimatedText } from '../ui/animated-text'
import { EventProps } from '@/app/schemas'
import Image from 'next/image'

function serializeText(text: string) {
    return text.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '')
}

// Event card component
const EventCard = ({ event, setSelectedEvent }: { event: EventProps, setSelectedEvent: (event: EventProps) => void }) => {
    // const [isOpen, setIsOpen] = useState(false)

    // const toggleOpen = () => setIsOpen(!isOpen)

    return (
        <>
            <motion.div
                className="w-full rounded-3xl overflow-hidden flex flex-col h-max cursor-pointer max-w-[350px] mx-auto"
                onClick={() => setSelectedEvent(event)}
            // animate={{ scale: isOpen ? 1.05 : 1, transition: { duration: 0.2, ease: 'easeInOut' } }}
            >
                <motion.div className="flex w-full z-10 min-h-[290px] relative">
                    {/* <div className="absolute top-0 left-0 w-full h-[10%] overflow-hidden bg-gradient-to-b from-gray-950/50 to-transparent z-20" /> */}

                    <Image
                        src={event.imageUrl}
                        alt={event.name}
                        className="z-10"
                        objectPosition='top'
                        objectFit='cover'
                        fill
                        priority
                    />
                    {/* 
                    <div
                        className="
                        p-6  pt-[58px] absolute bottom-0 left-0 w-full z-10 
                        bg-gradient-to-t from-gray-950 via-gray-950/90
                        dark:via-white/90 dark:from-white
                        to-transparent"
                    >
                      
                    </div> */}
                </motion.div>
            </motion.div >

            <motion.div className="flex flex-col w-full pt-3 px-1">
                <motion.h2 className="text-gray-950 dark:text-gray-50 text-lg font-semibold tracking-tight">
                    {event.name}
                </motion.h2>
                <p className=" text-gray-500 dark:text-gray-400 text-sm tracking-tight">
                    {event.description}
                </p>

                {/* <div className="flex w-full justify-end mt-4">
                    <button
                        className="dark:bg-gray-900 bg-white w-max rounded-full px-6 py-3 text-gray-950 dark:text-white flex items-center gap-2 hover:opacity-80 transition-all duration-300"
                        onClick={() => setSelectedEvent(event)}>
                        <p className="text-xs font-semibold tracking-tight">
                            Ver detalles
                        </p>
                        <ArrowRightIcon className="w-4 h-4 text-gray-950 dark:text-white" />
                    </button>
                </div> */}
            </motion.div>
        </>
    )
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
        <div className="flex flex-col h-full w-full overflow-y-auto">
            <AnimatedText
                text="Eventos"
                className="text-4xl font-medium text-gray-800 dark:text-white px-6 pt-12 pb-6"
            />

            <motion.div
                animate={{ height: searchOpen ? '100vh' : '100px' }}
                transition={{ duration: 0.3 }}
                className={`sticky top-0 z-20 pt-3 pb-1 mb-6 
                w-full flex items-start justify-between gap-6 px-6 
                bg-gradient-to-b backdrop-blur-md
                from-white via-white/60 to-transparent 
                dark:from-gray-950 dark:via-gray-950/60 dark:to-transparent`}
            >
                <button
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
                </button>

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


            <AnimatePresence mode="wait">
                {selectedEvent ? (
                    <>
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ duration: 0.1, ease: 'easeInOut' }}
                            className="absolute bottom-0 left-0 w-full max-w-[600px] h-[90vh] z-50 mt-auto bg-white rounded-t-3xl "
                        >

                            <div className="flex items-center justify-end p-6">
                                <button onClick={() => setSelectedEvent(undefined)}>
                                    <XIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            <div className="flex flex-col border-b border-gray-200 dark:border-gray-500 pb-4 px-6 h-full overflow-y-auto">
                                <div className="flex flex-col items-center gap-3 px-4">
                                    <h1 className="text-2xl font-bold text-gray-950 text-center">
                                        {selectedEvent.name}
                                    </h1>
                                    {/* <p className="text-gray-500 dark:text-gray-400 text-sm font-light tracking-tight text-justify">
                                        {selectedEvent.description}
                                    </p> */}
                                </div>

                                <div className="flex w-full gap-3 pt-6">
                                    <button
                                        onClick={() => handleTabChange('info')}
                                        className={`${selectedTab === 'info' ? 'bg-gray-200 dark:bg-gray-700' : ''} rounded-full px-6 py-3 text-gray-950 dark:text-white flex items-center gap-2 hover:opacity-80 transition-all duration-300 w-max`}>
                                        <InfoIcon className="w-4 h-4 text-gray-500 z-20" />
                                        <p className="text-xs font-medium tracking-tight text-gray-950 dark:text-white ">
                                            Información
                                        </p>
                                    </button>
                                    <button
                                        onClick={() => handleTabChange('results')}
                                        className={`${selectedTab === 'results' ? 'bg-gray-200 dark:bg-gray-700' : ''} rounded-full px-6 py-3 text-gray-950 dark:text-white flex items-center gap-2 hover:opacity-80 transition-all duration-300 w-max`}>
                                        <ChartBarIcon className="w-4 h-4 text-gray-500 z-20" />
                                        <p className="text-xs font-medium tracking-tight text-gray-950 dark:text-white ">
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
                                                    {selectedEvent.description}
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
                            </div>
                        </motion.div>
                        <motion.div
                            onClick={() => setSelectedEvent(undefined)}
                            initial={{ opacity: 0, backdropFilter: 'blur(0px)', transition: { duration: 0.2, ease: 'easeInOut' } }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                            className="absolute bottom-0 left-0 w-full h-full z-20 bg-gray-950/30 flex items-center justify-center">
                        </motion.div>
                    </>

                ) : null}
            </AnimatePresence>
        </div >
    )
}

export default EventsListSearch