import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const ComponentLoader = ({ children, isLoading }: { children: React.ReactNode, isLoading: boolean }) => {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={isLoading ? 'loading' : 'loaded'}
                className="flex items-center justify-center"
                animate={isLoading ? { scale: 0.95, opacity: 0.7 } : { scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}

export default ComponentLoader