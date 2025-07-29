import { ArrowLeftIcon } from 'lucide-react'
import { EventResponse } from '@/lib/schemas/event.schema'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

interface EventFormHeaderProps {
    event?: EventResponse | null;
    router: AppRouterInstance;
}

export function EventFormHeader({ event, router }: EventFormHeaderProps) {
    return (
        <div className="flex items-center gap-2">
            <button
                type="button"
                className={`h-8 rounded-full w-8 flex items-center justify-center
          relative select-none gap-2
          bg-gradient-to-b from-white to-white dark:from-gray-950 dark:to-gray-950
          border-2 border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
                onClick={() => router.push('/')}
            >
                <ArrowLeftIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button >
            <label className="text-2xl font-medium text-gray-950 dark:text-gray-100 font-mono tracking-tight">
                {event ? "Editar evento" : "Nuevo evento"}
            </label>
        </div>
    )
}