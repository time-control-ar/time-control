import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
 darkMode: ["class"],
 content: [
  "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  "./components/**/*.{js,ts,jsx,tsx,mdx}",
  "./app/**/*.{js,ts,jsx,tsx,mdx}",
 ],
 theme: {
  extend: {
   colors: {
    cblack: "#181818",
    cgray: "#212325",
    cwhite: "#F3F4F6",
    cblue: "#3B82F6",
    cgreen: "#10B981",
    cred: "#EF4444",
    cyellow: "#F59E0B",
   },
  },
 },
 plugins: [tailwindcssAnimate],
} satisfies Config;
