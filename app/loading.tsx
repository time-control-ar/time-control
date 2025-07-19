import { Loader } from 'lucide-react'
import React from 'react'

const LoadingPage = () => {
    return (
        <div className=" absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Loader className="w-5 h-5 animate-spin" />
        </div>
    )
}

export default LoadingPage