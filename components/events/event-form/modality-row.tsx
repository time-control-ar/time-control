import { TrashIcon } from 'lucide-react'
import { Category, Modality } from '@/lib/utils'

interface ModalityRowProps {
    modality: Modality;
    handleRemoveModality: (index: number) => void;
    handleRemoveCategory: (categoryIndex: number, modalityIndex: number) => void;
    index: number;
}

export function ModalityRow({ modality, handleRemoveModality, handleRemoveCategory, index }: ModalityRowProps) {
    return (
        <tr key={index}>
            <td className='!pl-4 lg:!pl-6 h-full flex flex-col items-start'>
                <div className="chip_filter max-w-max">
                    <p className='text-sm text-gray-500 dark:text-gray-400 px-2'>
                        {modality.name}
                    </p>
                </div>
            </td>

            <td className='!px-4 flex flex-col gap-2 w-full'>
                <div className="flex flex-col gap-3">
                    {modality?.categories?.map((category: Category, categoryIndex: number) => {
                        return (
                            <div
                                key={`${category.name}-${categoryIndex}`}
                                className='flex items-center justify-between gap-3 w-full px-2 '
                            >
                                <div className='flex gap-2 items-center justify-start w-max'>
                                    <div className='chip_filter w-max'>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 px-2">
                                            {category?.name}
                                        </p>
                                    </div>

                                    {category?.matchsWith && (
                                        <p className='font-mono text-sm text-gray-500 dark:text-gray-400 px-2'>
                                            {category?.matchsWith}
                                        </p>
                                    )}
                                </div>


                                <button
                                    type="button"
                                    className='w-6 h-6 flex items-center justify-center transition-all duration-75 gap-2 rounded-full bg-red-600 hover:bg-red-700'
                                    onClick={() => handleRemoveCategory(categoryIndex, index)}
                                >
                                    <TrashIcon className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                                </button>
                            </div>
                        )
                    })}
                </div>
            </td>

            <td className=''>
                <button
                    type="button"
                    className="rounded-full bg-red-600 flex items-center justify-center p-2 hover:bg-red-700 transition-all duration-75 w-max"
                    onClick={() => handleRemoveModality(index)}
                >
                    <TrashIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
                </button>
            </td>
        </tr>
    )
}