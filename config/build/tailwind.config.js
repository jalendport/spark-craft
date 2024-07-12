import defaultTheme from "tailwindcss/defaultTheme";
import colors from "tailwindcss/colors";
import plugin from "tailwindcss/plugin";
import fluid, { extract } from "fluid-tailwind";
import forms from "@tailwindcss/forms";
import { convertToRem, generateSteps } from "./tailwind-plugins/_helpers";
import generateFontSize from "./tailwind-plugins/fontSize";
import generateScreens from "./tailwind-plugins/screens";

/** @type {import('tailwindcss').Config} */
export default {
	important: "#app",
	content: {
		files: ["./src/templates/**/*.twig", "./src/js/**/*.{js,vue}"],
		safelist: [],
		extract,
	},
	theme: {
		extend: {},
		colors: {
			transparent: "transparent",
			current: "currentColor",
			black: "#000",
			white: "#fff",
			gray: colors.neutral,
		},
		fluid: ({ theme }) => ({
			defaultScreens: [theme("screens.sm"), theme("screens.xl")],
		}),
		fontFamily: {
			display: [...defaultTheme.fontFamily.serif],
			sans: [...defaultTheme.fontFamily.sans],
			serif: [...defaultTheme.fontFamily.serif],
		},
		fontSize: {
			...generateFontSize({
				14: [14, 1.6],
				16: [16, 1.5],
				18: [18, 1.5],
				20: [20, 1.5],
				22: [22, 1.5],
				24: [24, 1.4],
				26: [26, 1.4],
				28: [28, 1.3],
				30: [30, 1.3],
				32: [32, 1.2],
				34: [34, 1.2],
				48: [48, 1.2],
			}),
		},
		screens: {
			...generateScreens({
				tiny: 375,
				xs: 560,
				sm: 640,
				md: 768,
				lg: 1024,
				xl: 1280,
				"2xl": 1536,
			}),
		},
		spacing: {
			0: "0px",
			...generateSteps(1, 10, 1, (val) => convertToRem(val)),
			...generateSteps(1, 30, 2, (val) => convertToRem(val)),
			...generateSteps(1, 100, 5, (val) => convertToRem(val)),
			...generateSteps(1, 300, 10, (val) => convertToRem(val)),
			...generateSteps(1, 500, 25, (val) => convertToRem(val)),
			...generateSteps(1, 800, 50, (val) => convertToRem(val)),
			...generateSteps(1, 2000, 100, (val) => convertToRem(val)),
		},
	},
	plugins: [
		fluid,
		forms,
		plugin(function ({ addVariant }) {
			addVariant("hover/focus", ["&:hover", "&:focus"]);
		}),
	],
};
