import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { Gender } from '@/lib/schemas/event.schema'

interface GendersFormProps {
    handleAddGender: (gender: Gender) => void;
}

export function GendersForm({ handleAddGender }: GendersFormProps) {
    const [newGender, setNewGender] = useState<Gender>({ name: '', matchsWith: '' })

    return (
        <div key={`new-gender`}
            className='flex gap-2 w-full items-end'
        >
            <div className="flex flex-col md:flex-row w-full gap-2">
                <div className='flex flex-col gap-1 w-full'>
                    <p className="label-input">
                        Nombre
                    </p>
                    <input
                        type="text"
                        className="input"
                        placeholder="Nombre"
                        value={newGender.name}
                        onChange={(e) => setNewGender({ name: e.target.value, matchsWith: newGender.matchsWith })}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                handleAddGender(newGender)
                                setNewGender({ name: '', matchsWith: '' })
                            }
                        }}
                    />
                </div>

                <div className="flex flex-col gap-1 w-full">
                    <p className="label-input">
                        Valor en racecheck
                    </p>
                    <input
                        type="text"
                        className="input font-mono !text-sm"
                        placeholder="racecheck: F, M, X"
                        value={newGender.matchsWith}
                        onChange={(e) => setNewGender({ name: newGender.name, matchsWith: e.target.value })}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                handleAddGender(newGender)
                                setNewGender({ name: '', matchsWith: '' })
                            }
                        }}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-1 px-1 items-center">
                <button
                    type="button"
                    className="rounded-full bg-gray-800 dark:bg-gray-300 flex items-center justify-center p-2 transition-all duration-75 disabled:opacity-50"
                    onClick={() => {
                        handleAddGender(newGender)
                        setNewGender({ name: '', matchsWith: '' })
                    }}
                    disabled={!newGender.name.trim()}
                >
                    <PlusIcon className="w-4 h-4 text-white dark:text-gray-950" strokeWidth={2.5} />
                </button>
            </div >
        </div>
    )
}