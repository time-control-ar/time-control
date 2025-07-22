'use client'

import { useState } from 'react'
import { TrashIcon } from 'lucide-react'
import Modal from '../ui/modal'
import { deleteEvent } from '@/services/eventService'
import { useRouter } from 'next/navigation'

const DeleteEventButton = ({ eventId }: { eventId: string }) => {
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()
    const handleDelete = () => {
        setIsOpen(true)
    }

    const handleClose = () => {
        setIsOpen(false)
    }

    const handleConfirm = async () => {
        try {
            await deleteEvent(eventId)
            router.refresh()
            setIsOpen(false)
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <>
            <button
                type="button"
                className="rounded-full bg-red-600 flex items-center justify-center p-2 hover:bg-red-700 transition-all duration-75"
                onClick={handleDelete}
            >
                <TrashIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
            </button>

            <Modal
                isOpen={isOpen}
                onClose={handleClose}
                title="Eliminar evento"
            >
                <div className="flex flex-col h-full gap-4 p-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Estás seguro de querer eliminar este evento? Esta acción no se puede deshacer.
                    </p>

                    <div className="flex justify-end gap-2 mt-auto">
                        <button className="rounded-full bg-red-500 dark:bg-red-800 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 dark:hover:bg-red-700 transition-all duration-75" onClick={handleConfirm}>
                            Si, eliminar
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    )
}

export default DeleteEventButton