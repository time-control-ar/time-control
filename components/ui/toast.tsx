'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'

const Toast = ({
    isVisible,
    message,
    type,
    dismissible = false,
    onDismiss
}: {
    isVisible: boolean,
    message: string,
    type: 'success' | 'error' | 'info',
    dismissible?: boolean,
    onDismiss?: () => void
}) => {
    const isMobile = useIsMobile()

    useEffect(() => {
        // Add body class to prevent scroll on mobile when toast is visible
        // if (isVisible) {
        //     document.body.classList.add('toast-open')
        // } else {
        //     document.body.classList.remove('toast-open')
        // }

        if (!dismissible) {
            const timer = setTimeout(() => {
                onDismiss?.()
            }, isMobile ? 4000 : 3000)
            return () => clearTimeout(timer)
        }

        // Cleanup on unmount
        return () => {
            document.body.classList.remove('toast-open')
        }
    }, [dismissible, onDismiss, isVisible, isMobile])

    const bgColor = {
        success: 'bg-green-100 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400',
        error: 'bg-red-100 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400',
        info: 'bg-blue-100 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'
    }[type]

    const Icon = {
        success: CheckCircle2,
        error: AlertCircle,
        info: Info
    }[type]

    return (
        <AnimatePresence mode="wait">
            <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20, scale: 1 }}
                exit={{ opacity: isVisible ? 0 : 1, y: isVisible ? -20 : 0, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="fixed top-4 left-4 right-4 z-[9999] md:top-5 md:left-1/2 md:-translate-x-1/2 md:right-auto md:w-auto md:max-w-md toast-container"
            >
                <div className={`${bgColor} px-4 py-3 md:px-6 md:py-4 rounded-2xl shadow-lg border flex items-center gap-3 backdrop-blur-sm`}>
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium text-sm md:text-base flex-1 break-words">{message}</span>
                    {dismissible && (
                        <button
                            type="button"
                            onClick={() => {
                                onDismiss?.()
                            }}
                            className="ml-2 md:ml-4 hover:opacity-70 flex-shrink-0 p-1 rounded-full hover:bg-cdark/5 dark:hover:bg-white/5 transition-colors"
                            aria-label="Cerrar notificación"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </motion.div>

        </AnimatePresence>
    )
}
export default Toast