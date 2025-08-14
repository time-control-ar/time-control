import { ArrowLeftIcon, InfoIcon, SettingsIcon } from 'lucide-react'
import { EventResponse } from '@/lib/schemas/event.schema'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { cn } from '@/lib/utils';

const eventFormTabs: { title: string, icon: React.ReactNode }[] = [
    {
        title: 'Información',
        icon: <InfoIcon className="w-4 h-4" />
    },
    {
        title: 'Configuración',
        icon: <SettingsIcon className="w-4 h-4" />
    }
]
interface EventFormHeaderProps {
    event?: EventResponse | null;
    router: AppRouterInstance;
    activeTab: number;
    setActiveTab: (tab: number) => void;
    isSubmitting: boolean;
}

export function EventFormHeader({ event, router, activeTab, setActiveTab, isSubmitting }: EventFormHeaderProps) {
    return (
        <>
            <div className="flex flex-col justify-start w-full max-w-7xl mx-auto px-6 mt-12">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        className={`h-8 w-8 dark:bg-cgray rounded-full flex items-center justify-center`}
                        onClick={() => router.push('/')}
                    >
                        <ArrowLeftIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button >

                    <label className="text-xl md:text-2xl font-medium text-gray-950 dark:text-gray-100 font-mono tracking-tight">
                        {event ? "Editar evento" : "Nuevo evento"}
                    </label>
                </div>
            </div>


            <div className="flex flex-col justify-start w-full mx-auto mt-3 sticky z-40 top-0 bg-white/80 dark:bg-cdark/80 backdrop-blur-lg py-2 mb-12">
                <div className="max-w-7xl mx-auto w-full flex items-center px-6 gap-3 relative">
                    <div className="absolute w-[90%] -bottom-2 left-1/2 -translate-x-1/2 h-[2px] bg-gradient-to-r from-transparent to-transparent via-slate-200 dark:via-cgray"></div>
                    {eventFormTabs.slice(0, event ? 2 : 1).map((tab, index: number) => (
                        <button
                            key={index}
                            type="button"
                            className={cn(
                                "text-sm font-medium font-mono tracking-tight text-cblack dark:text-gray-100 text-center max-w-max flex items-center gap-2 px-2 py-2.5 rounded-full transition-all duration-75",
                                activeTab === index && "bg-gray-100 dark:bg-cgray rounded-full"
                            )}
                            onClick={() => setActiveTab(index)}
                            disabled={isSubmitting}
                        >
                            {tab.icon}
                            <p className="text-xs font-medium font-mono tracking-tight text-center max-w-max">
                                {tab.title}
                            </p>
                        </button>
                    ))}
                </div>
            </div>
        </>
    )
}