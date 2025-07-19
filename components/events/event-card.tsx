import { ClockIcon, MapPinIcon } from 'lucide-react'
import { EventResponse } from '@/services/eventService'
import { motion } from "framer-motion"
import SafeImage from '@/components/ui/safe-image'

// Event card component
export const EventCard = ({ event, setSelectedEvent }: { event: EventResponse, setSelectedEvent?: (event: EventResponse) => void }) => {
    const eventMonth = event?.date
        ? new Date(event?.date).toLocaleString('es-ES', { month: 'long' })
        : 'Mes'

    const eventDay = event?.date
        ? new Date(event?.date).getDate()
        : 'Día'

    const parsedStartTime = event?.startTime ? event.startTime.startsWith('0') ? event.startTime.slice(1) : event.startTime : '-:-'
    const parsedEndTime = event?.endTime ? event.endTime.startsWith('0') ? event.endTime.slice(1) : event.endTime : '-:-'

    // const eTypes = eventTypes.filter((type) => event?.type?.includes(type.value))

    return (
        <div className="w-full max-w-[300px] mx-auto border border-gray-200 dark:border-gray-800 rounded-3xl cursor-pointer select-none overflow-hidden shadow-lg dark:shadow-gray-950/50" onClick={() => setSelectedEvent?.(event)}>
            <motion.div
                className={`w-full relative overflow-hidden flex flex-col h-max mx-auto bg-white dark:bg-gray-900`}
            >
                <div className="z-30 absolute bottom-0 left-0 p-2 flex flex-col gap-1 scale-90 md:scale-100">
                    <div className="flex w-full">
                        <div className="flex flex-col rounded-2xl bg-gradient-to-b dark:from-gray-900 dark:to-gray-800 from-gray-100 to-white backdrop-blur-sm px-3 py-2 w-max items-center">
                            <p className="text-gray-950 dark:text-white text-3xl font-semibold tracking-tight -mb-1">
                                {eventDay}
                            </p>
                            <p className="text-gray-950 dark:text-white text-sm tracking-tight font-medium capitalize">
                                {eventMonth}
                            </p>
                        </div>

                        {/* <div className="flex overflow-x-auto gap-2 items-end pl-3">
                            {eTypes.map((type, index) => (
                                <div key={index} className="h-max">
                                    <p className="text-gray-950 dark:text-white text-sm tracking-tight font-medium capitalize">
                                        {type.name}
                                    </p>
                                </div>
                            ))}

                        </div> */}

                    </div>
                </div>


                <SafeImage
                    src={event?.image || ''}
                    alt={event?.name || ''}
                    className="z-10 object-cover rounded-bl-3xl"
                    fill
                    priority
                    fallbackText="Imagen"
                />
            </motion.div >

            <div className="flex flex-col w-full px-4 py-5 max-w-[300px] mx-auto bg-gradient-to-b from-white to-white dark:from-gray-900 dark:to-gray-800">
                <div className="flex flex-col gap-1 items-start justify-between w-full">
                    <h2 className="text-gray-950 dark:text-gray-50 text-xl font-semibold tracking-tight line-clamp-1">
                        {event?.name || 'Nombre'}
                    </h2>
                    <p className=" text-gray-500 dark:text-gray-400 text-sm tracking-tight w-full line-clamp-2">
                        {event?.description || 'Descripción'}
                    </p>
                </div>

                <div className="flex flex-col gap-2 mt-6">
                    <div className="flex gap-2 items-center w-full">
                        <ClockIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <p className="text-gray-500 dark:text-gray-400 text-sm tracking-tight">
                            {parsedStartTime} a {parsedEndTime} hs
                        </p>
                    </div>
                    <div className="flex gap-2 items-center w-full">
                        <MapPinIcon className="w-4 h-4 text-red-500 dark:text-red-500" />
                        <p className="text-gray-500 dark:text-gray-400 text-sm tracking-tight">
                            {event?.location || 'Ubicación'}
                        </p>
                    </div>
                </div>

            </div>
        </div>
    )
}
