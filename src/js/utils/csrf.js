import { httpGet } from "@js/utils/http";

/**
 * Refresh the Craft CSRF token and update any hidden token inputs in the DOM.
 * Useful when a page has sat open long enough for the token to expire.
 */
export async function refreshCsrfToken() {
	try {
		const { data } = await httpGet("/actions/users/session-info");
		if (!data?.csrfTokenValue) return;

		window.csrfTokenValue = data.csrfTokenValue;
		if (data.csrfTokenName) window.csrfTokenName = data.csrfTokenName;

		const inputs = document.querySelectorAll(
			`input[type="hidden"][name="${window.csrfTokenName}"]`
		);
		inputs.forEach((input) => {
			input.value = data.csrfTokenValue;
		});
	} catch {
		// Best-effort: a failed refresh leaves the existing token in place.
	}
}
