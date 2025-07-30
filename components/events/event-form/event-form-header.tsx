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
                className={`h-8 w-8 custom_border rounded-full flex items-center justify-center`}
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