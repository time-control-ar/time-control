import { RaceCheckProps } from '@/lib/schemas/racecheck.schema'
import { ArrowLeftIcon, ArrowRightIcon, SearchIcon, XIcon } from 'lucide-react'
import { useState, useMemo } from 'react'

const RaceCheckTable = ({ results }: { results: RaceCheckProps | undefined }) => {
    const [searchTerm, setSearchTerm] = useState('')
    // const [selectedCategory, setSelectedCategory] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)

    // Obtener categorías únicas
    // const uniqueCategories = useMemo(() => {
    //     if (!results?.participants) return []
    //     const categories = results.participants.map(p => p.category)
    //     return Array.from(new Set(categories)).sort()
    // }, [results?.participants])

    // Filtrar participantes basado en el término de búsqueda y categoría
    const filteredParticipants = useMemo(() => {
        if (!results?.participants) return []

        return results.participants.filter(participant => {
            const matchesSearch =
                participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                participant.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                participant.time.toLowerCase().includes(searchTerm.toLowerCase()) ||
                participant.position.toString().includes(searchTerm) ||
                participant.dorsal.toString().includes(searchTerm)

            // const matchesCategory = selectedCategory === '' || participant.category === selectedCategory

            return matchesSearch
        })
    }, [results?.participants, searchTerm])

    // Calcular paginación
    const totalPages = Math.ceil(filteredParticipants.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentParticipants = filteredParticipants.slice(startIndex, endIndex)

    // Función para cambiar de página
    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    // Función para seleccionar categoría
    // const handleSelectCategory = (category: string) => {
    //     setSelectedCategory(category)
    //     setCurrentPage(1)
    // }

    // // Función para limpiar filtros
    // const handleClearFilters = () => {
    //     setSearchTerm('')
    //     setSelectedCategory('')
    //     setCurrentPage(1)
    // }

    if (!results?.participants || results?.participants.length === 0 || !results?.categories) {
        return (
            <div className="w-full flex flex-col items-center justify-center h-64">
                <div className="text-gray-500 dark:text-gray-400 text-sm font-medium tracking-tight">
                    No hay datos disponibles
                </div>
            </div>
        )
    }

    return (
        <div className='w-full flex flex-col h-full overflow-auto'>
            {/* Header con búsqueda */}
            <div className="flex flex-col gap-4 px-4 pb-3">
                <div key='search-open' className="flex relative w-full max-w-md">
                    <SearchIcon className="w-5 h-5 text-gray-500 z-20 absolute left-3 top-1/2 -translate-y-1/2" />
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
                        <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setSearchTerm('')} disabled={!searchTerm}>
                            <XIcon className="w-5 h-5 text-gray-500 z-20 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-75 disabled:opacity-50 disabled:cursor-not-allowed" />
                        </button>
                    )}
                </div>

                <div className="pagination-info">
                    {/* Mostrando {startIndex + 1} a {Math.min(endIndex, filteredParticipants.length)} de {filteredParticipants.length} resultados */}
                    Mostrando {startIndex + 1} a {Math.min(endIndex, filteredParticipants.length)} de {filteredParticipants.length} resultados
                </div>
            </div>

            {/* Tabla moderna */}
            <div className="modern-table flex flex-col overflow-auto h-full">
                <table>
                    <thead className="modern-table-header">
                        <tr>
                            <th className="w-10">Posición</th>
                            <th className="w-max">Dorsal</th>
                            <th className="w-max">Nombre</th>
                            <th className="w-max">Categoría</th>
                            <th className="w-max">Tiempo</th>
                        </tr>
                    </thead>
                    <tbody className="modern-table-body">
                        {currentParticipants.map((participant, index) => (
                            <tr key={index} className="group">
                                <td>
                                    <div className="flex items-center">
                                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${participant.position <= 3
                                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                            }`}>
                                            {participant.position}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center w-max px-3 relative">
                                        <div className="w-full px-4 absolute top-1 left-0">
                                            <div className="justify-between flex">
                                                <div className="w-1 h-1 rounded-full bg-gray-700 dark:bg-gray-300"></div>
                                                <div className="w-1 h-1 rounded-full bg-gray-700 dark:bg-gray-300"></div>
                                            </div>
                                        </div>
                                        <span className="flex items-center justify-center px-5 h-8 rounded-b-xl text-sm font-semibold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                            {participant.dorsal}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <div className="font-medium text-gray-900 dark:text-gray-100 text-sm w-max">
                                        {participant.name}
                                    </div>
                                </td>
                                <td>
                                    <div className="w-max">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                            {participant.category}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <div className="font-mono text-sm text-gray-700 dark:text-gray-300">
                                        {participant.time}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
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
        </div>
    )
}

export default RaceCheckTable