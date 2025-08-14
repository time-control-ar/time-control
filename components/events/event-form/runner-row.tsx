import { RacecheckRunner } from '@/lib/utils'
import { DorsalComponent } from '@/components/ui/dorsal-component'
import { useSession } from 'next-auth/react'

interface RunnerRowProps {
    runner: RacecheckRunner;
    index: number;
}

export function RunnerRow({ runner, index }: RunnerRowProps) {
    const { data: session } = useSession()
    const formatTime = (time: string) => {
        if (!time || time === 'DNF' || time === 'DNS') return time;

        // Si el tiempo tiene formato HH:MM:SS o MM:SS
        if (time.includes(':')) {
            return time;
        }

        // Si es solo segundos, convertirlo a formato legible
        const seconds = parseInt(time);
        if (!isNaN(seconds)) {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;

            if (hours > 0) {
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            } else {
                return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }
        }

        return time;
    };
    return (
        <tr key={index} className="">
            {/* <td className='!px-3 align-middle'>
                <div className="flex flex-col gap-1 items-center">
                    <div className="font-mono text-sm text-gray-900 dark:text-gray-100">
                        {runner.posGeneral}
                    </div>
                </div>
            </td>
            <td className='!px-3 align-middle'>
                <div className="flex flex-col gap-1 items-center">
                    <div className="font-mono font-black text-2xl text-gray-900 dark:text-gray-100">
                        {runner.posCat}
                    </div>
                </div>
            </td> */}
            <td className='align-middle !max-w-[70px]'>
                <div className="flex flex-col items-center gap-1">
                    <DorsalComponent dorsal={runner.dorsal} />
                    {session?.user?.type === 'admin' && (
                        <div className="text-sm text-orange-500 dark:text-white font-mono p-0.5 rounded-md bg-orange-100 dark:bg-transparent">
                            {runner.chip}
                        </div>
                    )}
                </div>
            </td>
            <td className='!px-3 align-middle'>
                <div className="flex flex-col gap-1 w-full max-w-[190px]">
                    <div className="font-medium text-base text-gray-900 dark:text-white">
                        {runner.nombre}
                    </div>
                    <div className="text-xs font-medium text-black dark:text-white">
                        {runner.categoria}
                    </div>

                </div>
            </td>
            <td className='!px-3 align-middle'>
                <div className="flex flex-col gap-1">
                    <p className="text-xl font-black font-mono text-gray-900 dark:text-gray-100">
                        {runner.modalidad}
                    </p>
                </div>
            </td>
            <td className='!px-5 align-middle'>
                <div className="flex flex-col gap-1">
                    <div className="font-mono text-sm text-gray-900 dark:text-gray-100">
                        {formatTime(runner.tiempo)}
                    </div>
                    {runner.ritmo && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            {runner.ritmo}
                        </div>
                    )}
                </div>
            </td>
        </tr >
    )
} 