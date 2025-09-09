'use client'

import { SearchIcon, XIcon, CheckIcon, BrushCleaning, ArrowUp, SlidersIcon } from 'lucide-react'
import { Category, Gender, Modality, Runner } from '@/lib/schemas/event.schema'
import RunnerTableRow from './runner-table-row'
import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const orderByOptions = [
    {
        name: 'Tiempo',
        value: 'time'
    },
    {
        name: 'Categoría',
        value: 'cat'
    },
]
const ResultsTable = ({ runners, modalities, genders, eventId, title }: { runners: Runner[], modalities: Modality[], genders: Gender[], eventId?: string, title?: string }) => {
    const [search, setSearch] = useState('')
    const [orderBy, setOrderBy] = useState<{ name: string, value: string } | null>(orderByOptions[0])
    const [selectedModality, setSelectedModality] = useState<Modality | null>(null)
    const [selectedCategories, setSelectedCategories] = useState<Category[]>([])
    const [selectedGender, setSelectedGender] = useState<Gender | null>(null)
    const [filtersOpen, setFiltersOpen] = useState(false)
    const handleClearSearch = () => {
        setSearch('')
    }

    const handleClearAllFilters = () => {
        setSelectedModality(null)
        setSelectedCategories([])
        setSelectedGender(null)
        setSearch('')
        setOrderBy(null)
    }

    const filteredRunners = useMemo(() => {
        let filtered = [...runners]

        if (search.trim()) {
            const searchLower = search.toLowerCase().trim()
            filtered = filtered.filter((runner) =>
                runner.racecheck.nombre.toLowerCase().includes(searchLower) ||
                runner.racecheck.dorsal.toLowerCase().includes(searchLower) ||
                runner.racecheck.categoria.toLowerCase().includes(searchLower)
            )
        }

        if (selectedModality) {
            filtered = filtered.filter((runner) => runner.modality.name.toLowerCase().includes(selectedModality.name.toLowerCase()))
        }

        if (selectedCategories.length > 0) {
            filtered = filtered.filter((runner) => selectedCategories.some((c) => runner.category.name.toLowerCase().startsWith(c.name.toLowerCase())))
        }

        if (selectedGender) {
            filtered = filtered.filter((runner) => runner.gender.name.toLowerCase().includes(selectedGender.name.toLowerCase()))
        }

        // Apply sorting based on orderBy
        if (orderBy) {
            filtered.sort((a, b) => {
                switch (orderBy.value) {
                    case 'time':
                        return a.posGeneral - b.posGeneral
                    case 'sex':
                        return a.posSexo - b.posSexo
                    case 'cat':
                        return a.posCat - b.posCat
                    default:
                        return 0
                }
            })
        }

        return filtered
    }, [runners, search, selectedModality, selectedCategories, selectedGender, orderBy])

    const filtersCount = useMemo(() => {
        return [selectedModality, selectedCategories.length > 0, selectedGender, orderBy].filter(Boolean).length
    }, [selectedModality, selectedCategories, selectedGender, orderBy])

    useEffect(() => {
        setSelectedCategories([])
    }, [selectedModality])

    return (
        <div className={`w-full h-auto flex flex-col`}>
            <div className="flex flex-col border-b border-gray-200 dark:border-cgray">
                {title && (
                    <div className="px-4 pt-6">
                        <h1 className="text-base font-semibold tracking-tight text-gray-800 dark:text-white">
                            {title}
                        </h1>
                    </div>
                )}
                <div className="flex justify-between gap-3 px-3h-full overflow-auto px-3 pt-2">
                    <div className="relative flex items-center w-full max-w-[350px]">
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
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                                onClick={handleClearSearch}
                                disabled={!search}
                            >
                                <XIcon className="w-5 h-5 text-gray-500 z-20 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-75 disabled:opacity-50 disabled:cursor-not-allowed" />
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">

                        <div className='relative overflow-visible' onClick={() => handleClearAllFilters()}>
                            {filtersCount > 0 && (
                                <div className='absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full z-20 flex items-center justify-center cursor-pointer'>
                                    <p className='text-white font-mono text-[11px] font-medium tracking-tight justify-center'>
                                        {filtersCount}
                                    </p>
                                </div>
                            )}

                            <button
                                type="button"
                                disabled={filtersCount === 0}
                                className={`custom_button disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                <BrushCleaning className="w-5 h-5 text-gray-700 dark:text-gray-300 z-20 transition-all duration-75 disabled:cursor-not-allowed" />
                            </button>
                        </div>
                        <div>
                            <button
                                type="button"
                                className={`custom_button`}
                                onClick={() => setFiltersOpen(!filtersOpen)}
                            >
                                {filtersOpen ? (
                                    <ArrowUp strokeWidth={2.5} className="w-4 h-4 text-gray-700 dark:text-gray-300 z-20" />
                                ) : (
                                    <SlidersIcon strokeWidth={2.5} className="w-4 h-4 text-gray-700 dark:text-gray-300 z-20" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="px-4 p-2 flex items-center justify-between">
                    <div className="text-xs text-black dark:text-white">
                        {filteredRunners.length > 0 ? (
                            `${filteredRunners.length} de ${runners.length} corredores`
                        ) : (
                            `${runners.length} corredores`
                        )}
                    </div>
                </div>
                <AnimatePresence mode="wait">
                    {filtersOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, height: 0, overflow: 'hidden' }}
                            animate={{ opacity: 1, y: 0, height: 'auto', overflow: 'hidden' }}
                            exit={{ opacity: 0, y: -20, height: 0, overflow: 'hidden', transition: { duration: 0.1 } }}
                            className='flex flex-col gap-2 w-full'
                        >
                            <div className="flex flex-col gap-2 pb-3">
                                <div className="flex flex-col gap-2 w-full overflow-auto scrollbar-hide">
                                    <p className='text-xs text-gray-500 dark:text-gray-400 px-3 pt-2 capitalize'>
                                        modalidad
                                    </p>
                                    {modalities?.length > 0 && (
                                        <div className="flex items-center gap-2 w-full h-max overflow-auto scrollbar-hide pb-1 px-3">
                                            {modalities.map((modality, index) => {
                                                const isSelected = selectedModality?.name === modality.name

                                                return (
                                                    <motion.button
                                                        type='button'
                                                        key={`${modality.name}-${index}`}
                                                        className={`chip_filter max-w-max ${isSelected ? "" : "opacity-50"}`}
                                                        onClick={() => setSelectedModality(isSelected ? null : modality)}
                                                        whileTap={{ scale: 0.95 }}
                                                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                                    >
                                                        <div className="rounded-xl p-1 h-5 w-5 bg-gray-100 dark:bg-cgray flex items-center justify-center transition-all duration-75">
                                                            {isSelected && (
                                                                <div>
                                                                    <CheckIcon className="w-4 h-4 text-green-500 dark:text-green-500" />
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
                                    )}
                                    {selectedModality && (
                                        <>
                                            <p className='text-xs text-gray-500 dark:text-gray-400 px-3 pt-2 capitalize'>
                                                categoría
                                            </p>
                                            <div className="flex items-center gap-2 w-full h-max overflow-auto scrollbar-hide pb-1 px-3">
                                                {selectedModality?.categories?.map((category, index) => {
                                                    const isSelected = selectedCategories.some((c) => c.name === category.name)

                                                    return (
                                                        <motion.button
                                                            type='button'
                                                            key={`${category.name}-${index}`}
                                                            className={`chip_filter max-w-max ${isSelected ? "" : "opacity-50"}`}
                                                            onClick={() => setSelectedCategories(isSelected ? selectedCategories.filter((c) => c.name !== category.name) : [...selectedCategories, category])}
                                                            whileTap={{ scale: 0.95 }}
                                                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                                        >
                                                            <div className="rounded-xl p-1 h-5 w-5 bg-gray-100 dark:bg-cgray flex items-center justify-center transition-all duration-75">
                                                                {isSelected && (
                                                                    <div>
                                                                        <CheckIcon className="w-4 h-4 text-green-500 dark:text-green-500" />
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
                                        </>
                                    )}
                                    <p className='text-xs text-gray-500 dark:text-gray-400 px-3 pt-2 capitalize'>
                                        Ordenar por
                                    </p>
                                    <div className="flex items-center gap-2 w-full h-max overflow-auto scrollbar-hide pb-1 px-3">
                                        {orderByOptions.map((i, index) => {
                                            const isSelected = orderBy?.value === i.value
                                            const orderByLabel = i.name
                                            return (
                                                <motion.button
                                                    type='button'
                                                    key={`${i.value}-${index}`}
                                                    className={`chip_filter max-w-max ${isSelected ? "" : "opacity-50"}`}
                                                    onClick={() => setOrderBy(isSelected ? null : i)}
                                                    whileTap={{ scale: 0.95 }}
                                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                                >
                                                    <div className="rounded-xl p-1 h-5 w-5 bg-gray-100 dark:bg-cgray flex items-center justify-center transition-all duration-75">
                                                        {isSelected && (
                                                            <div>
                                                                <CheckIcon className="w-4 h-4 text-green-500 dark:text-green-500" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className={`text-xs font-medium ${isSelected ? "text-gray-950 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>
                                                        {orderByLabel}
                                                    </p>
                                                </motion.button>
                                            )
                                        })}
                                    </div>
                                    <p className='text-xs text-gray-500 dark:text-gray-400 px-3 pt-2 capitalize'>
                                        sexo
                                    </p>
                                    {genders?.length > 0 && (
                                        <div className="flex items-center gap-2 w-full h-max overflow-auto scrollbar-hide pb-1 px-3">
                                            {genders.map((gender, index) => {
                                                const isSelected = selectedGender?.name === gender.name

                                                return (
                                                    <motion.button
                                                        type='button'
                                                        key={`${gender.name}-${index}`}
                                                        className={`chip_filter max-w-max ${isSelected ? "" : "opacity-50"}`}
                                                        onClick={() => setSelectedGender(isSelected ? null : gender)}
                                                        whileTap={{ scale: 0.95 }}
                                                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                                    >
                                                        <div className="rounded-xl p-1 h-5 w-5 bg-gray-100 dark:bg-cgray flex items-center justify-center transition-all duration-75">
                                                            {isSelected && (
                                                                <div>
                                                                    <CheckIcon className="w-4 h-4 text-green-500 dark:text-green-500" />
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
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="w-full h-full overflow-y-auto">
                <table className="w-full">
                    <thead className="modern-table-header">
                        <tr>
                            <th className='!pl-2 !pr-0 !w-[50px]'>
                                <div className="!px-2 !w-max">
                                    <p className="min-w-max font-medium text-gray-700 dark:text-gray-300 text-center w-max">
                                        P. General
                                    </p>
                                </div>
                            </th>
                            <th className='!px-0 !w-[50px]'>
                                <div className="!px-2 !w-max">
                                    <p className="min-w-max font-medium text-gray-700 dark:text-gray-300 text-center w-max">
                                        P. Categoría
                                    </p>
                                </div>
                            </th>
                            <th className='!px-0 !w-[50px]'>
                                <div className="!px-2 !w-max">
                                    <p className="min-w-max font-medium text-gray-700 dark:text-gray-300 text-center w-max">
                                        P. Sexo
                                    </p>
                                </div>
                            </th>
                            <th className="!w-[40px] !p-1 align-middle font-medium text-gray-700 dark:text-gray-300 text-center">
                                Dorsal
                            </th>
                            <th className='!px-0'>
                                <div className="!px-2 !w-max">
                                    Corredor
                                </div>
                            </th>
                            {/* <th className="w-max px-3 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                            Modalidad
                        </th> */}
                            <th className="px-3 py-3 align-end">
                                <p className="text-end font-medium">
                                    Tiempo
                                </p>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="modern-table-body">
                        {filteredRunners.length > 0 ? (
                            filteredRunners.map((runner, index) => (
                                <RunnerTableRow
                                    key={`${runner.racecheck.dorsal}-${index}`}
                                    eventId={eventId}
                                    runner={runner}
                                    index={index}
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                                    {filteredRunners.length > 0 ? 'No hay corredores que coincidan con los filtros' : 'Sin resultados'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div >
        </div >
    )
}

export default ResultsTable