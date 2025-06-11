'use client'

import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'

const AnimatedLogo = () => {
    const scrollYProgress = useScroll()
    const scale = useTransform(scrollYProgress.scrollYProgress, [0, 1], [1, 0.9])

    const variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={variants}
            style={{ scale }}
            transition={{ duration: 0.5 }}
            className="w-28 h-14 flex items-center justify-center relative"
        >
            <Image src="/logo-timecontrol.png" alt="Time Control" width={128} height={128}
                className="object-contain" />
        </motion.div>
    )
}

export default AnimatedLogo