'use client'

import { SearchIcon, XIcon, CheckIcon, BrushCleaning, ArrowUp, SlidersIcon } from 'lucide-react'
import { Gender, Modality, Runner } from '@/lib/schemas/event.schema'
import RunnerTableRow from './runner-table-row'
import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const ResultsTable = ({ runners, modalities, genders, eventId, title }: { runners: Runner[], modalities: Modality[], genders: Gender[], eventId?: string, title?: string }) => {
    const [search, setSearch] = useState('')
    const [selectedModality, setSelectedModality] = useState<Modality | null>(null)
    const [selectedGender, setSelectedGender] = useState<Gender | null>(null)
    const [filtersOpen, setFiltersOpen] = useState(false)
    const handleClearSearch = () => {
        setSearch('')
    }

    const handleClearAllFilters = () => {
        setSelectedModality(null)
        setSelectedGender(null)
        setSearch('')
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

        if (selectedGender) {
            filtered = filtered.filter((runner) => runner.gender.name.toLowerCase().includes(selectedGender.name.toLowerCase()))
        }

        return filtered
    }, [runners, search, selectedModality, selectedGender])

    const filtersCount = useMemo(() => {
        return [selectedModality, selectedGender].filter(Boolean).length
    }, [selectedModality, selectedGender])

    return (<div className={`modern-table w-full custom_border flex flex-col rounded-xl h-full `}>
        <div className="flex flex-col border-b border-gray-200 dark:border-cgray">
            {title && (
                <div className="px-4 pt-4">
                    <h1 className="text-xl font-semibold tracking-tight text-gray-800 dark:text-white">
                        {title}
                    </h1>
                </div>
            )}
            <div className="flex justify-between gap-3 px-3h-full overflow-auto p-3">
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
                </div>
            </div>
            <div className="px-4 pb-2">
                {filteredRunners.length > 0 ? (
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                        Mostrando {filteredRunners.length} de {runners.length}
                    </div>
                ) : (
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                        Mostrando {runners.length} corredores
                    </div>
                )}
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
                            <div className="flex flex-col gap-2 mb-3 w-full overflow-auto scrollbar-hide">
                                {/* Filtros por modalidad */}
                                {modalities.length > 0 && (
                                    <div className="flex items-center gap-2 w-full h-max overflow-auto scrollbar-hide pb-1 px-3 md:px-6">
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
                                {/* Filtros por género */}
                                {genders.length > 0 && (
                                    <div className="flex items-center gap-2 w-full h-max overflow-auto scrollbar-hide pb-1 px-3 md:px-6">
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
                        <th className="!w-min align-middle font-medium text-gray-700 dark:text-gray-300 !pr-1">
                            <p className='text-center'>
                                Pos.Gral.
                            </p>
                        </th>
                        <th className="p-3 text-center font-medium text-gray-700 dark:text-gray-300">
                            <p className='text-center'>
                                Pos.Cat.
                            </p>
                        </th>
                        <th className="!w-[100px] align-middle font-medium text-gray-700 dark:text-gray-300">
                            Dorsal
                        </th>
                        <th className="w-[190px] px-3 py-3 text-left font-medium text-gray-700 dark:text-gray-300">
                            Corredor
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
                                {filteredRunners.length > 0 ? 'No hay corredores que coincidan con los filtros' : 'No hay corredores cargados'}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
    )
}

export default ResultsTable