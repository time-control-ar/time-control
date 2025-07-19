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
                <div className="flex items-center justify-between px-6 pt-6 pb-3 sticky top-0 z-10">
                    {title && (
                        <h1 className="text-gray-950 dark:text-gray-50 text-xl font-semibold tracking-tight">
                            {title}
                        </h1>
                    )}
                    {showCloseButton && (
                        <button
                            type="button"
                            className={`h-10 rounded-full w-10 flex items-center justify-center
                           relative select-none gap-2
                           bg-gradient-to-t from-white to-white dark:from-gray-800 dark:to-gray-900
                           border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
                            onClick={onClose}
                        >
                            <XIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
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
                    className="fixed top-0 left-0 z-50 h-full w-full bg-black/30 backdrop-blur-md flex items-center justify-center overflow-hidden"
                >
                    <motion.div
                        layout
                        initial={{ overflow: 'hidden' }}
                        animate={{ overflow: 'hidden' }}
                        exit={{ overflow: 'hidden' }}
                        transition={{ duration: 0.1, delay: 0.1 }}
                        className={`
                            ${isMobile ?
                                'h-full w-full' :
                                'w-full md:max-w-[700px] h-full max-h-[80%] m-auto rounded-3xl top-[10%] left-1/2 -translate-x-1/2'} 
                            z-[9999] absolute overflow-y-auto md:shadow-xl flex flex-col
                            md:border border-gray-200 dark:border-gray-900 mx-auto bg-white dark:bg-gray-950
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