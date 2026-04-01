import home from "../Pages/home.js";
import WebRing from "../Pages/WebRing.js";
import PageAbstract from "../Pages/PageAbstract.js";
import ReleaseNotes from "../Pages/ReleaseNotes.js";

const Pages = new Map<string, PageAbstract>([
	["home", new home()],
	["WebRing", new WebRing()],
	["ReleaseNotes", new ReleaseNotes()],
]);


export default class PageManager {
	private static instance: PageManager;
	private currentPage: string = "home";

	private constructor() {

		const pageULR = window.location.href.split("#")[1];

		if (pageULR) {
			this.switchPage(pageULR);
		} else {
			this.switchPage(this.currentPage);
			window.history.replaceState(null, "", `#${this.currentPage}`);
		}

		const links = document.querySelectorAll("a[dest]");
		links.forEach((link) => {
			link.addEventListener("click", (e) => {
				e.preventDefault();
				const dest = link.getAttribute("dest");
				if (dest) {
					this.switchPage(dest);
				}
			});
		});

	}

	static getInstance(): PageManager {
		if (!PageManager.instance) {
			PageManager.instance = new PageManager();
		}
		return PageManager.instance;
	}

	async instantPageSwitch(pageName: string): Promise<void> {

		const oldPageInstance = Pages.get(this.currentPage);
		const newPageInstance = Pages.get(pageName);

		if (oldPageInstance == newPageInstance) {
			return;
		}

		if (!newPageInstance) {
			throw new Error(`Page "${pageName}" not found.`);
		}

		if (!oldPageInstance) {
			throw new Error(`Current page "${this.currentPage}" not found. (this should never happen)`);
		}

		oldPageInstance.hide();
		newPageInstance.show();

	}

	async switchPage(pageName: string): Promise<void> {
		const oldPageInstance = Pages.get(this.currentPage);
		const newPageInstance = Pages.get(pageName);

		if (oldPageInstance == newPageInstance) {
			return;
		}

		if (!newPageInstance) {
			throw new Error(`Page "${pageName}" not found.`);
		}

		if (!oldPageInstance) {
			throw new Error(`Current page "${this.currentPage}" not found. (this should never happen)`);
		}

		await Promise.all([
			oldPageInstance.beforeTearDown(),
			newPageInstance.beforeSwitch(),
		]);

		await oldPageInstance.hide();
		await newPageInstance.show();

		await Promise.all([
			oldPageInstance.afterTearDown(),
			newPageInstance.afterSwitch(),
		]);

		this.currentPage = pageName;
	}
}