import { TrashIcon } from 'lucide-react'
import { Gender } from '@/lib/utils'

interface GenderRowProps {
    gender: Gender;
    index: number;
    handleRemoveGender: (index: number) => void;
}

export function GenderRow({ gender, index, handleRemoveGender }: GenderRowProps) {
    return (
        <tr key={index}>
            <td className='!px-4 lg:!px-6 flex items-center gap-2'>
                <div className="chip_filter max-w-max">
                    <p className='text-sm text-gray-500 dark:text-gray-400 px-2'>
                        {gender.name}
                    </p>
                </div>
                {gender?.matchsWith && (
                    <div className='flex items-center gap-1'>
                        <span className='text-xs text-gray-400 dark:text-gray-500'>→</span>
                        <p className='font-mono text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-cgray rounded'>
                            {gender?.matchsWith}
                        </p>
                    </div>
                )}
            </td>

            <td className="!px-4 max-w-max">
                <button
                    type="button"
                    className="rounded-full bg-red-600 flex items-center justify-center p-2 hover:bg-red-700 transition-all duration-75 w-max"
                    onClick={() => handleRemoveGender(index)}
                >
                    <TrashIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
                </button>
            </td>
        </tr>
    )
}