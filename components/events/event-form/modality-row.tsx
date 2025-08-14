import { TrashIcon } from 'lucide-react'
import { Modality } from '@/lib/utils'

interface ModalityRowProps {
    modality: Modality;
    handleRemoveModality: (index: number) => void;
    index: number;
}

export function ModalityRow({ modality, handleRemoveModality, index }: ModalityRowProps) {
    return (
        <tr key={index} className="">
            <td className='!px-5 align-top flex items-center gap-2 max-w-max'>
                <div className="w-max">
                    <p className='text-lg font-bold font-mono tracking-tight text-gray-700 dark:text-white'>
                        {modality.name}
                    </p>
                </div>
            </td>
            <td className='!px-5 align-center w-full min-w-max'>
                <div className="text-sm text-gray-500 dark:text-gray-300">
                    {modality?.categories && modality.categories.length > 0
                        ? `${modality.categories.length} categoría${modality.categories.length > 1 ? 's' : ''}`
                        : 'Sin categorías'
                    }
                </div>
            </td>
            <td className='!px-5 max-w-max align-top flex items-center gap-2'>
                <button
                    type="button"
                    className="rounded-full bg-red-600 flex items-center justify-center p-1.5 hover:bg-red-700 transition-all duration-75 w-max"
                    onClick={() => handleRemoveModality(index)}
                >
                    <TrashIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
                </button>
            </td>
        </tr>
    )
}