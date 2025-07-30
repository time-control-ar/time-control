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
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    const renderModalContent = () => (
        <>
            {(title || showCloseButton) && (
                <div className="flex items-center justify-between px-4 md:px-6 pt-5 pb-3 sticky top-0 z-10 overflow-visible gap-3">
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
                                className={`rounded-full flex items-center justify-center h-10 w-10 custom_border`}
                                onClick={onClose}
                            >
                                <XIcon strokeWidth={2.5} className="w-4 h-4 text-gray-700 dark:text-gray-300 z-20" />
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
                    className="fixed inset-0 z-50 bg-black/5 backdrop-blur-md flex items-center justify-center overflow-hidden md:py-4"
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
                                'h-max overflow-y-auto pb-4 rounded-3xl max-h-[90vh] md:max-h-full w-[90vw] md:max-w-[750px] custom_border'} 
                            z-[9999] relative overflow-y-auto lg:overflow-y-hidden flex flex-col
                             bg-white dark:bg-black
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