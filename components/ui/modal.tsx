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
        const bodyStyle = document.body.style;
        if (isOpen) {
            bodyStyle.overflow = 'hidden';
        } else {
            bodyStyle.overflow = 'auto';
        }
        return () => {
            bodyStyle.overflow = 'auto';
        };
    }, [isOpen]);

    const renderModalContent = () => (
        <motion.div
            initial={{ y: isMobile ? '100%' : '50%', scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: isMobile ? '100%' : '50%', scale: 0.95 }}
            transition={{
                duration: isMobile ? 0.1 : 0.2,
                ease: 'easeOut',
            }}
            onClick={(e) => e.stopPropagation()}
            className={`
                ${isMobile ?
                    'h-[95%] mt-auto w-full rounded-t-3xl pb-20 fixed' :
                    'w-full md:max-w-[700px] h-full max-h-[80%] m-auto rounded-2xl top-[1%] left-1/2 -translate-x-1/2'} 
                z-[9999] bg-white dark:bg-[#10141a] overflow-y-auto shadow-2xl flex flex-col ${className}`}
        >
            {(title || showCloseButton) && (
                <div className="flex items-center justify-between px-6 pt-6 pb-3 sticky top-0 z-10">
                    {title && (
                        <h1 className="text-gray-950 dark:text-gray-50 text-xl font-semibold tracking-tight">
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

            <div className="flex flex-col h-full overflow-y-auto">
                {children}
            </div>
        </motion.div>
    );

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <motion.div
                    onClick={onClose}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className=" top-0 left-0 z-[9998] h-full w-full bg-black/10 dark:bg-black/10 backdrop-blur-sm md:flex items-center justify-center overflow-hidden fixed"
                >
                    <div className="flex items-end justify-center w-full h-full">
                        {renderModalContent()}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default Modal;