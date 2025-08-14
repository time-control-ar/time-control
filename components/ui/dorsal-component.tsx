import React from 'react'

interface DorsalComponentProps {
    dorsal: string;
    preview?: boolean;
}

export const DorsalComponent = ({ dorsal, preview = true }: DorsalComponentProps) => {

    return (
        <div className={`${preview ? 'bg-slate-200 dark:bg-transparent p-0.5 rounded-xl' : ''} w-max`}>
            <div className='bg-white dark:bg-gray-100 overflow-hidden flex flex-col w-[57px] rounded-lg'>
                <div className="flex flex-col items-center justify-center relative ">
                    <div className="w-full max flex items-center justify-between bg-gradient-to-r from-slate-600 to-slate-900 h-[15px] px-3">
                        <div className="rounded-full bg-white dark:bg-gray-100 w-1 h-1"></div>
                        <div className="rounded-full bg-white dark:bg-gray-100 w-1 h-1"></div>
                    </div>

                    <div className="w-full pt-1 pb-1.5 flex items-center justify-center">
                        <p className="font-bold text-gray-700 dark:text-gray-800 text-center tracking-tighter font-mono text-base">
                            {parseInt(dorsal)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}