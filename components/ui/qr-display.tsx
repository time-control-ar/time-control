'use client'

import { QRCodeSVG } from 'qrcode.react'
import { generateQRUrl } from '@/lib/utils'

interface QRDisplayProps {
    eventId: string
    dorsal: number
    size?: number
    className?: string
}

export default function QRDisplay({ eventId, dorsal, size = 200, className = '' }: QRDisplayProps) {
    const qrUrl = generateQRUrl(eventId, dorsal)

    return (
        <div className={`flex flex-col items-center gap-2 ${className}`}>
            <QRCodeSVG
                value={qrUrl}
                size={size}
                level="H"
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Dorsal: {dorsal}
            </p>
        </div>
    )
} 