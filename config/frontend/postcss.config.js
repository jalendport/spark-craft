import autoprefixer from "autoprefixer";
import postcssCustomSelectors from "postcss-custom-selectors";
import postcssImport from "postcss-import";
import tailwindcss from "tailwindcss";
import tailwindcssNesting from "tailwindcss/nesting/index.js";

export default {
	plugins: [
		postcssImport(),
		postcssCustomSelectors(),
		tailwindcssNesting(),
		tailwindcss({ config: "config/frontend/tailwind.config.js" }),
		autoprefixer(),
	],
};
