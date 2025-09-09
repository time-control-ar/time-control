import { RacecheckRunner } from '@/lib/schemas/racecheck.schema'
import { Runner } from '@/lib/schemas/event.schema'
import { CheckIcon, SearchIcon, XIcon } from 'lucide-react'
import { useEffect, useState } from 'react'



const RaceCheckTable = ({ racecheckErrors, runners }: { racecheckErrors: RacecheckRunner[], runners: Runner[] }) => {
    const [search, setSearch] = useState('')
    const [showOnlyErrors, setShowOnlyErrors] = useState(false)
    const [filteredRows, setFilteredRows] = useState<RacecheckRunner[]>([])

    const handleSearch = (search: string) => {
        let filteredRows: RacecheckRunner[] = []
        if (!showOnlyErrors) {
            filteredRows = [...racecheckErrors, ...runners.map((r) => r.racecheck)]
        } else {
            filteredRows = racecheckErrors
        }
        setSearch(search)
        setFilteredRows(filteredRows.filter((row) => row.nombre.toLowerCase().includes(search.toLowerCase())))
    }

    useEffect(() => {
        handleSearch(search)
    }, [showOnlyErrors, racecheckErrors, runners])

    return (
        <>




            <div className="flex flex-col modern-table w-full">
                <div className="flex flex-col gap-3 p-4 border-b border-gray-200 dark:border-cgray">
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
                                handleSearch(search)
                            }} disabled={!search}>
                                <XIcon className="w-5 h-5 text-gray-500 z-20 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-75 disabled:opacity-50 disabled:cursor-not-allowed" />
                            </button>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            className={`chip_filter ${!showOnlyErrors ? 'opacity-50' : ''}`}
                            onClick={() => {
                                setShowOnlyErrors(!showOnlyErrors)
                            }}
                        >
                            <div className={`rounded-xl w-5 h-5 dark:bg-cgray flex items-center justify-center transition-all duration-75`}>
                                {showOnlyErrors && (
                                    <CheckIcon className="w-4 h-4 text-green-500 dark:text-green-500" />
                                )}
                            </div>
                            <p className="text-sm font-medium font-mono tracking-tight text-gray-700 dark:text-gray-200">
                                Solo errores
                            </p>
                        </button>
                    </div>
                </div>
                <div className="w-full max-h-[65vh] overflow-y-auto">
                    <table className="">
                        <thead className="modern-table-header">
                            <tr>
                                <th className="text-left font-mono text-sm text-gray-500 dark:text-gray-100 py-3">Modalidad</th>
                                <th className="text-left font-mono text-sm text-gray-500 dark:text-gray-100 py-3">Dorsal</th>
                                <th className="text-left font-mono text-sm text-gray-500 dark:text-gray-100 py-3">Nombre</th>
                                <th className="text-left font-mono text-sm text-gray-500 dark:text-gray-100 py-3 hidden md:table-cell">Categoría</th>
                                <th className="text-center font-mono text-sm text-gray-500 dark:text-gray-100 py-3 hidden md:table-cell">Sexo</th>
                                <th className="text-left font-mono text-sm text-gray-500 dark:text-gray-100 py-3">Tiempo</th>
                            </tr>
                        </thead>
                        <tbody className="modern-table-body">
                            {filteredRows.map((runner, index) => (
                                <tr key={`${runner.dorsal}-${index}`} className={`${showOnlyErrors ? '!text-red-500 dark:!text-red-100' : ''}`}>
                                    <td className="text-center font-mono text-sm py-3">{runner.modalidad}</td>
                                    <td className="text-center font-mono text-sm py-3">{runner.dorsal}</td>
                                    <td className="text-start font-mono text-sm py-3">{runner.nombre}</td>
                                    <td className="text-start font-mono text-sm py-3 hidden md:table-cell">{runner.categoria}</td>
                                    <td className="text-center font-mono text-sm py-3 hidden md:table-cell">{runner.sexo}</td>
                                    <td className="text-center font-mono text-sm py-3">

                                        <div className="flex flex-col gap-1">
                                            <p className="text-center font-mono text-sm">{runner.tiempo}</p>
                                            <p className="text-xs opacity-50">{runner.ritmo}</p>
                                        </div>

                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}

export default RaceCheckTable