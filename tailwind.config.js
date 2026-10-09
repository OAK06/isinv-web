/** @type {import("tailwindcss").Config} */

const defaultTheme = require("tailwindcss/defaultTheme")

module.exports = {
    content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
    darkMode: "media",
    theme: {
        extend: {
            fontFamily: {
                sans: ["Inter", "sans-serif", ...defaultTheme.fontFamily.sans],
                heading: ["Barlow Condensed", "Inter", "sans-serif", ...defaultTheme.fontFamily.sans],
            },
        },
    },
    variants: {
        extend: {
            opacity: ["disabled"],
        },
    },
    plugins: [
        require("@tailwindcss/forms"),
        require("daisyui")
    ],
	daisyui: {
		themes: [
            "light", 
            "dark", 
            "cupcake",
            {
                "balancedEnergy": {
                    "primary": "#4a90e2",
                    "secondary": "#50e3c2",
                    "accent": "#9bceff",
                    "neutral": "#3d4451",
                    "base-100": "#f7f9fc",
                    "info": "#4da6ff",
                    "success": "#6adf83",
                    "warning": "#f8b26a",
                    "error": "#ff6b6b"
                }
            },
            {
                "energizedCalm": {
                    "primary": "#6fa7c1",
                    "secondary": "#4f9db3",
                    "accent": "#e16b6e",
                    "neutral": "#a28896",
                    "base-100": "#ffffff",
                    "info": "#4da6ff",
                    "success": "#6adf83",
                    "warning": "#f8b26a",
                    "error": "#ff6b6b"
                }
            },
            {
                "gymFlyte": {
                    "primary": "#0284c7",     
                    "primary-content": "#f3f4f6",
                    "secondary": "#1F2937",
                    "secondary-content": "#f3f4f6",
                    "accent": "#fd722b",
                    "accent-content": "#161407",
                    "neutral": "#e7e7e7",
                    "neutral-content": "#1f2937",
                    "base-100": "#ffffff",
                    "base-200": "#f3f4f6",
                    "base-300": "#e5e7eb",
                    "base-content": "#1f2937",
                    "info": "#bae6fd",
                    "info-content": "#0891b2",
                    "success": "#6ee7b7",
                    "success-content": "#059669",
                    "warning": "#fde68a",
                    "warning-content": "#b45309",
                    "error": "#f87171",
                    "error-content": "#7f1d1d"
                }
            },
            {
                "gymFlyteDark": {
                    "primary": "#0284c7",
                    "primary-content": "#f3f4f6",
                    "secondary": "#0f0f0f",
                    "secondary-content": "#f3f4f6",
                    "accent": "#fd722b",
                    "accent-content": "#161407",
                    "neutral": "#404040",
                    "neutral-content": "#e5e5e5",
                    "base-100": "#262626",
                    "base-200": "#171717",
                    "base-300": "#404040",
                    "base-content": "#e5e5e5",
                    "info": "#38bdf8",
                    "info-content": "#082f49",
                    "success": "#34d399",
                    "success-content": "#064e3b",
                    "warning": "#fbbf24",
                    "warning-content": "#451a03",
                    "error": "#f87171",
                    "error-content": "#450a0a"
                }
            }
        ],
	},
}