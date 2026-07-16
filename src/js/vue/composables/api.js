import { httpPost } from "@js/utils/http";

/**
 * A helper that adds the csrf token and Accept header to the request.
 * @param {string} action
 * @param {object} data
 * @returns {Promise<{data:any,status:number,headers:Headers}>}
 * @throws {Error}
 */
export async function postAction(action = "", data = {}) {
	const payload = {
		[window.csrfTokenName]: window.csrfTokenValue,
		...data,
	};

	try {
		return await httpPost(`/actions/${action}`, payload);
	} catch (error) {
		throw new Error(
			error.response?.data?.message || error.message || "An error occurred."
		);
	}
}
