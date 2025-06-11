'use client'

import { useState, useCallback, useEffect } from 'react'
import { events as eventsData } from '../../app/eventos/page'
import { debounce } from 'lodash'
import { ArrowRightIcon, Calendar1, CalendarCog, CalendarDays, CalendarDaysIcon, CalendarIcon, CalendarRange, LucideTrophy, PinIcon, SearchIcon, Trophy, TrophyIcon, Users2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Card } from '../ui/card'
import { EventProps } from '@/app/schemas'
import Image from 'next/image'
import { Button } from '../ui/button'
import { AnimatedText } from '../ui/animated-text'

const EventCard = ({ event }: { event: EventProps }) => {
    const parseDate = (date: string) => {
        const dateObj = new Date(date)
        return dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    return (
        <Card className="w-full rounded-[30px] bg-gray-950 overflow-hidden">
            <div className="w-full h-[500px] relative">
                <div className="flex gap-2 px-4 py-3 rounded-full bg-gray-800/80 backdrop-blur-sm  max-w-max absolute top-4 right-4 z-10">
                    <CalendarIcon className="w-4 h-4 text-sky-400" />
                    <p className="text-white text-sm font-semibold tracking-tighter leading-tight">
                        {parseDate(event.date)}
                    </p>
                </div>
                <Image src={event.imageUrl} alt={event.name} fill className="object-cover" objectPosition='top' />

                <div className="p-6 bg-gradient-to-t from-gray-950 via-gray-950/90 to-transparent absolute bottom-0 left-0 right-0">
                    <div className="flex flex-col pt-32 pb-6 gap-1">

                        <h2 className="text-gray-50 text-2xl font-bold tracking-tight">
                            {event.name}
                        </h2>
                        <p className="text-gray-300 text-sm font-normal tracking-tight leading-tight">
                            {event.description}
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 pb-3 pt-2">



                        <div className="flex gap-2 items-center">
                            <PinIcon className="w-5 h-5 text-sky-400" />
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

                        <div className="flex items-center -mx-3">
                            <button className="w-full bg-sky-400 rounded-full py-2 flex items-center gap-2 max-w-max px-3">
                                <TrophyIcon className="w-5 h-5 text-gray-950" />
                                <p className="text-gray-950 text-sm font-normal tracking-tighter leading-tight">
                                    Ver resultados
                                </p>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
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
        <div className="flex flex-col h-full w-full px-6 overflow-y-auto">

            <AnimatedText
                text="Eventos"
                className="text-3xl md:text-3xl text-start font-medium text-gray-800 pt-4 p-2"
                delay={0.5}
            />

            <motion.div className="flex flex-col w-full gap-5 pb-12 transition-all duration-75">

                <div className="sticky top-0 z-20 pb-2 h-full">
                    <div className="relative">
                        <div className="absolute h-6 top-0 left-0 w-full bg-gradient-to-b to-transparent from-white via-white/60 rounded-b-7xl -z-10" />

                        <div className="px-6 pt-3">
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
                                transition={{ duration: 0.1, delay: 0.2 * index, ease: 'easeInOut' }}
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