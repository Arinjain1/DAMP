
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        "PoppinsRegular": ["PoppinsRegular"],
        "PoppinsMedium": ["PoppinsMedium"],
        "PoppinsBold": ["PoppinsBold"],
        "PoppinsSemiBold": ["PoppinsSemiBold"],
        "Karantina": ["Karantina-Regular"],
       "manrope": ["Manrope-Regular"],
        "manrope-bold": ["Manrope-Bold"],
        "manrope-semibold": ["Manrope-SemiBold"],
        "manrope-medium": ["Manrope-Medium"],
      },
    },
  },
  plugins: [],
}