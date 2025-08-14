import { CheckIcon, PlusIcon, XIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Category, Modality } from '@/lib/schemas/event.schema';

interface CategoryFormProps {
    selectedModality: Modality | null;
    setSelectedModality: (modality: Modality | null) => void;
    modalities: Modality[];
    handleAddCategory: (category: Category, modality: Modality) => void;
    editingCategory?: {
        category: Category;
        categoryIndex: number;
        modalityIndex: number;
    } | null;
    onCancelEdit?: () => void;
}

export function CategoryForm({ selectedModality, setSelectedModality, modalities, handleAddCategory, editingCategory, onCancelEdit }: CategoryFormProps) {
    const [newCategory, setNewCategory] = useState<Category>({ name: '', matchsWith: '' })

    // Actualizar el formulario cuando se está editando una categoría
    useEffect(() => {
        if (editingCategory) {
            setNewCategory(editingCategory.category);
        } else {
            setNewCategory({ name: '', matchsWith: '' });
        }
    }, [editingCategory]);

    // Auto-seleccionar la primera modalidad si no hay ninguna seleccionada
    useEffect(() => {
        if (modalities.length > 0 && !selectedModality) {
            setSelectedModality(modalities[0]);
        }
    }, [modalities, selectedModality, setSelectedModality]);

    const handleSubmit = () => {
        if (!selectedModality) return
        if (newCategory.name.trim()) {
            handleAddCategory(newCategory, selectedModality)
            setNewCategory({ name: '', matchsWith: '' })
        }
    }

    return (
        <div className="flex flex-col gap-2 w-full">

            <div className="flex gap-2 w-full">
                <div className="flex flex-col gap-2 w-full items-center">
                    <div className="flex flex-col md:flex-row gap-2 w-full">
                        <div className="flex flex-col gap-1 w-full">
                            <p className="label-input">
                                Nombre
                            </p>
                            <input
                                type="text"
                                className="input w-full"
                                placeholder="Categoría"
                                value={newCategory.name}
                                onChange={(e) => setNewCategory({ name: e.target.value, matchsWith: newCategory.matchsWith })}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        handleSubmit()
                                    }
                                }}
                            />
                        </div>
                        <div className="flex flex-col gap-1 w-full">
                            <p className="label-input">
                                Modalidad
                            </p>

                            <select
                                className="input font-mono !text-base !py-2 placeholder:text-gray-500 dark:placeholder:text-gray-400 placeholder:text-xs"
                                value={selectedModality?.name ?? ''}
                                onChange={(e) => setSelectedModality(modalities.find((m) => m.name === e.target.value) ?? null)}
                                disabled={editingCategory !== null}
                            >
                                <option value="" disabled>
                                    Selecciona una modalidad
                                </option>

                                {modalities.map((modality) => (
                                    <option key={modality.name} value={modality.name}>
                                        {modality.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 w-full">
                        <p className="label-input">
                            Valor en racecheck
                        </p>

                        <input
                            type="text"
                            className="input font-mono !text-sm w-full"
                            placeholder="racecheck: ELITE, SUB 23, MASTER"
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
                </div>

                <div className='flex gap-2 items-end justify-center'>
                    <button
                        type="button"
                        className="rounded-full bg-gray-800 dark:bg-gray-300 flex items-center justify-center p-2 transition-all duration-75 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleSubmit}
                        disabled={!newCategory.name.trim() || !selectedModality}
                    >
                        {editingCategory ? (
                            <CheckIcon className="w-4 h-4 text-white dark:text-gray-950" strokeWidth={2.5} />
                        ) : (
                            <PlusIcon className="w-4 h-4 text-white dark:text-gray-950" strokeWidth={2.5} />
                        )}
                    </button>

                    {editingCategory && onCancelEdit && (
                        <button
                            type="button"
                            className="rounded-full bg-red-600 flex items-center justify-center p-2 transition-all duration-75"
                            onClick={onCancelEdit}
                        >
                            <XIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}