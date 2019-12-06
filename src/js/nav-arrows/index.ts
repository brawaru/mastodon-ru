import { NavigationArrow } from "./navigationArrow";
import { scrollToY } from "./scroll";
import { debounce } from "../debounce/index";

/**
 * Количество пикселей, которое нужно проскроллить,
 * прежде, чем стрелка появится на экране
 */
const SCROLL_ARROW_THRESHOLD = 300;

const SCROLL_EVENT_DEBOUNCE = 100;

const ARROWS = {
	/**
	 * Основная стрелка
	 */
	PRIMARY: new NavigationArrow("Наверх"),
	/**
	 * Стрелка наверх
	 */
	REVERSE: new NavigationArrow("Туда, где были", true),
};

const SMOOTHLY = true;

let previousY: number | null = null;

/**
 * Функция для вызова при ошибке изменения видимости стрелки
 *
 * @param error Ошибка, которая случилась
 */
function errorStub(error: Error) {
	console.error("setArrowVisibility failed", error);
}

NavigationArrow.setOnClick(ARROWS.PRIMARY, () => {
	previousY = window.scrollY;

	scrollToY(0, SMOOTHLY);

	ARROWS.PRIMARY.setArrowVisibility(false).catch(errorStub);
	ARROWS.REVERSE.setArrowVisibility(true).catch(errorStub);
});

NavigationArrow.setOnClick(ARROWS.REVERSE, () => {
	if (previousY == null) return;

	scrollToY(previousY, SMOOTHLY);

	previousY = null;

	ARROWS.PRIMARY.setArrowVisibility(true).catch(errorStub);
	ARROWS.REVERSE.setArrowVisibility(false).catch(errorStub);
});

/**
 * Функция, вызываемая после события скролла
 *
 * @param isCold Это ручной вызов функции после загрузки
 */
async function onScroll(isCold: boolean) {
	if (window.scrollY < SCROLL_ARROW_THRESHOLD) {
		if (ARROWS.PRIMARY.isVisible) {
			await ARROWS.PRIMARY.setArrowVisibility(false, !isCold);
		}

		const reverseVisibility = previousY != null;

		if (ARROWS.REVERSE.isVisible !== reverseVisibility) {
			await ARROWS.REVERSE.setArrowVisibility(reverseVisibility, !isCold);
		}
	} else {
		if (!ARROWS.PRIMARY.isVisible) {
			await ARROWS.PRIMARY.setArrowVisibility(true, !isCold);
		}

		if (ARROWS.REVERSE.isVisible) {
			await ARROWS.REVERSE.setArrowVisibility(false, !isCold);

			previousY = null;
		}
	}
}

const scrollDebounce = debounce(onScroll, SCROLL_EVENT_DEBOUNCE);

document.addEventListener("scroll", () => scrollDebounce(false));

ARROWS.PRIMARY.mount();
ARROWS.REVERSE.mount();

onScroll(true)
	.then(
		() => console.log("scroll handled!"),
	)
	.catch(
		(error) => console.error("Cold call of onScroll event has failed", error),
	);
