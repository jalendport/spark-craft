import { convertToRem } from "./_helpers";

function generateFontSize(fontSizes) {
	const fontSizeEntries = Object.entries(fontSizes);

	return fontSizeEntries.reduce(
		(acc, [name, [size, lineHeight]]) => ({
			...acc,
			[name]: [convertToRem(size), convertToRem(lineHeight * size)],
		}),
		{}
	);
}

export default generateFontSize;
