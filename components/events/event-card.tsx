import { motion } from "framer-motion"
import Image from "next/image"
import { EventProps } from "@/lib/utils"
// Event card component
export const EventCard = ({ event, setSelectedEvent }: { event: EventProps, setSelectedEvent?: (event: EventProps) => void }) => {

    return (
        <>
            <motion.div
                className={`w-full rounded-3xl overflow-hidden flex flex-col h-max max-w-[350px] mx-auto bg-gradient-to-b bg-gray-100 dark:bg-gray-900 ${setSelectedEvent ? 'cursor-pointer' : ''}`}
                onClick={() => setSelectedEvent?.(event)}
            // animate={{ scale: isOpen ? 1.05 : 1, transition: { duration: 0.2, ease: 'easeInOut' } }}
            >
                <motion.div className="flex items-center justify-center w-full z-10 min-h-[290px] relative">
                    {event?.imageUrl ? (
                        <Image
                            src={event?.imageUrl || ''}
                            alt={event?.name || ''}
                            className="z-10"
                            objectPosition='top'
                            objectFit='cover'
                            fill
                            priority
                        />
                    ) : (
                        <div className="z-10 flex items-center justify-center w-full h-full">
                            <p className="text-gray-500 dark:text-gray-400 text-sm tracking-tight text-center font-semibold">
                                No hay imagen para mostrar
                            </p>
                        </div>
                    )}
                </motion.div>
            </motion.div >

            <motion.div className="flex flex-col w-full pt-3 px-1">
                <motion.h2 className="text-gray-950 dark:text-gray-50 text-lg font-semibold tracking-tight">
                    {event?.name || ''}
                </motion.h2>
                <p className=" text-gray-500 dark:text-gray-400 text-sm tracking-tight">
                    {event?.description || ''}
                </p>

                {/* <div className="flex w-full justify-end mt-4">
                    <button
                        className="dark:bg-gray-900 bg-white w-max rounded-full px-6 py-3 text-gray-950 dark:text-white flex items-center gap-2 hover:opacity-80 transition-all duration-300"
                        onClick={() => setSelectedEvent(event)}>
                        <p className="text-xs font-semibold tracking-tight">
                            Ver detalles
                        </p>
                        <ArrowRightIcon className="w-4 h-4 text-gray-950 dark:text-white" />
                    </button>
                </div> */}
            </motion.div>
        </>
    )
}
