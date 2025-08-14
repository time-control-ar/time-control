import React from 'react'

interface DorsalComponentProps {
    dorsal: string;
    preview?: boolean;
}

export const DorsalComponent = ({ dorsal, preview = true }: DorsalComponentProps) => {

    return (
        <div className={`${preview ? 'border-2 border-slate-100' : ''} flex flex-col my-auto dark:bg-transparent rounded-lg overflow-hidden w-max`}>
            <div className="flex flex-col items-center justify-center relative ">
                <div className="h-[10px] px-2 w-full max flex items-center justify-between bg-gradient-to-r from-slate-600 to-slate-900">
                    <div className="rounded-full bg-white dark:bg-gray-100 w-[2px] h-[2px]"></div>
                    <div className="rounded-full bg-white dark:bg-gray-100 w-[2px] h-[2px]"></div>
                </div>

                <div className='bg-white dark:bg-gray-100 overflow-hidden flex flex-col w-[52px] h-max py-1'>
                    <p className="font-bold text-gray-700 dark:text-gray-800 text-center font-mono text-base">
                        {parseInt(dorsal)}
                    </p>
                </div>
            </div>
        </div>
    )
}