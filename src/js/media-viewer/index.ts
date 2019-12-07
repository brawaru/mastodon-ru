import { queryElement } from "./mediaId";
import { debounce } from "../debounce/index";
import { MediaViewer } from "./mediaViewer";

const MEDIA_VIEWER = new MediaViewer();

const TIMINGS = {
	HASH_SCROLL_DEBOUNCE: 100,
	HASH_CHANGE_DEBOUNCE: 10,
};

/**
 * Селекторы для которых будет осуществляться привязка к просмотрщику
 */
const SELECTORS = [
	"img:not(.no-media)",
	".has-media",
];

/**
 * Функция вызываемая при изменении хэша в ссылке
 */
function onHashChange() {
	const { hash } = window.location;

	const mediaElement = queryElement(document, hash, true);

	if (mediaElement == null) {
		console.warn("Current hash contains reference to media that does not exist on the page");

		return;
	}

	mediaElement.scrollIntoView({
		block: "center",
		// behavior: "smooth",
	});

	// На всякий случай избегаем повторного вызова,
	// уж лучше преждевременно, чем неизвестно как
	let isPoppedUp = false;

	const scrollDebounce = debounce(async () => {
		if (isPoppedUp) return;

		isPoppedUp = true;

		await MEDIA_VIEWER.popupMedia(mediaElement);

		document.removeEventListener("scroll", scrollDebounce);
	}, TIMINGS.HASH_SCROLL_DEBOUNCE);

	document.addEventListener("scroll", scrollDebounce);

	// Какой-то магией мы можем оказаться прямо в эпицентре
	// событий и никакой scroll не сработает именно для
	// этого вызываем наш debounce сразу
	scrollDebounce();
}

const hashChangeDebounce = debounce(onHashChange, TIMINGS.HASH_CHANGE_DEBOUNCE);

/**
 * Функция вызываемая при готовности страницы
 */
function onReady() {
	MEDIA_VIEWER.mount();

	const mediaElements = <HTMLElement[]> <unknown> document.querySelectorAll(SELECTORS.join(","));

	for (const mediaElement of mediaElements) {
		MEDIA_VIEWER.bindMedia(mediaElement);
	}

	hashChangeDebounce();
}

window.addEventListener("hashchange", hashChangeDebounce);

// if (document.readyState === "complete" ||
// 	document.readyState === "interactive") {
// 	onReady();
// } else {
// 	document.addEventListener("ready", () => {
// 		onReady();
// 	});
// }

onReady();
