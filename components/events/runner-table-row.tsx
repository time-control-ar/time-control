import { Ticket } from 'lucide-react'
import { DorsalComponent } from '../ui/dorsal-component'
import { useRouter } from 'next/navigation'
import { Runner } from '@/lib/schemas/event.schema'

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
                <p className="text-xl text-center font-black tracking-tight text-gray-800 dark:text-gray-200 font-mono">
                    {runner.posGeneral ?? 'N/A'}
                </p>
            </td>
            <td className='!w-[100px] !p-0 m-auto'>
                <p className="text-2xl font-black tracking-tight text-gray-800 dark:text-white font-mono text-center">
                    {runner.posCat ?? 'N/A'}
                </p>
            </td>

            <td className='!w-min !p-0'>
                <div className="flex items-center justify-center">
                    <DorsalComponent dorsal={runner.racecheck.dorsal} />
                </div>
            </td>

            <td className="md:!max-w-max">
                <div className="flex flex-col w-max">
                    <p className="font-medium text-gray-900 dark:text-white text-[17px] capitalize leading-tight">
                        {runner.racecheck.nombre.toLowerCase()}
                    </p>
                    <p className="text-sm font-semibold tracking-tight text-gray-500 dark:text-gray-200 font-mono">
                        {runner.category.name}
                    </p>
                </div>
            </td>
            <td className='!w-[150px] !p-0 m-auto'>
                <div className="flex items-center gap-2 w-max rounded-xl pl-3 bg-gradient-to-l from-gray-50 to-gray-100 dark:from-cgray dark:to-cgray h-[38px] justify-end">
                    <div className="font-mono text-base font-medium text-gray-700 dark:text-gray-300 pr-2">
                        {runner.racecheck.tiempo?.split('.')[0]}
                        <span className="text-gray-500 dark:text-gray-400 text-xs font-mono">
                            .{runner.racecheck.tiempo?.split('.')[1]}
                        </span>
                    </div>


                    <button
                        type='button'
                        onClick={() => {
                            router.push(`${process.env.NEXT_PUBLIC_QR_URL}/?eventId=${eventId}&dorsal=${runner.racecheck.dorsal}`)
                        }}
                        className="w-max flex items-center gap-2 px-2 py-1.5 bg-gradient-to-t from-slate-700 to-slate-800 dark:from-black dark:to-gray-900 rounded-xl hover:opacity-90 transition-all duration-75 ml-auto font-mono tracking-tight dark:text-white text-white">
                        <p className=''>
                            ticket
                        </p>
                        <Ticket className="w-5 h-5" />
                    </button>

                </div>
            </td>



        </tr >
    )
}

export default RunnerTableRow