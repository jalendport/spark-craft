import { reactive } from "vue";
import { lock, unlock } from "@js/utils/body-scroll-lock.js";

export const store = reactive({
	isMobileMenuOpen: false,
	openModal: null,
	modalConfig: {},
});

export const mutations = {
	toggleMobileMenu() {
		store.isMobileMenuOpen = !store.isMobileMenuOpen;
		if (store.isMobileMenuOpen) {
			lock();
		} else {
			unlock();
		}
	},
	openModal(id, config = {}) {
		if (store.openModal === null) {
			lock();
		}
		store.modalConfig = config;
		store.openModal = id;
	},
	closeModal(id) {
		if (id && id !== store.openModal) {
			return;
		}
		if (store.openModal !== null) {
			unlock();
		}
		store.openModal = null;
		store.modalConfig = {};
	},
};
