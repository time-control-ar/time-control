'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { ArrowUp, BrushCleaning, CheckIcon, PlusIcon, SearchIcon, SlidersIcon, XIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { EventCard } from './event-card'
import { EventResponse } from '@/lib/schemas/event.schema'
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
    const [filtersOpen, setFiltersOpen] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    const [events, setEvents] = useState(eventsData)
    const [search, setSearch] = useState('')
    const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([])
    const [selectedLocations, setSelectedLocations] = useState<string[]>([])

    const handleSearch = useCallback((searchTerm: string, selectedTypes: string[], selectedLocations: string[]) => {
        const serializedSearch = serializeText(searchTerm)
        const filteredEvents = eventsData.filter(e => {
            const serializedName = serializeText(e.name)
            const serializedDescription = serializeText(e.description)

            const matchesSearch = serializedName.includes(serializedSearch) || serializedDescription.includes(serializedSearch)
            const matchesCategory = selectedTypes.length === 0 || selectedTypes.includes(e.type)
            const matchesLocation = selectedLocations.length === 0 || selectedLocations.includes(e.locationName)
            return matchesSearch && matchesCategory && matchesLocation
        })
        setEvents(filteredEvents)
    }, [eventsData])
    const filtersCount = useMemo(() => {
        return selectedEventTypes.length + selectedLocations.length
    }, [selectedEventTypes, selectedLocations])

    const uniqueLocations = Array.from(new Set(eventsData?.map(event => event.locationName)))

    const handleLocationToggle = (location: string) => {

        setSelectedLocations(prev => {
            const newSelected = prev.includes(location) ? prev.filter(l => l !== location) : [...prev, location]
            handleSearch(search, selectedEventTypes, newSelected)
            return newSelected
        })
    }

    const handleCategoryToggle = (category: string) => {
        setSelectedEventTypes(prev => {
            const newSelected = prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
            handleSearch(search, newSelected, selectedLocations)
            return newSelected
        })
    }

    const handleClearFilters = () => {
        setSelectedEventTypes([])
        setSelectedLocations([])
        handleSearch('', [], [])
    }

    useEffect(() => {
        handleSearch(search, selectedEventTypes, selectedLocations)
    }, [search, selectedEventTypes, handleSearch, selectedLocations])

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
                    dark:from-gray-950 dark:via-gray-950/90 dark:to-gray-950/90
                    `}
            >

                <motion.div
                    transition={{ duration: 0.1 }}
                    className={`max-w-screen-lg mx-auto w-full flex flex-col items-start justify-between`}
                >

                    <div className="flex items-center justify-start w-full gap-6 px-3 md:px-6">
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
                                    handleSearch(search, selectedEventTypes, selectedLocations)
                                }} disabled={!search}>
                                    <XIcon className="w-5 h-5 text-gray-500 z-20 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-75 disabled:opacity-50 disabled:cursor-not-allowed" />
                                </button>
                            )}
                        </div>

                        <div className='flex items-center justify-center gap-2'>
                            <div>
                                <button
                                    type="button"
                                    className={`rounded-full flex items-center justify-center h-10 w-10 bg-white dark:bg-gray-950
                            border-2 border-gray-200 dark:border-gray-800
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

                            <div className='relative overflow-visible' onClick={() => handleClearFilters()}>
                                {filtersCount > 0 && (
                                    <div className='absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full z-20'>
                                        <p className='text-white text-[10px] font-medium tracking-tight flex items-center justify-center'>
                                            {filtersCount}
                                        </p>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    disabled={filtersCount === 0}
                                    className={`rounded-full flex items-center justify-center h-10 w-10 bg-white dark:bg-gray-950
                                        border-2 border-gray-200 dark:border-gray-800 disabled:opacity-50 disabled:cursor-not-allowed
                                        outline-none ring-0 transition-all duration-75 shadow-sm md:hover:shadow-md`}

                                >
                                    <BrushCleaning className="w-5 h-5 text-gray-500 z-20 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-75 disabled:opacity-50 disabled:cursor-not-allowed" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {filtersOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 20, height: 0, overflow: 'hidden' }}
                                animate={{ opacity: 1, y: 0, height: 'auto', overflow: 'hidden' }}
                                exit={{ opacity: 0, y: -20, height: 0, overflow: 'hidden' }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className='flex flex-col gap-2 w-full'
                            >

                                <div className="flex flex-col gap-2 pt-3">
                                    <div className="flex items-center gap-2 w-full h-max overflow-auto scrollbar-hide pb-1 px-3 md:px-6">
                                        {eventTypes.map((type, index) => {
                                            const isSelected = selectedEventTypes.includes(type.value)

                                            return (
                                                <motion.button
                                                    type='button'
                                                    key={`${type.value}-${index}`}
                                                    className={`chip_filter ${isSelected ? "" : "opacity-50"}`}
                                                    onClick={() => handleCategoryToggle(type.value)}
                                                    whileTap={{ scale: 0.95 }}
                                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                                >
                                                    <div className="rounded-xl p-1 h-5 w-5 bg-gray-100 dark:bg-gray-800 flex items-center justify-center transition-all duration-75">
                                                        {isSelected && (
                                                            <div>
                                                                <CheckIcon className="w-5 h-5 text-green-500 dark:text-green-500" />
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
                                    <div className="flex items-center gap-2 w-full h-max overflow-auto scrollbar-hide pb-1 px-3 md:px-6">
                                        {uniqueLocations?.map((location, index) => {
                                            const isSelected = selectedLocations.includes(location)

                                            return (
                                                <motion.button
                                                    type='button'
                                                    key={`${location}-${index}`}
                                                    className={`chip_filter ${isSelected ? "" : "opacity-50"}`}
                                                    onClick={() => handleLocationToggle(location)}
                                                    whileTap={{ scale: 0.95 }}
                                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                                >
                                                    <div className="rounded-xl p-1 h-5 w-5 bg-gray-100 dark:bg-gray-800 flex items-center justify-center transition-all duration-75">
                                                        {isSelected && (
                                                            <div>
                                                                <CheckIcon className="w-5 h-5 text-green-500 dark:text-green-500" />
                                                            </div>
                                                        )}

                                                    </div>
                                                    <p className={`text-xs font-medium ${isSelected ? "text-gray-950 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>
                                                        {location}
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

            <motion.div className="max-w-max mx-auto w-full h-max grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 pb-20 px-3">

                {isAdmin && (
                    <div className="flex items-center justify-center w-full h-[200px] relative rounded-3xl z-10 rounded-bl-3xl rounded-br-lg border-2 border-dashed border-gray-300 dark:border-gray-700 gap-2 cursor-pointer md:hover:shadow-xl dark:hover:border-gray-600 transition-all duration-100"
                        onClick={() => router.push('/eventos/nuevo')}
                    >
                        <PlusIcon className="w-4 h-4 text-gray-500 dark:text-white" />
                        <p className="text-sm font-medium tracking-tight text-gray-600 dark:text-gray-400">Nuevo evento</p>
                    </div>
                )}

                {events && events?.length > 0 ? (
                    <>
                        {events?.map((event, index) => (
                            <motion.div
                                key={event._id}
                                animate={{ opacity: 1, y: 0 }}
                                initial={{ opacity: 0, y: 20 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2, delay: 0.1 * index }}
                                viewport={{ once: true }}
                                className='relative w-full flex items-center justify-center'
                            >
                                <EventCard event={event} previewMode={false} />
                            </motion.div>
                        ))}
                    </>
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