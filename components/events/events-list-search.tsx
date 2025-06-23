'use client'

import { useState, useCallback, useEffect } from 'react'
import { events as eventsData } from '../../app/eventos/page'
import { debounce } from 'lodash'
import { CalendarIcon, FilterIcon, MinusIcon, PinIcon, PlusIcon, SearchIcon, SlidersHorizontal, SlidersIcon, TrophyIcon, Users2 } from 'lucide-react'
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
const EventCard = ({ event }: { event: EventProps }) => {
    const [isOpen, setIsOpen] = useState(false)

    const toggleOpen = () => setIsOpen(!isOpen)

    return (
        <motion.div
            className="w-full rounded-[23px] overflow-hidden flex flex-col h-max cursor-pointer shadow-lg"
            onClick={toggleOpen}
        >
            <motion.div className="flex w-full z-10 min-h-[350px] relative">
                <div className="absolute top-0 left-0 w-full h-[17%] overflow-hidden bg-gradient-to-b from-gray-950/50 to-transparent z-20" />

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
                            className="z-20 bg-gray-950 -mt-1 w-full"
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="h-max flex flex-col gap-3 p-2 bg-gray-950"
                            >
                                <button
                                    className="w-full max-w-max bg-white rounded-3xl py-2 flex items-center justify-center gap-2 px-5 hover:bg-white transition-all duration-75 disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                                >
                                    <p className="text-gray-900 text-sm font-normal tracking-tighter">
                                        Ver más
                                    </p>
                                    <PlusIcon className="w-4 h-4 text-gray-900" />
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


            <motion.div className="flex flex-col w-full">

                <AnimatedText
                    text="Eventos"
                    className="text-3xl md:text-3xl text-start font-medium text-gray-700 dark:text-white pt-6 px-6 pb-3"
                    delay={0.5}
                />
                <div className="sticky top-0 z-20 pb-1 mb-6 h-full w-full bg-white dark:bg-gray-950 flex items-center justify-between gap-3 px-6">
                    <motion.div
                        className="relative select-none max-w-[300px]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.9 }}
                    >
                        <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-20" />

                        <input
                            type="text"
                            placeholder="Buscar"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-3 py-2 placeholder:text-gray-500 text-gray-700 dark:text-gray-300 dark:placeholder:text-gray-300 placeholder:text-lg bg-white/90 dark:bg-gray-950/60 border border-gray-200 dark:border-gray-800 rounded-[20px] pl-10 outline-none ring-0 focus:bg-gray-100/80 transition-all duration-75 hover:shadow-md max-w-[400px]"
                        />
                    </motion.div>

                    <button className=" p-3 rounded-[20px] bg-white dark:bg-gray-950 active:bg-gray-100 active:scale-95 transition-all duration-75">
                        <SlidersIcon className="w-5 h-5 text-gray-950" />
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

            </motion.div>
        </div>
    )
}

export default EventsListSearch