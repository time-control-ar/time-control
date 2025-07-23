'use client'

import { useState, useCallback, useEffect } from 'react'
import { ArrowUp, CheckIcon, PlusIcon, SearchIcon, SlidersIcon, XIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { EventCard } from './event-card'
import { EventResponse } from '@/services/eventService'
import { useSession } from 'next-auth/react'
import { adminEmails, eventTypes } from '@/lib/utils'
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
    const [filtersOpen, setFiltersOpen] = useState(true)
    const [isMounted, setIsMounted] = useState(false)
    const [events, setEvents] = useState(eventsData)
    const [search, setSearch] = useState('')
    const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([])

    const handleSearch = useCallback((searchTerm: string, selectedTypes: string[]) => {
        const serializedSearch = serializeText(searchTerm)
        const filteredEvents = eventsData.filter(event => {
            const matchesSearch = serializeText(event.name).includes(serializedSearch) ||
                serializeText(event.description).includes(serializedSearch)
            const matchesCategory = selectedTypes.length === 0 || event.type.some(type => selectedTypes.includes(type))
            return matchesSearch && matchesCategory
        })
        setEvents(filteredEvents)
    }, [eventsData])

    const handleCategoryToggle = (category: string) => {
        setSelectedEventTypes(prev => {
            const newSelected = prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
            handleSearch(search, newSelected)
            return newSelected
        })
    }

    useEffect(() => {
        handleSearch(search, selectedEventTypes)
    }, [search, selectedEventTypes, handleSearch])

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return null

    return (
        <>
            <motion.div
                layout
                animate={{
                    overflow: filtersOpen ? 'hidden' : 'visible',
                    height: filtersOpen ? 'auto' : 'auto'
                }}
                transition={{ duration: 0.2 }}
                className={`
                    sticky top-0 z-30 pt-3 pb-2 mb-6 mx-auto backdrop-blur-md
                    w-full flex flex-col items-start justify-between gap-3
                    bg-gradient-to-b
                    from-white via-white to-white/90
                    dark:from-gray-950 dark:via-gray-950 dark:to-gray-950/50
                    `}
            >

                <motion.div
                    transition={{ duration: 0.2 }}
                    className={`max-w-screen-lg mx-auto w-full flex flex-col items-start justify-between`}
                >

                    <div className="flex items-center justify-start w-full gap-3 px-3 md:px-6">
                        <div className="flex relative w-full max-w-[300px]">
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
                                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => {
                                    setSearch('')
                                    handleSearch(search, selectedEventTypes)
                                }} disabled={!search}>
                                    <XIcon className="w-5 h-5 text-gray-500 z-20 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-75 disabled:opacity-50 disabled:cursor-not-allowed" />
                                </button>
                            )}
                        </div>

                        <div>
                            <button
                                type="button"
                                className={`rounded-full flex items-center justify-center h-10 w-10 bg-white dark:bg-gray-950
                            border border-gray-200 dark:border-gray-800
                          outline-none ring-0 transition-all duration-75 shadow-sm md:hover:shadow-md`}
                                onClick={() => setFiltersOpen(!filtersOpen)}
                            >
                                {filtersOpen ? (
                                    <ArrowUp strokeWidth={2.5} className="w-4 h-4 text-gray-500 dark:text-gray-400 z-20" />
                                ) : (
                                    <SlidersIcon strokeWidth={2.5} className="w-4 h-4 text-gray-500 dark:text-gray-400 z-20" />
                                )}
                            </button>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {filtersOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 20, height: 0, overflow: 'hidden' }}
                                animate={{ opacity: 1, y: 0, height: 'auto', overflow: 'hidden' }}
                                exit={{ opacity: 0, y: -20, height: 0, overflow: 'hidden' }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className='flex flex-col gap-2 w-full '
                            >
                                <div className="w-full pt-3">
                                    <div className="flex justify-between items-center gap-2 mb-2 px-3 md:px-6">
                                        <p className='text-gray-500 dark:text-gray-400 text-sm font-medium tracking-tight'>
                                            Filtrar
                                        </p>

                                        {selectedEventTypes.length > 0 && (
                                            <button type="button" className="text-gray-500 dark:text-gray-400 text-sm font-medium tracking-tight" onClick={() => {
                                                setSelectedEventTypes([])
                                                setSearch('')
                                            }}>
                                                Limpiar filtros {selectedEventTypes.length > 0 && `(${selectedEventTypes.length})`}
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 w-full h-max overflow-auto scrollbar-hide pb-1 px-3 md:px-6">
                                        {eventTypes.map((type, index) => {
                                            const isSelected = selectedEventTypes.includes(type.value)

                                            return (
                                                <motion.button
                                                    type='button'
                                                    key={`${type.value}-${index}`}
                                                    className={`min-w-max flex items-center gap-2 pr-2 pl-1 py-1 rounded-xl border border-gray-200 dark:border-gray-700 ${isSelected ? "" : "opacity-50"}`}
                                                    onClick={() => handleCategoryToggle(type.value)}
                                                    whileTap={{ scale: 0.95 }}
                                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                                >
                                                    <div className="rounded-xl p-1 h-5 w-5 bg-gray-100 dark:bg-gray-800 flex items-center justify-center transition-all duration-75">
                                                        {isSelected && (
                                                            <div>
                                                                <CheckIcon className="w-5 h-5 text-gray-950 dark:text-white" />
                                                            </div>
                                                        )}

                                                    </div>
                                                    <p className={`text-xs font-medium ${isSelected ? "text-gray-950 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>
                                                        {type.name}
                                                    </p>
                                                </motion.button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>

            <motion.div className="max-w-max mx-auto w-full h-max grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 pb-20">
                {isAdmin && (
                    <button
                        type="button"
                        className="bg-gray-50 dark:bg-gray-900 rounded-3xl overflow-hidden hover:shadow-lg  dark:shadow-gray-950/50 flex items-center justify-center gap-2 h-full flex-col min-w-[300px] mx-auto w-full min-h-[300px] cursor-pointer select-none border-2 border-dashed border-gray-300 dark:border-gray-700 transition-all duration-75"
                        onClick={() => router.push('/eventos/nuevo')}
                    >
                        <PlusIcon className="w-4 h-4 text-gray-500 dark:text-white" />
                        <p className="text-sm font-medium tracking-tight text-gray-600 dark:text-gray-400">Nuevo evento</p>
                    </button>
                )}

                {events && events?.length > 0 ? (
                    <AnimatePresence mode="wait">
                        {events?.map((event, index) => (
                            <motion.div
                                key={event._id}
                                animate={{ opacity: 1, y: 0 }}
                                initial={{ opacity: 0, y: 20 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2, delay: 0.1 * index }}
                                viewport={{ once: true }}
                                className='relative'
                            >
                                <EventCard event={event} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-center col-span-full"
                    >
                        <p className="text-gray-500 text-sm">
                            No se encontraron eventos
                        </p>
                    </motion.div>
                )}
            </motion.div>
        </>
    )
}

export default EventsListSearch