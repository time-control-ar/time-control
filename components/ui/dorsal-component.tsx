import React from 'react'

const DorsalComponent = ({ dorsal }: { dorsal: number }) => {
    return (
        <div>
            <div className="flex flex-col justify-between items-center rounded-md overflow-hidden h-[45px] w-[60px] shadow">
                <div className="w-full h-3 bg-gradient-to-r from-slate-700 to-slate-800 justify-between flex items-center py-1.5 px-3">
                    <div className="w-1 h-1 rounded-full bg-white dark:bg-gray-100"></div>
                    <div className="w-1 h-1 rounded-full bg-white dark:bg-gray-100"></div>
                </div>

                <div className="bg-white dark:bg-gray-100 w-full h-full flex items-center justify-center">
                    <p className="font-bold text-lg text-gray-700 dark:text-gray-800 text-center tracking-tighter font-mono">
                        {dorsal}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default DorsalComponent