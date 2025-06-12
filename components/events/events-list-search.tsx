'use client'

import { useState, useCallback, useEffect } from 'react'
import { events as eventsData } from '../../app/eventos/page'
import { debounce } from 'lodash'
import { CalendarIcon, PinIcon, PlusIcon, SearchIcon, TrophyIcon, Users2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { EventProps } from '@/app/schemas'
import Image from 'next/image'
import { AnimatedText } from '../ui/animated-text'

const EventCard = ({ event }: { event: EventProps }) => {
    const [isOpen, setIsOpen] = useState(false)

    const parseDate = (date: string) => {
        const dateObj = new Date(date)
        return dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    return (
        <motion.div
            layout
            className="w-full rounded-t-2xl !rounded-b-[36px] bg-gray-950 overflow-hidden relative flex flex-col"
        >
            <motion.div
                initial={{ height: isOpen ? '340px' : '250px' }}
                animate={{ height: isOpen ? '340px' : '250px' }}
                exit={{ height: isOpen ? '340px' : '250px' }}
                className="flex w-full justify-between top-0 right-0 z-10 p-2 cursor-pointer relative"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="absolute top-0 left-0 flex flex-col w-full h-max z-30">
                    <div className="flex w-full  justify-between gap-2 px-2 py-2 rounded-xl">
                        <div className="flex items-center gap-2 p-2 px-3 rounded-xl bg-gray-50">
                            <CalendarIcon className="w-4 h-4 text-gray-900" />
                            <p className="text-gray-900 text-xs font-semibold tracking-tighter leading-tight">
                                {parseDate(event.date)}
                            </p>
                        </div>

                        {/* <button
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-900/50 backdrop-blur-sm">
                            <PlusIcon
                                className={`w-5 h-5 text-gray-50 transition-all ${isOpen ? 'rotate-45' : ''}`}
                                onClick={() => setIsOpen(!isOpen)}
                            />
                        </button> */}
                    </div>
                </div>

                <Image
                    src={event.imageUrl}
                    alt={event.name}
                    fill
                    className="object-cover"
                    objectPosition='top'
                    onClick={() => setIsOpen(!isOpen)}
                    priority
                />

                <div className="px-4 bg-gradient-to-t from-gray-950 via-gray-950/90 to-transparent absolute bottom-0 left-0 right-0">
                    <div className={`flex flex-col pb-6 px-2 cursor-pointer transition-all duration-500 ${isOpen ? 'pt-8' : 'pt-12'}`} onClick={() => setIsOpen(!isOpen)}>
                        <div className="flex justify-between items-start">
                            <h2 className="text-gray-50 text-2xl font-bold tracking-tight">
                                {event.name}
                            </h2>
                            <PlusIcon
                                className={`w-5 h-5 text-gray-50 transition-all ${isOpen ? 'rotate-45' : ''}`}
                                onClick={() => setIsOpen(!isOpen)}
                            />

                        </div>
                        <AnimatePresence>
                            {isOpen && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: isOpen ? 'auto' : 0 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3, delay: 0.1 }}
                                    className={`text-gray-300 text-sm font-normal tracking-tight overflow-hidden`}>
                                    {event.description}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

            </motion.div>

            <div className="flex flex-col gap-4 px-6 pb-8">
                <div className="flex gap-2 items-center">
                    <PinIcon className="w-5 h-5 text-red-400" />
                    <p className="text-gray-50 text-sm font-normal tracking-tighter leading-tight">
                        {event.location}
                    </p>
                </div>

                <div className="flex gap-2 items-center">
                    <Users2 className="w-5 h-5 text-sky-400" />
                    <p className="text-gray-50 text-sm font-normal tracking-tighter leading-tight">
                        {event?.participants || 0} participantes
                    </p>
                </div>

                {/* <div className="flex gap-2 items-center">
                    <TrophyIcon className="w-5 h-5 text-sky-400" />
                    <p className="text-gray-50 text-sm font-normal tracking-tighter leading-tight">
                        Ver resultados
                    </p>
                </div> */}
            </div>

            <AnimatePresence mode="wait">
                {isOpen ? (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'max-content' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="h-max"
                    >
                        <div className="flex justify-end gap-2 px-4 pb-3 -mt-2">
                            <button disabled className="w-full max-w-max bg-white rounded-3xl py-3 flex items-center justify-center gap-2 px-4 hover:bg-white transition-all duration-75 disabled:opacity-50 disabled:cursor-not-allowed">
                                <p className="text-gray-900 text-sm font-normal tracking-tighter leading-tight">
                                    Inscribirme
                                </p>
                                <PlusIcon className="w-5 h-5 text-gray-900" />
                            </button>
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </motion.div>
    )
}
const EventsListSearch = () => {
    const [mounted, setMounted] = useState(false)

    const [events, setEvents] = useState(eventsData)
    const [search, setSearch] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    function serializeText(text: string) {
        return text.toLowerCase().replace(/ /g, '').replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u')
    }
    const handleSearch = useCallback(
        debounce((search: string) => {
            setIsLoading(true)

            if (search.length > 0) {
                const filteredEvents = eventsData.filter((event) => serializeText(event.name).includes(serializeText(search)) || serializeText(event.location).includes(serializeText(search)) || serializeText(event.description).includes(serializeText(search)))

                setEvents(filteredEvents)
            } else {
                setEvents(eventsData)
            }
            setIsLoading(false)
        }, 300),
        []
    )

    useEffect(() => {
        handleSearch(search)
    }, [search])

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <div className="flex flex-col h-full w-full px-6 overflow-y-auto ">

            <AnimatedText
                text="Eventos"
                className="text-3xl md:text-3xl text-start font-medium text-gray-800 p-2"
                delay={0.5}
            />

            <motion.div className="flex flex-col w-full gap-5 pb-12 transition-all duration-75">

                <div className="sticky top-0 z-20 pb-2 h-full">
                    <div className="relative">
                        <div className="absolute h-6 top-0 left-0 w-full bg-gradient-to-b to-transparent from-white via-white/60 rounded-b-7xl -z-10" />

                        <div className="px-6 pt-2">
                            <motion.div
                                className="relative select-none"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3, delay: 0.9 }}
                            >
                                <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-20" />
                                <input
                                    type="text"
                                    placeholder="Buscar"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="
                                w-full p-3 placeholder:text-gray-500 text-gray-700 placeholder:text-lg bg-white/90  border border-gray-200 rounded-[20px] pl-10 outline-none ring-0 backdrop-blur-sm shadow-sm
                                focus:bg-gray-100/80 transition-all duration-75
                                hover:shadow-md max-w-[400px]
                                "
                                />
                            </motion.div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <AnimatePresence mode="wait">
                        {events.map((event, index) => (
                            <motion.div
                                key={event.id + index}
                                animate={{ opacity: 1 }}
                                initial={{ opacity: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.1, delay: 0.2 * index }}
                                viewport={{ once: true }}
                            >
                                <EventCard event={event} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <div className="flex items-center justify-center">
                    <p className="text-gray-500 text-sm">
                        {events.length} eventos encontrados
                    </p>
                </div>
            </motion.div>
        </div >
    )
}

export default EventsListSearch