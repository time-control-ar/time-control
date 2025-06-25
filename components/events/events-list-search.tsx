'use client'

import { useState, useCallback, useEffect } from 'react'
import { events as eventsData } from '../../app/eventos/page'
import { debounce } from 'lodash'
import { PlusIcon, SearchIcon, SlidersIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { AnimatedText } from '../ui/animated-text'
import { EventProps } from '@/app/schemas'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

function serializeText(text: string) {
    return text.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '')
}

// Event card component
const EventCard = ({ event }: { event: EventProps }) => {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState<EventProps | null>(null)

    const toggleOpen = () => setIsOpen(!isOpen)

    return (
        <motion.div
            className="w-full rounded-[23px] overflow-hidden flex flex-col h-max cursor-pointer shadow-lg max-w-[300px] mx-auto"
            onClick={toggleOpen}
            animate={{ scale: isOpen ? 1.05 : 1, transition: { duration: 0.2, ease: 'easeInOut' } }}
        >
            <motion.div className="flex w-full z-10 min-h-[350px] relative">
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

                <div className="absolute bottom-0 left-0 w-full z-10 pt-[58px] bg-gradient-to-t from-gray-950 via-gray-950/90 to-transparent px-4 pb-4">
                    <motion.h2 className="text-gray-50 text-xl font-semibold tracking-tight mb-1">
                        {event.name}
                    </motion.h2>

                    <motion.div className="flex w-full justify-between items-end gap-3">
                        <p className="text-gray-100 text-[14px] font-light tracking-tight">
                            {event.description}
                        </p>
                    </motion.div>
                </div>
            </motion.div>

            <motion.div layout="position" className="flex w-full justify-between items-end gap-3">

                <AnimatePresence mode="wait">
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="z-10 bg-gray-950 -mt-1 w-full"
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="h-max flex flex-col gap-3 p-2 bg-gray-950"
                            >
                                <button
                                    onClick={() => router.push(`/eventos/${event.id}`)}
                                    className="w-full max-w-max bg-transparent border border-white rounded-3xl py-2 flex items-center justify-center gap-2 px-5 hover:bg-white/50 transition-all duration-75 disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                                >
                                    <p className="text-white text-sm font-normal tracking-tighter">
                                        Ver más
                                    </p>
                                    <PlusIcon className="w-4 h-4 text-white" />
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div >
    )
}

const EventsListSearch = () => {
    const [mounted, setMounted] = useState(false)
    const [events, setEvents] = useState(eventsData)
    const [search, setSearch] = useState('')


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

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <div className="flex flex-col h-full w-full overflow-y-auto">
            <AnimatedText
                text="Eventos"
                className="text-3xl md:text-3xl text-start font-medium text-gray-700 dark:text-white pt-6 px-6 pb-3"
                delay={0.5}
            />

            <div className="sticky top-0 z-20 pt-1 mb-6 h-max w-full flex items-start justify-between gap-3 px-6 bg-gradient-to-b from-white via-white/50 to-transparent dark:from-gray-950 dark:via-gray-950/50 dark:to-transparent pb-1">
                <motion.div
                    className="relative select-none max-w-[300px] z"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                >
                    <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-20" />

                    <input
                        type="text"
                        placeholder="Buscar"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 p-2 max-w-[400px] rounded-[20px] h-12 backdrop-blur-md text-[13px] tracking-tighter
                         text-gray-700 dark:text-gray-300 placeholder:text-gray-500 dark:placeholder:text-gray-300 placeholder:text-base
                          bg-white dark:bg-gray-950 focus:bg-gray-100/80 
                          border border-gray-200 dark:border-gray-800
                          outline-none ring-0 transition-all duration-75 hover:shadow-md"
                    />
                </motion.div>

                <button className="border border-gray-200 dark:border-gray-800
                          outline-none ring-0 hover:shadow-md p-3 rounded-[20px] bg-white dark:bg-gray-950 focus:bg-gray-100/80 active:scale-95 transition-all duration-75">
                    <SlidersIcon className="w-5 h-5 text-gray-500 z-20" />
                </button>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-6">
                <AnimatePresence mode="wait">
                    {events?.length > 0 ? (
                        <div className="flex flex-col gap-5 px-8">
                            {events?.map((event, index) => (
                                <motion.div
                                    key={event.id}
                                    animate={{ opacity: 1, y: 0 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.2, delay: 0.1 * index }}
                                    viewport={{ once: true }}
                                >
                                    <EventCard event={event} />
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

        </div>
    )
}

export default EventsListSearch