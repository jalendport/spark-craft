export default {
	plugins: [
		{
			name: "preset-default",
			params: {
				overrides: {
					removeViewBox: false,
				},
			},
		},
		"removeDimensions",
		{
			name: "convertColors",
			params: {
				currentColor: /#000000|#000|black/i,
			},
		},
		{
			name: "removeAttrs",
			params: {
				attrs: "class",
			},
		},
	],
};
