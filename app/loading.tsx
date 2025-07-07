import { Loader } from 'lucide-react'
import React from 'react'

const LoadingPage = () => {
    return (
        <div className="flex items-center justify-center h-[100%] overflow-hidden w-full">
            <Loader className="w-5 h-5 animate-spin" />
        </div>
    )
}

export default LoadingPage