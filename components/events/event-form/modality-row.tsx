import { EditIcon, TrashIcon } from 'lucide-react'
import { Category, Modality } from '@/lib/utils'

interface ModalityRowProps {
    modality: Modality;
    handleRemoveModality: (index: number) => void;
    handleRemoveCategory: (categoryIndex: number, modalityIndex: number) => void;
    handleEditCategory: (categoryIndex: number, modalityIndex: number) => void;
    index: number;
}

export function ModalityRow({ modality, handleRemoveModality, handleRemoveCategory, handleEditCategory, index }: ModalityRowProps) {
    return (
        <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
            <td className='!px-4 lg:!px-6 align-top'>
                <div className="chip_filter max-w-max">
                    <p className='text-sm font-medium text-gray-700 dark:text-gray-300 px-3 py-1'>
                        {modality.name}
                    </p>
                </div>
            </td>

            <td className='!px-3 align-top'>
                <div className="flex flex-col gap-2 w-full">
                    {modality?.categories && modality.categories.length > 0 ? (
                        modality.categories.map((category: Category, categoryIndex: number) => (
                            <div
                                key={`${category.name}-${categoryIndex}`}
                                className='flex items-center justify-between gap-3 w-full rounded-lg'
                            >
                                <div className='flex gap-2 items-center justify-start w-max'>
                                    <div className='chip_filter w-max'>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 px-2 py-1">
                                            {category?.name}
                                        </p>
                                    </div>

                                    {category?.matchsWith && (
                                        <div className='flex items-center gap-1'>
                                            <span className='text-xs text-gray-400 dark:text-gray-500'>→</span>
                                            <p className='font-mono text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-cgray rounded'>
                                                {category?.matchsWith}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        className='w-6 h-6 flex items-center justify-center transition-all duration-75 gap-2 rounded-full bg-gray-600 hover:bg-gray-700'
                                        onClick={() => handleEditCategory(categoryIndex, index)}
                                    >
                                        <EditIcon className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                                    </button>
                                    <button
                                        type="button"
                                        className='w-6 h-6 flex items-center justify-center transition-all duration-75 gap-2 rounded-full bg-red-600 hover:bg-red-700'
                                        onClick={() => handleRemoveCategory(categoryIndex, index)}
                                    >
                                        <TrashIcon className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-4 text-gray-400 dark:text-gray-500 text-sm">
                            Sin categorías
                        </div>
                    )}
                </div>
            </td>

            <td className='!px-4 lg:!px-6 align-top'>
                <div className="flex justify-center">
                    <button
                        type="button"
                        className="rounded-full bg-red-600 flex items-center justify-center p-2 hover:bg-red-700 transition-all duration-75 w-max"
                        onClick={() => handleRemoveModality(index)}
                    >
                        <TrashIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
                    </button>
                </div>
            </td>
        </tr>
    )
}