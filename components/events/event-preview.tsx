
import { AnimatePresence, motion } from "framer-motion"
import { EventCard } from './event-card'
import RaceCheckTable from './race-check-table'
import { useState } from 'react'
import { ChartBarIcon, ImageIcon } from 'lucide-react'
import { EventResponse } from '@/services/eventService'

const EventPreview = ({ event }: { event: EventResponse }) => {
    const [tab, setTab] = useState<'info' | 'results'>('info')

    return (
        <>
            <div className="flex flex-col sticky top-0 left-0 w-full bg-white dark:bg-gray-900 z-10">
                <div className="flex items-center justify-center gap-3 md:gap-6 w-full overflow-x-auto h-max bg-gradient-to-b from-white to-transparent dark:from-gray-900 dark:to-transparent py-3">

                    <button
                        type="button"
                        className={`rounded-btn min-w-max ${tab === 'info' ? '!bg-gray-100 !dark:bg-gray-700' : '!bg-transparent'}`} onClick={() => setTab('info')}>
                        <div>
                            <ImageIcon className="w-4 h-4 text-gray-500 dark:text-white" />
                        </div>
                        <p className="text-sm font-medium tracking-tight text-gray-950 dark:text-white">
                            Vista previa
                        </p>
                    </button>

                    <button
                        type="button"
                        className={`rounded-btn min-w-max ${tab === 'results' ? '!bg-gray-100 !dark:bg-gray-700' : '!bg-transparent'}`} onClick={() => setTab('results')}>
                        <div>
                            <ChartBarIcon className="w-4 h-4 text-gray-500 dark:text-white" />
                        </div>
                        <p className="text-sm font-medium tracking-tight text-gray-950 dark:text-white">
                            Resultados cargados
                        </p>
                    </button>

                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent rounded-full">
                    </div>
                </div>

            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-3 p-6 w-full max-h-full overflow-auto"
                >
                    {tab === 'info' ? (
                        <EventCard event={event} />
                    ) : (
                        <RaceCheckTable results={event.results} />
                    )}
                </motion.div>
            </AnimatePresence>
        </>
    )
}

export default EventPreview