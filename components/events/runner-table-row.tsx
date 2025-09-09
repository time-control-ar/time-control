import { Ticket } from 'lucide-react'
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
            <td>
                <div className='!w-[50px] m-auto'>

                    <p className="text-xl text-center font-black tracking-tight text-gray-800 dark:text-white font-mono">
                        {runner.posGeneral ?? 'N/A'}
                    </p>
                    <p className='text-xs font-medium text-gray-950 dark:text-white text-center'>
                        {runner.modality.name}
                    </p>
                </div>
            </td>
            <td>
                <div className='!w-[50px] m-auto'>

                    <p className="text-2xl font-black tracking-tight text-gray-800 dark:text-white font-mono text-center">
                        {runner.posCat ?? 'N/A'}
                    </p>
                </div>
            </td>
            <td>
                <div className='!w-[50px] m-auto'>

                    <p className="text-xl text-center font-black tracking-tight text-gray-800 dark:text-white font-mono">
                        {runner.posSexo ?? 'N/A'}
                    </p>
                </div>
            </td>

            <td className=''>
                <div className="flex flex-col items-center justify-center relative w-11 h-max overflow-hidden rounded-md shadow-md">
                    <div className="h-[8px] px-1 w-full max flex items-center justify-between bg-gradient-to-r from-slate-600 to-slate-900">
                        <div className="rounded-full bg-white dark:bg-gray-100 w-[2px] h-[2px]"></div>
                        <div className="rounded-full bg-white dark:bg-gray-100 w-[2px] h-[2px]"></div>
                    </div>

                    <div className='bg-white dark:bg-gray-100 overflow-hidden flex flex-col w-[52px] pb-1.5'>
                        <p className="font-bold text-gray-700 dark:text-gray-800 text-center font-mono text-sm">
                            {parseInt(runner.racecheck.dorsal)}
                        </p>
                    </div>
                </div>
            </td>

            <td className=" !px-3">
                <div className="flex flex-col !w-[150px] md:!w-full">
                    <p className="font-medium text-gray-900 dark:text-white text-[15px] capitalize leading-tight">
                        {runner.racecheck.nombre.toLowerCase()}
                    </p>

                    <p className='text-xs font-medium text-gray-950 dark:text-white'>{runner.category.name}</p>
                </div>
            </td>

            <td className='w-max ml-auto flex items-end'>
                <div className="flex flex-col md:flex-row w-max items-center gap-1">
                    <div className="font-mono text-base font-medium text-gray-700 dark:text-white pr-2">
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
                        className="w-max flex items-center gap-2 px-2 py-1.5 bg-gradient-to-t from-sky-500 to-sky-400 dark:from-white dark:to-gray-100 rounded-md hover:opacity-90 transition-all duration-75 ml-auto font-mono tracking-tight text-white dark:text-gray-900">
                        <p className=''>
                            Ver ticket
                        </p>
                        <Ticket className="w-5 h-5" />
                    </button>

                </div>
            </td>



        </tr >
    )
}

export default RunnerTableRow