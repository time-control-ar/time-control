'use client'

import { ReactNode, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { XIcon } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    children: ReactNode
    maxWidth?: string
    height?: string
    showCloseButton?: boolean
    className?: string
}

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = "max-w-[600px]",
    height = "",
    showCloseButton = true,
    className = ""
}: ModalProps) => {
    const isMobile = useIsMobile()

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
            // Add class to prevent scroll on mobile
            document.body.classList.add('modal-open')
        } else {
            document.body.style.overflow = 'unset'
            document.body.classList.remove('modal-open')
        }

        return () => {
            document.body.style.overflow = 'unset'
            document.body.classList.remove('modal-open')
        }
    }, [isOpen])

    return (
        <AnimatePresence mode="wait">
            {isOpen ? (
                <>
                    <motion.div
                        initial={{ y: isMobile ? '100%' : '50%', opacity: 0, scale: 0.95 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: isMobile ? '100%' : '50%', opacity: 0, scale: 0.95 }}
                        transition={{
                            duration: isMobile ? 0.3 : 0.2,
                            ease: 'easeOut',
                            type: "spring",
                            stiffness: 300,
                            damping: 30
                        }}
                        className={`fixed ${isMobile ? 'bottom-0 left-0 right-0 w-full modal-container' : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'} ${maxWidth} ${height} z-[9999] bg-white dark:bg-gray-950 ${isMobile ? 'rounded-t-3xl' : 'rounded-2xl'} overflow-hidden shadow-2xl ${className}`}
                    >
                        {(title || showCloseButton) && (
                            <div className="flex items-center justify-between p-6 gap-4 md:gap-6">
                                {title && (
                                    <h1 className="text-xl md:text-2xl font-bold text-gray-950 dark:text-white flex-1">
                                        {title}
                                    </h1>
                                )}
                                {showCloseButton && (
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
                                        aria-label="Cerrar modal"
                                    >
                                        <XIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="flex flex-col h-[calc(100vh-300px)] overflow-y-auto p-6">
                            <div className="flex flex-col h-full">
                                {children}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm modal-backdrop"
                    />
                </>
            ) : null}
        </AnimatePresence>
    )
}

export default Modal