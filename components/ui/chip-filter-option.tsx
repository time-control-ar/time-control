'use client'

import { motion } from "framer-motion"
import { CheckIcon } from "lucide-react"

interface ChipFilterOptionProps {
    type: {
        value: string
        name: string
    }
    isSelected: boolean
    handleCategoryToggle: (value: string) => void
    index: number
}

const ChipFilterOption = ({ type, isSelected, handleCategoryToggle, index }: ChipFilterOptionProps) => {
    return (
        <motion.button
            type='button'
            key={`${type.value}-${index}`}
            className={`chip_filter max-w-max ${isSelected ? "" : "opacity-50"}`}
            onClick={() => handleCategoryToggle(type.value)}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
            <div className="rounded-xl p-1 h-5 w-5 bg-gray-100 dark:bg-cgray flex items-center justify-center transition-all duration-75">
                {isSelected && (
                    <div>
                        <CheckIcon className="w-4 h-4 text-green-500 dark:text-green-500" />
                    </div>
                )}

            </div>
            <p className={`text-xs font-medium ${isSelected ? "text-gray-950 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>
                {type.name}
            </p>
        </motion.button>
    )
}

export default ChipFilterOption