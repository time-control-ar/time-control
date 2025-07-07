import { CalendarIcon, MapPinIcon } from 'lucide-react'
import { EventResponse } from '@/services/eventService'
import { motion } from "framer-motion"
import SafeImage from '@/components/ui/safe-image'

// Event card component
export const EventCard = ({ event, setSelectedEvent }: { event: EventResponse, setSelectedEvent?: (event: EventResponse) => void }) => {
    const parsedDate = event?.date
        ? event?.date.split('T')[0].replace(/-/g, '/').split('/').reverse().join('/')
        : 'Fecha'

    return (
        <div className="w-full max-w-[300px] mx-auto">
            <div className="flex gap-1 items-center w-full p-2">
                <MapPinIcon className="w-4 h-4 text-red-500 dark:text-red-500" />
                <p className="text-gray-500 dark:text-white text-sm font-medium tracking-tight">
                    {event?.location || 'Ubicación'}
                </p>
            </div>

            <motion.div
                className={`w-full relative rounded-3xl overflow-hidden flex flex-col h-max mx-auto bg-gradient-to-b bg-gray-100 dark:bg-[#10141a] ${setSelectedEvent ? 'cursor-pointer' : ''}`}
                onClick={() => setSelectedEvent?.(event)}
            >
                <div className="z-30 absolute top-0 left-0 p-2 flex flex-col gap-1">
                    <div className="flex gap-1 rounded-full bg-black/30 backdrop-blur-sm dark:bg-white/30 px-3 py-2 w-max items-center">
                        <CalendarIcon className="w-4 h-4 text-white dark:text-white" />
                        <p className="text-white dark:text-white text-xs tracking-tight">
                            {parsedDate}
                        </p>
                    </div>
                </div>


                <SafeImage
                    src={event?.image || ''}
                    alt={event?.name || ''}
                    className="z-10 object-cover"
                    fill
                    priority
                    fallbackText="Imagen"
                />
            </motion.div >

            <motion.div className="flex flex-col w-full pt-3 px-1 max-w-[300px] mx-auto">
                <motion.h2 className="text-gray-950 dark:text-gray-50 text-lg font-semibold tracking-tight">
                    {event?.name || 'Nombre'}
                </motion.h2>
                <p className=" text-gray-500 dark:text-gray-400 text-sm tracking-tight w-full">
                    {event?.description || 'Descripción'}
                </p>
            </motion.div>
        </div>
    )
}
