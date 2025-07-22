'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ImageIcon, Loader } from 'lucide-react'
import { getImageUrl } from '@/lib/utils'
import { motion } from 'framer-motion'

interface SafeImageProps {
    src: string
    alt: string
    className?: string
    fill?: boolean
    priority?: boolean
    fallbackText?: string
}

export default function SafeImage({
    src,
    alt,
    className = '',
    fill = false,
    priority = false,
    fallbackText = 'Imagen'
}: SafeImageProps) {
    const [imageError, setImageError] = useState(false)
    const [imageLoading, setImageLoading] = useState(true)

    const validSrc = getImageUrl(src)

    if (!validSrc || imageError) {
        return (
            <div className={`flex flex-col min-h-[200px] items-center justify-center w-full h-full ${className}`}>
                <ImageIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
                <p className="text-gray-500 dark:text-gray-400 text-sm tracking-tight text-center font-medium">
                    {imageError ? 'Error al cargar imagen' : fallbackText}
                </p>
            </div>
        )
    }

    return (
        <motion.div className={`flex items-center justify-center w-full z-10 min-h-[200px] relative rounded-3xl ${className}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >

            {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Loader className="w-5 h-5 animate-spin" />
                </div>
            )}
            <Image
                src={validSrc}
                alt={alt}
                className={`${className} ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 h-full w-full`}
                fill={fill}
                priority={priority}
                onLoad={() => setImageLoading(false)}
                onError={() => {
                    setImageError(true)
                    setImageLoading(false)
                }}
            />
        </motion.div>
    )
} 