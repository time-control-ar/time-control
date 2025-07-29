import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { Category, Modality } from '@/lib/utils'

interface CategoryFormProps {
    selectedModality: Modality | null;
    setSelectedModality: (modality: Modality | null) => void;
    modalities: Modality[];
    handleAddCategory: (category: Category, modality: Modality) => void;
}

export function CategoryForm({ selectedModality, setSelectedModality, modalities, handleAddCategory }: CategoryFormProps) {
    const [newCategory, setNewCategory] = useState<Category>({ name: '', matchsWith: '' })

    const handleSubmit = () => {
        if (!selectedModality) return
        if (newCategory.name.trim()) {
            handleAddCategory(newCategory, selectedModality)
            setNewCategory({ name: '', matchsWith: '' })
        }
    }

    if (modalities.length === 0) return null

    return (
        <div className="flex gap-2 w-full items-end max-w-sm">
            <div className="flex flex-col gap-2 w-full">
                <select
                    className="input !py-0 placeholder:text-gray-500 dark:placeholder:text-gray-400 placeholder:text-xs !text-sm"
                    value={selectedModality?.name ?? ''}
                    disabled={modalities.length === 0}
                    onChange={(e) => setSelectedModality(modalities.find((m) => m.name === e.target.value) ?? modalities[0])}
                >
                    <option value="" disabled>Selecciona una modalidad</option>
                    {modalities.map((modality) => (
                        <option key={modality.name} value={modality.name}>
                            {modality.name}
                        </option>
                    ))}
                </select>
                <input
                    type="text"
                    className="input"
                    placeholder="Nombre"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ name: e.target.value, matchsWith: newCategory.matchsWith })}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault()
                            handleSubmit()
                        }
                    }}
                />

                <input
                    type="text"
                    className="input"
                    placeholder="Valor en racecheck"
                    value={newCategory.matchsWith}
                    onChange={(e) => setNewCategory({ name: newCategory.name, matchsWith: e.target.value })}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault()
                            handleSubmit()
                        }
                    }}
                />
            </div>

            <div>
                <button
                    type="button"
                    className="rounded-full bg-gray-800 dark:bg-gray-300 flex items-center justify-center p-2 transition-all duration-75"
                    onClick={handleSubmit}
                    disabled={!newCategory.name.trim()}
                >
                    <PlusIcon className="w-4 h-4 text-white dark:text-gray-950" strokeWidth={2.5} />
                </button>
            </div>
        </div>
    )
}