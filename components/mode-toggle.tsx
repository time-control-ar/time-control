"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ModeToggle() {
    const { setTheme, theme } = useTheme()

    return (
        <button
            className="dark:bg-gray-950 bg-white rounded-[20px] h-10 w-10 transition-all duration-75 focus:ring-0 focus:outline-none sm:hover:opacity-80 flex items-center justify-center" onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
            <Sun className="h-6 w-6 hidden dark:block dark:text-gray-100" />
            <Moon className="h-6 w-6 block dark:hidden text-gray-900 dark:text-gray-100" />
            <p className="sr-only">Tema</p>
        </button>
    )
}
