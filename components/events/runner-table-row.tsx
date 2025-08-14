import { TicketIcon } from 'lucide-react'
import { DorsalComponent } from '../ui/dorsal-component'
import { useRouter } from 'next/navigation'
import { Runner } from '@/lib/utils'

interface RunnerTableRowProps {
    runner: Runner
    eventId?: string
    index: number
}

const RunnerTableRow = ({ runner, eventId, index }: RunnerTableRowProps) => {
    const router = useRouter()

    return (
        <tr key={index} className="">
            <td className='!w-[50px] m-auto'>
                <p className="text-xl text-center font-medium tracking-tight text-gray-800 dark:text-gray-200 font-mono-italic">
                    {runner.posGeneral ?? 'N/A'}
                </p>
                <p className="text-xs tracking-tight text-gray-400 dark:text-gray-300 font-mono text-center">
                    {runner.modality.name}
                </p>
            </td>
            <td className='!w-[100px] !p-0 m-auto'>
                <p className="text-2xl font-black tracking-tight text-gray-800 dark:text-gray-200 font-mono-italic text-center">
                    {runner.posCat ?? 'N/A'}
                </p>
                <p className="text-xs tracking-tight text-gray-400 dark:text-gray-300 font-mono text-center">
                    {runner.category.name}
                </p>
            </td>

            <td className=''>
                <div className="flex my-auto items-center justify-center">
                    <DorsalComponent dorsal={runner.racecheck.dorsal} />
                </div>
            </td>

            <td className="md:!max-w-max">
                <div className="flex flex-col gap-1 w-max">
                    <p className="font-medium text-gray-900 dark:text-white text-base capitalize leading-tight">
                        {runner.racecheck.nombre.toLowerCase()}
                    </p>
                </div>
            </td>

            {/* <td className='!w-[100px] !p-0 m-auto'>
                <p className="text-2xl font-black tracking-tight text-gray-800 dark:text-gray-200 font-mono-italic text-center">
                    {runner.modality.name}
                </p>
            </td> */}


            <td className="">
                <div className="flex flex-col items-end justify-end">
                    <div className="flex items-center gap-1 w-max rounded-2xl border-2 border-gray-100 dark:border-cgray pl-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-cgray dark:to-cgray h-[38px] justify-end">
                        <div className="font-mono text-base text-gray-700 dark:text-gray-300 pr-2">
                            {runner.racecheck.tiempo?.split('.')[0]}
                            <span className="text-gray-500 dark:text-gray-400 text-xs font-mono">
                                .{runner.racecheck.tiempo?.split('.')[1]}
                            </span>
                        </div>

                        {eventId && runner.racecheck.dorsal && runner.racecheck.dorsal !== 'N/A' && runner.racecheck.chip && (
                            <button
                                type='button'
                                onClick={() => {
                                    router.push(`${process.env.NEXT_PUBLIC_QR_URL}/?eventId=${eventId}&dorsal=${runner.racecheck.dorsal}`)
                                }}
                                className="w-max flex items-center gap-0.5 px-3 py-1.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-75 ml-auto">
                                <TicketIcon className="w-6 h-6" />
                            </button>
                        )}
                    </div>

                    <div className='mt-1 mr-12'>
                        <p className="text-xs font-medium tracking-tight text-gray-700 dark:text-gray-300 font-mono-italic">
                            {runner.racecheck.ritmo?.split('m')[0]}
                            <span className="opacity-50">
                                m/km
                            </span>
                        </p>
                    </div>
                </div>
            </td>
        </tr >
    )
}

export default RunnerTableRow