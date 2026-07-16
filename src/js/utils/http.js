/**
 * Minimal fetch-based HTTP helper that mimics axios's response and error shapes,
 * so call sites that use `response.data` and `error.response.data.message` keep working.
 */

async function request(
	url,
	{ method = "GET", data = null, params = null, headers = {}, responseType = "json" } = {}
) {
	const target = new URL(url, window.location.origin);
	if (params) {
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined && value !== null) {
				target.searchParams.set(key, value);
			}
		}
	}

	const init = { method, headers: { Accept: "application/json", ...headers } };

	if (data instanceof FormData) {
		init.body = data;
	} else if (data !== null && data !== undefined) {
		init.headers["Content-Type"] =
			init.headers["Content-Type"] || "application/json";
		init.body = typeof data === "string" ? data : JSON.stringify(data);
	}

	let response;
	try {
		response = await fetch(target, init);
	} catch (networkError) {
		const err = new Error(networkError.message || "Network error");
		err.isNetworkError = true;
		throw err;
	}

	let body = null;
	if (response.ok && responseType === "blob") {
		body = await response.blob();
	} else {
		const contentType = response.headers.get("content-type") || "";
		if (contentType.includes("application/json")) {
			try {
				body = await response.json();
			} catch {
				body = null;
			}
		} else {
			const text = await response.text();
			body = text === "" ? null : text;
		}
	}

	if (!response.ok) {
		const err = new Error(
			body?.message ||
				(typeof body === "string" ? body : `HTTP ${response.status}`)
		);
		err.response = { data: body, status: response.status };
		throw err;
	}

	return { data: body, status: response.status, headers: response.headers };
}

export function httpGet(url, config = {}) {
	return request(url, { ...config, method: "GET" });
}

export function httpPost(url, data, config = {}) {
	return request(url, { ...config, method: "POST", data });
}
