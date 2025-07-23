'use client'

import { ReactNode, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    maxWidth?: string;
    height?: string;
    showCloseButton?: boolean;
    className?: string;
}

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    showCloseButton = true,
    className = ""
}: ModalProps) => {
    const isMobile = useIsMobile();

    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).overflow;

        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, [isOpen]);

    const renderModalContent = () => (
        <>
            {(title || showCloseButton) && (
                <div className="flex items-center justify-between px-4 md:px-6 pt-6 sticky top-0 z-10">
                    {title ? (
                        <h1 className="text-gray-950 dark:text-gray-50 text-xl font-semibold tracking-tight">
                            {title}
                        </h1>
                    ) : (
                        <div className="w-full h-10" />
                    )}
                    {showCloseButton && (
                        <div>

                            <button
                                type="button"
                                className={`rounded-full flex items-center justify-center h-10 w-10 bg-white dark:bg-gray-950
                                border border-gray-200 dark:border-gray-800
                              outline-none ring-0 transition-all duration-75 shadow-sm md:hover:shadow-md`}
                                onClick={onClose}
                            >
                                <XIcon strokeWidth={2.5} className="w-4 h-4 text-gray-500 dark:text-gray-400 z-20" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {children}
        </>
    );

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    onClick={onClose}
                    className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md flex items-center justify-center overflow-hidden"
                >
                    <motion.div
                        layout
                        initial={{ overflow: 'hidden' }}
                        animate={{ overflow: 'hidden' }}
                        exit={{ overflow: 'hidden', transition: { duration: 0.1, delay: 0 } }}
                        transition={{ duration: 0.1, delay: 0.1 }}
                        className={`
                            ${isMobile ?
                                'h-full w-full' :
                                'w-full md:max-w-[700px] h-auto max-h-[80vh] rounded-3xl'} 
                            z-[9999] relative overflow-y-auto flex flex-col
                            md:border border-gray-200 dark:border-gray-900 bg-white dark:bg-gray-950
                            ${className}
                            `}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {renderModalContent()}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default Modal;