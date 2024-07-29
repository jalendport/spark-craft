const rootFontSize = 16;

function convertToRem(pixelValue) {
	let calc = pixelValue / rootFontSize;
	return calc.toFixed(10) + "rem";
}

function generateSteps(start, end, multiple = 1, callback = null) {
	let steps = {};
	const values = Array.from(
		new Array(end - start + 1),
		(v, k) => k + start
	).filter((n) => n % multiple === 0);
	values.forEach((val) => {
		steps[val] = callback ? callback(val) : val;
	});
	return steps;
}

export { convertToRem, generateSteps };
