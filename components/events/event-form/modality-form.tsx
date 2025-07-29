import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { Modality } from '@/lib/utils'

interface ModalityFormProps {
    append: (modality: Modality) => void;
}

export function ModalityForm({ append }: ModalityFormProps) {
    const [name, setName] = useState<string>('')

    const handleSubmit = () => {
        if (name.trim()) {
            append({ name: name.trim(), categories: [] })
            setName('') // Limpiar el input después de agregar
        }
    }

    return (
        <div className="flex flex-col justify-end gap-2 w-full max-w-sm">
            <div className="flex gap-2 w-full">
                <input
                    type="text"
                    className="input"
                    placeholder="Nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault()
                            handleSubmit()
                        }
                    }}
                />
                <div className="w-max mt-1">
                    <button
                        type="button"
                        className="rounded-full bg-gray-800 dark:bg-gray-300 flex items-center justify-center p-2 transition-all duration-75"
                        onClick={handleSubmit}
                        disabled={!name.trim()}
                    >
                        <PlusIcon className="w-4 h-4 text-white dark:text-gray-950" strokeWidth={2.5} />
                    </button>
                </div>
            </div>
        </div>
    )
}