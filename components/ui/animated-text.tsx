"use client"

import * as React from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

export function AnimatedText({ text = 'Typing Effect', className, delay = 0 }: { text: string, className?: string, delay?: number }) {
    const ref = React.useRef(null);
    const isInView = useInView(ref, { once: true });
    return (
        <h2
            ref={ref}
            className={cn("text-lg text-center sm:text-2xl font-black tracking-tighter md:text-6xl md:leading-[4rem] select-none font-inter", className)}
        >
            {text.split('').map((letter, index) => (
                <motion.span
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.2, delay: index * 0.1 + delay }}
                >
                    {letter}
                </motion.span>
            ))}
        </h2>
    );
}