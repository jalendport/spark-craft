import { convertToRem } from "./_helpers";

function generateScreens(screenSizes) {
	const screenEntries = Object.entries(screenSizes);

	const minWidthBreakpoints = screenEntries.reduce(
		(acc, [name, width]) => ({
			...acc,
			[name]: convertToRem(width),
		}),
		{}
	);
	const maxWidthBreakpoints = screenEntries.reduce(
		(acc, [name, width]) => ({
			...acc,
			[`to-${name}`]: { max: convertToRem(width - 1) },
		}),
		{}
	);

	let prevBreakpointWidth = null;
	const onlyBreakpoints = screenEntries
		.reverse()
		.reduce((acc, [name, width]) => {
			const isFirst = prevBreakpointWidth === null;

			const key = name + "-only";
			const value = isFirst
				? { max: convertToRem(width) }
				: {
						min: convertToRem(width),
						max: convertToRem(prevBreakpointWidth - 1),
				  };

			prevBreakpointWidth = width;

			return { ...acc, [key]: value };
		}, {});

	return {
		...minWidthBreakpoints,
		...maxWidthBreakpoints,
		...onlyBreakpoints,
	};
}

export default generateScreens;
