import { EditIcon, TrashIcon } from 'lucide-react'
import { Category } from '@/lib/schemas/event.schema'
import { Modality } from '@/lib/schemas/event.schema'

interface CategoryRowProps {
    category: Category;
    modality: Modality;
    categoryIndex: number;
    modalityIndex: number;
    handleRemoveCategory: (categoryIndex: number, modalityIndex: number) => void;
    handleEditCategory: (categoryIndex: number, modalityIndex: number) => void;
}

export function CategoryRow({
    category,
    modality,
    categoryIndex,
    modalityIndex,
    handleRemoveCategory,
    handleEditCategory
}: CategoryRowProps) {
    return (
        <tr key={`${category.name}-${categoryIndex}`} className="">
            <td className='!px-5 align-top !max-w-max'>
                <div className='flex flex-col gap-2 items-center justify-start !max-w-max'>
                    <div className="chip_filter w-max">
                        <p className='text-sm text-gray-500 dark:text-gray-400 px-1'>
                            {category?.name}
                        </p>
                    </div>

                    {category?.matchsWith && (
                        <div className='flex items-center gap-1'>
                            <p className='font-mono text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-cgray rounded'>
                                {category?.matchsWith}
                            </p>
                        </div>
                    )}
                </div>
            </td>
            <td className='!px-5 align-top !max-w-max'>
                <p className="font-mono text-base font-medium">
                    {modality.name}
                </p>
            </td>
            <td className='!px-5 align-top !max-w-max'>
                <div className="flex gap-3 min-w-max">
                    <div>
                        <button
                            type="button"
                            className='rounded-full custom_border dark:bg-cblack flex items-center justify-center p-1.5 transition-all duration-75 w-max'
                            onClick={() => handleEditCategory(categoryIndex, modalityIndex)}
                        >
                            <EditIcon className="w-4 h-4 text-gray-500 dark:text-white" strokeWidth={2.5} />
                        </button>
                    </div>

                    <div>
                        <button
                            type="button"
                            className='rounded-full bg-red-600 flex items-center justify-center p-1.5 hover:bg-red-700 transition-all duration-75 w-max'
                            onClick={() => handleRemoveCategory(categoryIndex, modalityIndex)}
                        >
                            <TrashIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            </td>
        </tr>
    )
} 