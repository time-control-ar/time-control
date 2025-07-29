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
            <td className='!px-4 lg:!px-6'>
                <div className="chip_filter max-w-max">
                    <p className='text-sm text-gray-500 dark:text-gray-400 px-2'>
                        {gender.name}
                    </p>
                </div>
            </td>

            <td className="py-2 px-3 items-center justify-center w-max">
                <p className='font-mono text-sm text-gray-500 dark:text-gray-400 px-2'>
                    {gender.matchsWith}
                </p>
            </td>

            <td className="!px-4">
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