'use client'

import { Category, Gender, Modality, Runners } from '@/lib/utils'
import { ArrowLeftIcon, ArrowRightIcon, SearchIcon, TicketIcon, CheckIcon, SlidersIcon, ArrowUp, XIcon, BrushCleaning } from 'lucide-react'
import { useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import DorsalComponent from '../ui/dorsal-component'
import ChipFilterOption from '../ui/chip-filter-option'


interface RaceCheckProps {
    modalities: Modality[]
    genders: Gender[]
    runners: Runners[]
    previewMode?: {
        eventId?: string
    }
}

const RaceCheckTable = ({ modalities, genders, runners, previewMode }: RaceCheckProps) => {
    const router = useRouter()

    const categories = modalities.flatMap(modality => modality.categories ?? [])
    const [currentPage, setCurrentPage] = useState(1)
    const [filtersOpen, setFiltersOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [selectedModalities, setSelectedModalities] = useState<Modality[]>([])
    const [selectedCategories, setSelectedCategories] = useState<Category[]>([])
    const [selectedGenders, setSelectedGenders] = useState<string[]>([])
    const [itemsPerPage] = useState(100)

    const filteredParticipants: Runners[] = useMemo(() => {
        if (!runners || runners.length === 0) return []
        const filteredBySearch = runners.filter(participant => {
            if (!search) return true
            return participant.nombre.toLowerCase().includes(search.toLowerCase()) ||
                participant.tiempo.toLowerCase().includes(search.toLowerCase()) ||
                participant.posicion.toString().includes(search) ||
                participant.dorsal.toString().includes(search)
        })
        const filteredByCategories = filteredBySearch.filter(participant => {
            if (!selectedCategories.length) return true
            return selectedCategories.length > 0 ? selectedCategories.some(category => participant.categoria.toLowerCase().includes(category.matchsWith?.toLowerCase() ?? '')) : true
        })
        const filteredByModalities = filteredByCategories.filter(participant => {
            if (!selectedModalities.length) return true
            return selectedModalities.length > 0 ? selectedModalities.some(modality => participant.modalidad === modality.name) : true
        })
        const filteredByGenders = filteredByModalities.filter(participant => {
            if (!selectedGenders.length) return true
            return selectedGenders.length > 0 ? selectedGenders.some(gender => participant.sexo.toLowerCase().includes(gender.toLowerCase())) : true
        })
        return filteredByGenders
    }, [search, selectedCategories, selectedModalities, selectedGenders, runners])

    const filtersCount = useMemo(() => {
        return selectedCategories.length + selectedModalities.length + selectedGenders.length
    }, [selectedCategories, selectedModalities, selectedGenders])

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
    const handleGenderToggle = (gender: Gender) => {
        setSelectedGenders(prev => {
            if (prev.includes(gender.name)) {
                return prev.filter(g => g !== gender.name)
            } else {
                return [...prev, gender.name]
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

    if (!runners || runners.length === 0) {
        return (
            <div className="w-full flex flex-col items-center justify-center mb-36 mt-12">
                <div className="text-gray-500 dark:text-gray-400 text-sm font-medium tracking-tight">
                    No hay datos disponibles
                </div>
            </div>
        )
    }

    return (
        <div className='w-full flex flex-col gap-3 h-full max-h-[700px] overflow-auto px-3 md:px-6'>
            <motion.div
                transition={{ duration: 0.1 }}
                className={`max-w-screen-lg mx-auto w-full flex flex-col items-start justify-between`}
            >
                <div className="flex items-center justify-start w-full gap-3 px-4 md:px-6">
                    <div className="flex relative w-full max-w-[300px]">
                        <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-700 dark:text-gray-300 z-20" />
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
                                handleClearFilters()
                            }} disabled={!search}>
                                <XIcon className="w-5 h-5 text-gray-500 z-20 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-75 disabled:opacity-50 disabled:cursor-not-allowed" />
                            </button>
                        )}
                    </div>

                    <div className='flex items-center justify-center gap-2'>
                        <div>
                            <button
                                type="button"
                                className={`rounded-full flex items-center justify-center h-10 w-10`}
                                onClick={() => setFiltersOpen(!filtersOpen)}
                            >
                                {filtersOpen ? (
                                    <ArrowUp strokeWidth={2.5} className="w-5 h-5 text-gray-700 dark:text-gray-300 z-20" />
                                ) : (
                                    <SlidersIcon strokeWidth={2.5} className="w-5 h-5 text-gray-700 dark:text-gray-300 z-20" />
                                )}
                            </button>
                        </div>

                        <div className='relative overflow-visible' onClick={() => handleClearFilters()}>
                            {filtersCount > 0 && (
                                <div className='absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full z-20 flex items-center justify-center'>
                                    <p className='text-white font-mono text-[11px] font-medium tracking-tight justify-center'>
                                        {filtersCount}
                                    </p>
                                </div>
                            )}

                            <button
                                type="button"
                                disabled={filtersCount === 0}
                                className={`rounded-full flex items-center justify-center h-10 w-10 disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                <BrushCleaning className="w-5 h-5 text-gray-700 dark:text-gray-300 z-20 transition-all duration-75 disabled:cursor-not-allowed" />
                            </button>
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {filtersOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, height: 0, overflow: 'hidden' }}
                            animate={{ opacity: 1, y: 0, height: 'auto', overflow: 'hidden' }}
                            exit={{ opacity: 0, y: -20, height: 0, overflow: 'hidden', transition: { duration: 0.1 } }}
                            transition={{ type: "spring", stiffness: 300, damping: 30, duration: 0.2 }}
                            className='flex flex-col gap-2 w-full'
                        >

                            <div className="flex flex-col gap-2 pt-3">
                                <div className="flex items-center gap-2 w-full h-max overflow-auto scrollbar-hide pb-1 px-3 md:px-6">
                                    {modalities.map((type, index) => {
                                        const isSelected = selectedModalities.includes(type)

                                        return (
                                            <ChipFilterOption
                                                key={`${type.name}-${index}`}
                                                type={{ value: type.name, name: type.name }}
                                                isSelected={isSelected}
                                                handleCategoryToggle={() => handleModalityToggle(type)}
                                                index={index}
                                            />
                                        )
                                    })}
                                </div>
                                <div className="flex items-center gap-2 w-full h-max overflow-auto scrollbar-hide pb-1 px-3 md:px-6">
                                    {categories.map((category, index) => {
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
                                                <div className="rounded-xl p-1 h-5 w-5 bg-gray-100 dark:bg-cgray flex items-center justify-center transition-all duration-75">
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
                                <div className="flex items-center gap-2 w-full h-max overflow-auto scrollbar-hide pb-1 px-3 md:px-6">
                                    {genders.map((gender, index) => {
                                        const isSelected = selectedGenders.includes(gender.name)

                                        return (
                                            <motion.button
                                                type='button'
                                                key={`${gender.name}-${index}`}
                                                className={`chip_filter ${isSelected ? "" : "opacity-50"}`}
                                                onClick={() => handleGenderToggle(gender)}
                                                whileTap={{ scale: 0.95 }}
                                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                            >
                                                <div className="rounded-xl p-1 h-5 w-5 bg-gray-100 dark:bg-cgray flex items-center justify-center transition-all duration-75">
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
                            </div>

                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <div className="pb-4 w-full h-full flex flex-col overflow-auto">
                <div className="modern-table">
                    <table>
                        <thead className="modern-table-header">
                            <tr>
                                <th className="w-max !text-center">
                                    Pos.
                                    General
                                </th>
                                <th className="w-max !text-center">
                                    Pos.
                                    Categoría
                                </th>
                                <th className="w-max">Dorsal</th>
                                <th className="w-max">Nombre</th>
                                <th className="w-max">Tiempo</th>
                            </tr>
                        </thead>
                        <tbody className="modern-table-body">
                            {currentParticipants.map((participant, index) => (
                                <tr key={index} className="group">
                                    <td>
                                        <div className="flex flex-col items-center justify-center w-[100px] gap-1">
                                            <p className="text-xl font-medium tracking-tight text-gray-800 dark:text-gray-200 font-mono-italic">
                                                {index + 1}
                                            </p>
                                            <p className="text-xs font-medium tracking-tight text-gray-700 dark:text-gray-300 font-mono-italic">
                                                {participant.ritmo.split('m')[0]}
                                                <span className="opacity-50">
                                                    m/km
                                                </span>
                                            </p>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex flex-col items-center justify-center w-[100px] gap-1">
                                            <p className="text-xl font-medium tracking-tight text-gray-800 dark:text-gray-200 font-mono-italic">
                                                {participant.posCat}
                                            </p>
                                        </div>
                                    </td>

                                    <td>
                                        <DorsalComponent dorsal={Number(participant.dorsal)} />
                                    </td>
                                    <td className="!min-w-[200px] md:!max-w-max">
                                        <div className="flex flex-col gap-1 px-3">

                                            <p className="font-medium text-gray-900 dark:text-white text-base capitalize leading-tight">
                                                {participant.nombre.toLowerCase()}
                                            </p>
                                            <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                                {participant.categoria}
                                            </p>

                                        </div>
                                    </td>

                                    <td>
                                        <div className="flex items-center gap-1 w-max rounded-2xl border-2 border-gray-100 dark:border-gray-800 pl-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 h-[38px]">
                                            <div className="font-mono text-base text-gray-700 dark:text-gray-300 pr-2">
                                                {participant.tiempo?.split('.')[0]}
                                                <span className="text-gray-500 dark:text-gray-600 text-xs font-mono">
                                                    .{participant.tiempo?.split('.')[1]}
                                                </span>
                                            </div>

                                            {!previewMode?.eventId && participant.dorsal && participant.dorsal !== 'N/A' && participant.chip && (
                                                <button
                                                    type='button'
                                                    onClick={() => {
                                                        router.push(`${process.env.NEXT_PUBLIC_QR_URL}/?eventId=${previewMode?.eventId}&dorsal=${participant.dorsal}`)
                                                    }}
                                                    className="w-max flex items-center gap-0.5 px-3 py-1.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-75 ml-auto">
                                                    <TicketIcon className="w-6 h-6" />
                                                </button>
                                            )}
                                        </div>

                                        {/* <div className='mt-1 ml-3'>
                                            <p className="text-xs font-medium tracking-tight text-gray-700 dark:text-gray-300 font-mono-italic">
                                                {participant.pace.split('m')[0]}
                                                <span className="opacity-50">
                                                    m/km
                                                </span>
                                            </p>
                                        </div> */}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {currentParticipants.length > 0 && (
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


                </div>
            )}
        </div>
    )
}

export default RaceCheckTable