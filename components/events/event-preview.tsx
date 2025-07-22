
// import { AnimatePresence, motion } from "framer-motion"
// import { EventCard } from './event-card'
// import RaceCheckTable from './race-check-table'
// import { useState } from 'react'
// import { ChartBarIcon, InfoIcon } from 'lucide-react'
// import { EventResponse } from '@/services/eventService'

// const EventPreview = ({ event }: { event: EventResponse }) => {
//     const [tab, setTab] = useState<'info' | 'results'>('info')
//     const [isOpenModal, setIsOpenModal] = useState(false)
//     return (
//         <>
//             <div className="flex flex-col sticky top-0 left-0 w-full bg-white dark:bg-gray-950 z-10">
//                 <div className="flex items-center justify-center gap-3 md:gap-6 w-full overflow-x-auto h-max bg-gradient-to-b from-white to-transparent dark:from-gray-950 dark:to-transparent py-3">

//                     <button
//                         type="button"
//                         onClick={() => setTab('info')}
//                         className={`h-10 px-4 rounded-full flex items-center justify-center
//                            relative select-none gap-2 ${tab === 'info' ? '' : 'opacity-50'}
//                            bg-gradient-to-b from-white to-white dark:from-gray-800 dark:to-gray-900
//                            border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
//                     >
//                         <InfoIcon className="w-4 h-4 text-blue-400 dark:text-cyan-300" />
//                         <p className="text-sm font-medium tracking-tight text-gray-950 dark:text-white">
//                             Información
//                         </p>
//                     </button>

//                     <button
//                         type="button"
//                         onClick={() => setTab('results')}
//                         className={`h-10 px-4 rounded-full flex items-center justify-center
//                            relative select-none gap-2 ${tab === 'results' ? '' : 'opacity-50'}
//                            bg-gradient-to-b from-white to-white dark:from-gray-800 dark:to-gray-900
//                            border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
//                     >
//                         <ChartBarIcon className="w-4 h-4 text-orange-500 dark:text-orange-400" />
//                         <p className="text-sm font-medium tracking-tight text-gray-950 dark:text-white">
//                             Resultados
//                         </p>
//                     </button>

//                     <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent rounded-full">
//                     </div>
//                 </div>

//             </div>

//             <AnimatePresence mode="wait">
//                 <motion.div
//                     key={tab}
//                     initial={{ opacity: 0, y: 10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, y: 10 }}
//                     transition={{ duration: 0.2 }}
//                     className="flex flex-col gap-3 p-6 w-full max-h-full md:overflow-hidden"
//                 >
//                     {tab === 'info' ? (
                       
//                     ) : (
//                         <RaceCheckTable results={event?.results || {}} />
//                     )}
//                 </motion.div>
//             </AnimatePresence>
//         </>
//     )
// }

// export default EventPreview