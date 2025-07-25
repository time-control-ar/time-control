'use client'

import { Category, Modality, parseRacechecks, Runner } from '@/lib/utils'
import { ArrowLeftIcon, ArrowRightIcon, SearchIcon, TicketIcon, CheckIcon, SlidersIcon, ArrowUp, XIcon, BrushCleaning } from 'lucide-react'
import { useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { RaceCheckProps } from '@/lib/schemas/racecheck.schema'


const RaceCheckTable = ({ categories, modalities, racecheck, eventId, previewMode = false, genders }: RaceCheckProps & { eventId: string, previewMode?: boolean, genders: { name: string, matchsWith: string }[] }) => {
    const router = useRouter()
    const racecheckRunners: Runner[] = useMemo(() => {
        return parseRacechecks(racecheck || '', categories, modalities)?.runners || []
    }, [racecheck, categories, modalities])

    const [currentPage, setCurrentPage] = useState(1)
    const [isFilterOpen, setFiltersOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [selectedModalities, setSelectedModalities] = useState<Modality[]>([])
    const [selectedCategories, setSelectedCategories] = useState<Category[]>([])
    const [selectedGenders, setSelectedGenders] = useState<string[]>([])
    const [itemsPerPage] = useState(100)

    // Filtrar participantes basado en el término de búsqueda y categorías seleccionadas
    const filteredParticipants = useMemo(() => {
        if (!racecheckRunners) return []

        const filteredBySearch = racecheckRunners.filter(participant => {
            if (!search) return true
            return participant.name.toLowerCase().includes(search.toLowerCase()) ||
                participant.time.toLowerCase().includes(search.toLowerCase()) ||
                participant.position.toString().includes(search) ||
                participant.dorsal.toString().includes(search)
        })
        const filteredByCategories = filteredBySearch.filter(participant => {
            if (!selectedCategories.length) return true
            return selectedCategories.length > 0 ? selectedCategories.some(category => participant.category.toLowerCase().includes(category.matchsWith.toLowerCase())) : true
        })
        const filteredByModalities = filteredByCategories.filter(participant => {
            if (!selectedModalities.length) return true
            return selectedModalities.length > 0 ? selectedModalities.some(modality => participant.modality === modality.name) : true
        })
        const filteredByGenders = filteredByModalities.filter(participant => {
            if (!selectedGenders.length) return true
            return selectedGenders.length > 0 ? selectedGenders.some(gender => participant.sex.toLowerCase().includes(gender.toLowerCase())) : true
        })
        return filteredByGenders
    }, [racecheckRunners, search, selectedCategories, selectedModalities, selectedGenders])

    const filtersCount = useMemo(() => {
        return selectedCategories.length + selectedModalities.length + selectedGenders.length
    }, [selectedCategories, selectedModalities, selectedGenders])

    // Calcular paginación
    const totalPages = Math.ceil(filteredParticipants.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentParticipants = filteredParticipants.slice(startIndex, endIndex)

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }
    const handleModalityToggle = (modality: Modality) => {
        setSelectedModalities(prev => {
            if (prev.includes(modality)) {
                return prev.filter(c => c !== modality)
            } else {
                return [...prev, modality]
            }
        })
        setCurrentPage(1)
    }
    const handleCategoryToggle = (category: Category) => {
        setSelectedCategories(prev => {
            if (prev.includes(category)) {
                return prev.filter(c => c !== category)
            } else {
                return [...prev, category]
            }
        })
        setCurrentPage(1)
    }
    const handleGenderToggle = (gender: string) => {
        setSelectedGenders(prev => {
            if (prev.includes(gender)) {
                return prev.filter(g => g !== gender)
            } else {
                return [...prev, gender]
            }
        })
        setCurrentPage(1)
    }
    const handleClearFilters = () => {
        setSelectedCategories([])
        setSelectedModalities([])
        setSelectedGenders([])
        setSearch('')
    }

    if (!racecheckRunners) {
        return (
            <div className="w-full flex flex-col items-center justify-center mb-36 mt-12">
                <div className="text-gray-500 dark:text-gray-400 text-sm font-medium tracking-tight">
                    No hay datos disponibles
                </div>
            </div>
        )
    }

    return (
        <div className='w-full flex flex-col gap-3 h-full overflow-y-auto pt-1'>
            {/* Header con búsqueda y filtros */}
            <motion.div
                transition={{ duration: 0.2 }}
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
                                onClick={() => setFiltersOpen(!isFilterOpen)}
                            >
                                {isFilterOpen ? (
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
                    {isFilterOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, height: 0, overflow: 'hidden' }}
                            animate={{ opacity: 1, y: 0, height: 'auto', overflow: 'hidden' }}
                            exit={{ opacity: 0, y: -20, height: 0, overflow: 'hidden' }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className='flex flex-col gap-2 w-full '
                        >
                            <div className="w-full pt-3">
                                <div className="flex items-center gap-2 w-full h-max overflow-auto scrollbar-hide pb-1 px-3 md:px-6">
                                    {modalities?.map((modality, index) => {
                                        const isSelected = selectedModalities.includes(modality)

                                        return (
                                            <motion.button
                                                type='button'
                                                key={`${modality.name}-${index}`}
                                                className={`chip_filter ${isSelected ? "" : "opacity-50"}`}
                                                onClick={() => handleModalityToggle(modality)}
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
                                                    {modality.name}
                                                </p>
                                            </motion.button>
                                        )
                                    })}
                                </div>

                                <div className="flex items-center gap-2 w-full h-max overflow-auto scrollbar-hide pb-1 px-3 md:px-6">
                                    {genders?.map((gender, index) => {
                                        const isSelected = selectedGenders.includes(gender.matchsWith)

                                        return (
                                            <motion.button
                                                type='button'
                                                key={`${gender.matchsWith}-${index}`}
                                                className={`chip_filter ${isSelected ? "" : "opacity-50"}`}
                                                onClick={() => handleGenderToggle(gender.matchsWith)}
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
                                                    {gender.name}
                                                </p>
                                            </motion.button>
                                        )
                                    })}
                                </div>

                                <div className="flex items-center gap-2 w-full h-max overflow-auto scrollbar-hide pb-1 px-3 md:px-6">
                                    {categories?.map((category, index) => {
                                        const isSelected = selectedCategories.includes(category)

                                        return (
                                            <motion.button
                                                type='button'
                                                key={`${category.name}-${index}`}
                                                className={`chip_filter ${isSelected ? "" : "opacity-50"}`}
                                                onClick={() => handleCategoryToggle(category)}
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
                                                    {category.name}
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

            {/* Tabla moderna */}
            <div className="pb-3 px-2 flex flex-col gap-2 overflow-y-auto">
                <div className="modern-table flex flex-col overflow-auto h-full">
                    <table className="text-sm">
                        <thead className="modern-table-header">
                            <tr>
                                <th className="w-max !px-3">Posición</th>
                                <th className="w-max">Dorsal</th>
                                <th className="w-max">Nombre</th>
                                {/* <th className="w-max">Modalidad</th> */}
                                <th className="w-max">Tiempo</th>
                            </tr>
                        </thead>
                        <tbody className="modern-table-body">
                            {currentParticipants.map((participant, index) => (
                                <tr key={index} className="group">
                                    <td>
                                        <div className="flex flex-col items-center justify-center w-[100px] gap-1">
                                            <p className="text-xl font-medium tracking-tight text-gray-800 dark:text-gray-200 font-mono italic">
                                                {participant.positionCategory}
                                            </p>
                                            <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                                {participant.category}
                                            </p>
                                        </div>
                                    </td>

                                    <td >
                                        <div className="flex flex-col justify-between items-center rounded-md overflow-hidden h-[45px] w-[60px] shadow">
                                            <div className="w-full h-3 bg-red-400 dark:bg-slate-800 justify-between flex items-center py-1.5 px-3">
                                                <div className="w-1 h-1 rounded-full bg-white dark:bg-gray-100"></div>
                                                <div className="w-1 h-1 rounded-full bg-white dark:bg-gray-100"></div>
                                            </div>

                                            <div className="bg-white dark:bg-gray-100 w-full h-full flex items-center justify-center">
                                                <p className="font-bold text-xl text-gray-700 dark:text-gray-800 text-center">
                                                    {participant.dorsal}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="!min-w-[150px] md:!max-w-max">
                                        <div className="flex flex-col gap-1">

                                            <p className="font-medium text-gray-900 dark:text-white text-base capitalize leading-tight">
                                                {participant.name.toLowerCase()}
                                            </p>

                                        </div>
                                    </td>

                                    <td>
                                        <div className="flex items-center gap-1 w-max rounded-2xl border-2 border-gray-100 dark:border-gray-800 pl-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 h-[38px]">
                                            <div className="font-mono text-base text-gray-700 dark:text-gray-300 pr-2">
                                                {participant.time?.split('.')[0]}
                                                <span className="text-gray-500 dark:text-gray-600 text-xs font-mono">
                                                    .{participant.time?.split('.')[1]}
                                                </span>
                                            </div>

                                            {!previewMode && (
                                                <button
                                                    type='button'
                                                    onClick={() => {
                                                        router.push(`${process.env.NEXT_PUBLIC_QR_URL}/?eventId=${eventId}&dorsal=${participant.dorsal}`)
                                                    }}
                                                    className="w-max flex items-center gap-0.5 px-3 py-1.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-75 ml-auto">
                                                    <TicketIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>

                                        <div className='mt-1 ml-3'>
                                            <p className="text-xs font-medium tracking-tight text-gray-700 dark:text-gray-300 font-mono italic">
                                                Ritmo: {participant.pace.split('m')[0]}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div >
                <div className="pagination-container">
                    <div className="pagination-controls">
                        <button
                            type="button"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="pagination-button"
                        >
                            <ArrowLeftIcon className="w-3 h-3" />
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                type="button"
                                onClick={() => handlePageChange(page)}
                                className={`pagination-button ${currentPage === page ? 'active' : ''}`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            type="button"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="pagination-button"
                        >
                            <ArrowRightIcon className="w-3 h-3" />
                        </button>
                    </div>

                    <p className='text-gray-500 dark:text-gray-400 text-sm font-medium tracking-tight px-3'>
                        {filteredParticipants.length} / {racecheckRunners.length} resultados
                    </p>
                </div>
            </div>

        </div >
    )
}

export default RaceCheckTable