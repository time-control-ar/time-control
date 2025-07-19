'use client'

import { RaceCheckProps } from '@/lib/schemas/racecheck.schema'
import { ArrowLeftIcon, ArrowRightIcon, SearchIcon, TicketIcon, XIcon, CheckIcon, SlidersIcon } from 'lucide-react'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const RaceCheckTable = ({ results }: { results: RaceCheckProps | undefined }) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(100)
    const [isFilterOpen, setIsFilterOpen] = useState(false)

    // Obtener categorías únicas
    const uniqueCategories = useMemo(() => {
        if (!results?.participants) return []
        const categories = results.participants.map(p => p.category)
        return Array.from(new Set(categories)).sort()
    }, [results?.participants])

    // Filtrar participantes basado en el término de búsqueda y categorías seleccionadas
    const filteredParticipants = useMemo(() => {
        if (!results?.participants) return []

        return results.participants.filter(participant => {
            const matchesSearch =
                participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                participant.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                participant.time.toLowerCase().includes(searchTerm.toLowerCase()) ||
                participant.position.toString().includes(searchTerm) ||
                participant.dorsal.toString().includes(searchTerm)

            const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(participant.category)

            return matchesSearch && matchesCategory
        })
    }, [results?.participants, searchTerm, selectedCategories])

    // Calcular paginación
    const totalPages = Math.ceil(filteredParticipants.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentParticipants = filteredParticipants.slice(startIndex, endIndex)

    // Función para cambiar de página
    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    // Función para manejar la selección de categorías
    const handleCategoryToggle = (category: string) => {
        setSelectedCategories(prev => {
            if (prev.includes(category)) {
                return prev.filter(c => c !== category)
            } else {
                return [...prev, category]
            }
        })
        setCurrentPage(1)
    }

    if (!results?.participants || results?.participants.length === 0 || !results?.categories) {
        return (
            <div className="w-full flex flex-col items-center justify-center h-20">
                <div className="text-gray-500 dark:text-gray-400 text-sm font-medium tracking-tight">
                    No hay datos disponibles
                </div>
            </div>
        )
    }

    return (
        <div className='w-full flex flex-col h-full pb-4'>
            {/* Header con búsqueda y filtros */}
            <motion.div
                transition={{ duration: 0.2 }}
                className={`
                    pt-3 pb-2 max-w-screen-lg mx-auto
                    w-full flex flex-col items-start justify-between px-2
                    `}
            >

                <div className="flex items-center justify-between w-full gap-6">
                    <div className="flex relative">
                        <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-white z-20" />
                        <input
                            type="text"
                            placeholder="Buscar"
                            className="rounded-search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    e.currentTarget.blur()
                                }
                            }}
                        />

                        {searchTerm && (
                            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setSearchTerm('')} disabled={!searchTerm}>
                                <XIcon className="w-5 h-5 text-gray-500 z-20 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-75 disabled:opacity-50 disabled:cursor-not-allowed" />
                            </button>
                        )}
                    </div>

                    <button
                        type="button"
                        className={`h-10 rounded-full w-max p-3
                          relative select-none flex items-center gap-2
                          bg-gradient-to-t from-white to-white dark:from-gray-800 dark:to-gray-900
                          border ${isFilterOpen ? 'border-gray-300 dark:border-gray-700' : ' border-gray-200 dark:border-gray-800'}
                          outline-none ring-0 transition-all duration-75 shadow-sm md:hover:shadow-md
                          p-3`}
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                    >
                        {isFilterOpen ? (
                            <XIcon strokeWidth={2.5} className="w-4 h-4 text-gray-500 dark:text-white z-20" />
                        ) : (
                            <SlidersIcon strokeWidth={2.5} className="w-4 h-4 text-gray-500 dark:text-white z-20" />
                        )}
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {isFilterOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -20, height: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className='flex flex-col gap-2  w-full'
                        >
                            <div className="w-full py-4">
                                <div className="flex justify-between items-center gap-2">
                                    <p className='text-gray-500 dark:text-gray-400 text-sm font-medium tracking-tight mb-2'>
                                        Filtrar categorías {selectedCategories.length > 0 && `(${selectedCategories.length})`}
                                    </p>
                                    {selectedCategories.length > 0 && (
                                        <button type="button" className="text-gray-500 dark:text-gray-400 text-sm font-medium tracking-tight mb-2" onClick={() => {
                                            setSelectedCategories([])
                                            setSearchTerm('')
                                            setCurrentPage(1)
                                        }}>
                                            Limpiar filtros
                                        </button>
                                    )}
                                </div>


                                <div className="flex items-center gap-2 w-full h-max overflow-auto">
                                    {uniqueCategories.map((category) => {
                                        const isSelected = selectedCategories.includes(category)
                                        return (
                                            <motion.button
                                                type='button'
                                                key={category}
                                                className={`rounded-btn min-w-max !bg-transparent ${isSelected ? "" : "opacity-50"}`}
                                                onClick={() => handleCategoryToggle(category)}
                                                whileTap={{ scale: 0.95 }}
                                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                            >
                                                <div className="rounded-xl p-1 h-6 w-6 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                    <AnimatePresence mode="wait">
                                                        {isSelected && (
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                exit={{ scale: 0 }}
                                                            >
                                                                <CheckIcon className="w-5 h-5 text-gray-950 dark:text-white" />
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                                <p className={`text-base font-medium tracking-tight ${isSelected ? "text-gray-950 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>
                                                    {category}
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
            < div className="modern-table flex flex-col overflow-auto h-full" >
                <table>
                    <thead className="modern-table-header">
                        <tr>
                            <th className="w-max !px-4">Posición</th>
                            <th className="w-max">Dorsal</th>
                            <th className="w-max">Nombre</th>
                            {/* <th className="w-max">Categoría</th> */}
                            <th className="w-max">Tiempo</th>
                        </tr>
                    </thead>
                    <tbody className="modern-table-body">
                        {currentParticipants.map((participant, index) => (
                            <tr key={index} className="group">
                                <td className="!max-w-max">
                                    <div className="flex items-center justify-center max-w-16">
                                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300`}>
                                            {participant.position}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-300 border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden h-12 w-16 relative">
                                        <div className="w-full h-3 absolute top-0 left-0 bg-red-400 dark:bg-slate-800">
                                            <div className="justify-between flex items-center py-1 px-2">
                                                <div className="w-1 h-1 rounded-full bg-white dark:bg-gray-300"></div>
                                                <div className="w-1 h-1 rounded-full bg-white dark:bg-gray-300"></div>
                                            </div>
                                        </div>

                                        <span className="font-semibold text-lg mt-3 text-gray-700 dark:text-gray-800">
                                            {participant.dorsal}
                                        </span>

                                    </div>
                                </td>
                                <td>
                                    <div className="flex flex-col items-start justify-center gap-1 max-w-max">
                                        <p className="font-medium text-gray-900 dark:text-white text-base w-max capitalize">
                                            {participant.name.toLowerCase()}
                                        </p>
                                        <div className="w-max">
                                            <span className="inline-flex items-center px-2.5 py-1.5 rounded-xl text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 tracking-tight">
                                                {participant.category}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2 w-max p-1 rounded-2xl border border-gray-200 dark:border-gray-800 pl-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                                        <div className="font-mono text-lg text-gray-700 dark:text-gray-300">
                                            {participant.time?.split('.')[0]}
                                            <span className="text-gray-500 dark:text-gray-600 text-xs">
                                                .{participant.time?.split('.')[1]}
                                            </span>
                                        </div>
                                        <button className="w-max flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-75 ml-auto">
                                            <TicketIcon className="w-5 h-5" />
                                            {/* <span className="text-xs">Ticket</span> */}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div >

            {totalPages > 1 && (
                <div className="pagination-container">

                    <div className="pagination-controls">
                        <button
                            type="button"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="pagination-button"
                        >
                            <ArrowLeftIcon className="w-4 h-4" />
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
                            <ArrowRightIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div >
    )
}

export default RaceCheckTable