/**
 * Представляет собой объект состояния страницы
 */
export interface IPageState {
	/**
	 * Элемент, который был в фокусе до открытия оверлея
	 */
	focusedElement?: HTMLElement;

	/**
	 * Ссылка, которая была в адресной строке до открытия оверлея
	 */
	url?: string;
}

/**
 * Возвращает текущее состояние страницы
 *
 * @returns Текущее состояние страницы
 */
export function getState(): IPageState {
	return {
		// eslint-disable-next-line
		focusedElement: <HTMLElement | undefined> (document.activeElement ?? undefined),
		url: window.location.href,
	};
}

/**
 * Устанавливает новое состояние страницы
 *
 * @param state Состояние для установки
 */
export function setState(state: IPageState) {
	if (state.url != null) {
		window.history.pushState(
			undefined,
			document.title,
			state.url,
		);
	}

	state.focusedElement?.focus();
}
