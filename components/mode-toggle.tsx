"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ModeToggle() {
    const { setTheme, theme } = useTheme()

    return (
        <button
            type="button"
            className="custom_button transition-all rounded-full flex items-center justify-center active:scale-95 active:rotate-45 duration-100"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
            <Sun className="h-5 w-5 hidden dark:block dark:text-gray-100" />
            <Moon className="h-5 w-5 block dark:hidden text-gray-900 dark:text-gray-100" />
            <p className="sr-only">Tema</p>
        </button>
    )
}
