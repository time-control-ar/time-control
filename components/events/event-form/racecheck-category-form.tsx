import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { Category, Modality } from '@/lib/schemas/event.schema'
interface RacecheckCategoryFormProps {
    category: string;
    modalities: Modality[];
    onAddCategory: (category: Category, modality: Modality) => void;
}

export function RacecheckCategoryForm({ category, modalities, onAddCategory }: RacecheckCategoryFormProps) {
    const [selectedModality, setSelectedModality] = useState<Modality | null>(modalities[0] || null)
    const [customName, setCustomName] = useState<string>(category)

    const handleAddCategory = () => {
        if (!selectedModality) return

        const newCategory: Category = {
            name: customName.trim() || category,
            matchsWith: category
        }

        onAddCategory(newCategory, selectedModality)
    }

    if (modalities.length === 0) return null

    return (
        <div className="flex gap-2 w-full items-end max-w-md">
            <div className="flex flex-col gap-2 w-full">
                <select
                    className="input !py-2 placeholder:text-gray-500 dark:placeholder:text-gray-400 placeholder:text-xs !text-sm"
                    value={selectedModality?.name ?? ''}
                    onChange={(e) => setSelectedModality(modalities.find((m) => m.name === e.target.value) ?? modalities[0])}
                >
                    {modalities.map((modality) => (
                        <option key={modality.name} value={modality.name}>
                            {modality.name}
                        </option>
                    ))}
                </select>

                <div className="flex gap-2 ">
                    <input
                        type="text"
                        className="input flex-1"
                        placeholder="Nombre de categoría"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                handleAddCategory()
                            }
                        }}
                    />

                    <input
                        type="text"
                        className="input flex-1"
                        placeholder="Valor racecheck"
                        value={category}
                        disabled
                    />
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    type="button"
                    className="rounded-full bg-gray-800 dark:bg-gray-300 flex items-center justify-center p-2 transition-all duration-75 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleAddCategory}
                    disabled={!customName.trim() || !selectedModality}
                >
                    <PlusIcon className="w-4 h-4 text-white dark:text-gray-950" strokeWidth={2.5} />
                </button>
            </div>
        </div>
    )
} 