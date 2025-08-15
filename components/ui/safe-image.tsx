'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ImageIcon, Loader } from 'lucide-react'
import { motion } from 'framer-motion'
import { validateImageUrl } from '@/lib/utils'

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
    const [imageLoading, setImageLoading] = useState(false)

    const validSrc = validateImageUrl(src)

    return (
        <motion.div className={`${className ?? `h-[300px] w-[200px] flex items-center justify-center rounded-xl rounded-bl-3xl overflow-hidden`}`}
            key={src + imageLoading ? 'loading' : 'loaded'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >

            {imageLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Loader className="w-5 h-5 animate-spin" />
                </div>
            ) : (!validSrc || imageError) ? (
                <div className={`flex flex-col items-center justify-center h-full w-full bg-gray-100 dark:bg-cblack`} >
                    <ImageIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
                    <p className="text-gray-500 dark:text-gray-400 text-sm tracking-tight text-center font-medium">
                        {imageError ? 'Error al cargar imagen' : fallbackText}
                    </p>
                </div>
            ) : (
                <Image
                    src={validSrc}
                    alt={alt}
                    className={`${className} ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 h-full w-full object-cover object-left-top`}
                    fill={fill}
                    priority={priority}
                    onLoad={() => setImageLoading(false)}
                    onError={() => {
                        setImageError(true)
                        setImageLoading(false)
                    }}
                />
            )
            }
        </motion.div>
    );
}