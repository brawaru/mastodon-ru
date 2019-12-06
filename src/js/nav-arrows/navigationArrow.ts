import { sleep, CancelToken } from "../sleep/index";

const TIMINGS = {
	TOGGLE_OFF_HIDDING_CLASS: 10,
	SET_DISPLAY_NONE: 150,
};

export const enum ArrowClass {
	/**
	 * Это стрелка, вау!
	 */
	Base = "floating-up-link",
	/**
	 * Эта стрелка скрыта
	 */
	IsHidden = "hidden",
	/**
	 * Это стрелка в обратном направлении (вниз)
	 */
	IsReverse = "reverse",
	/**
	 * Это объект содержимого стрелки вообще-то
	 */
	Inside = "inside",
}

const DEFAULT_CLASS = `no-link-deco ${ArrowClass.Base} ${ArrowClass.IsHidden}`;

export class NavigationArrow {
	constructor(initialLabel?: string, isReverse: boolean = false) {
		const arrow = Object.assign(
			document.createElement("a"), {
				className: DEFAULT_CLASS,
				href: "#",
				style: "display: none",
			},
		);

		if (isReverse) arrow.classList.add(ArrowClass.IsReverse);

		const labelElem = Object.assign(
			document.createElement("div"), {
				className: ArrowClass.Inside,
			},
		);

		arrow.appendChild(labelElem);

		this._arrow = arrow;

		this._label = labelElem;

		if (initialLabel != null) this.setLabel(initialLabel);
	}

	/**
	 * Сам элемент навигационной стрелки
	 */
	private readonly _arrow: HTMLAnchorElement;

	/**
	 * Надпись внутри стрелки
	 */
	private readonly _label: HTMLDivElement;

	/**
	 * Скрыта ли стрелка в настоящий момент
	 */
	private _isVisible: boolean = false;

	/**
	 * Токен отмены прошлого изменения состояния
	 */
	private _cancelToken?: CancelToken;

	/**
	 * @returns Отображается ли стрелка в данный момент на экране
	 */
	public get isVisible() {
		return this._isVisible;
	}

	/**
	 * Устанавливает видимость стрелки
	 *
	 * @param isVisible Должна ли стрелка отображаться на экране
	 * @param animate Должны ли быть соблюдены выдержки чтобы проигрались анимации
	 */
	public async setArrowVisibility(isVisible: boolean, animate = true) {
		if (this._isVisible === isVisible) return;

		if (this._cancelToken != null) {
			this._cancelToken("Another event called.");
		}

		const arrow = this._arrow;

		if (isVisible) {
			arrow.style.display = "";

			if (!animate) {
				await sleep(TIMINGS.TOGGLE_OFF_HIDDING_CLASS, (token) => {
					this._cancelToken = token;
				});
			}

			arrow.classList.remove(ArrowClass.IsHidden);
		} else {
			arrow.classList.add(ArrowClass.IsHidden);

			if (animate) {
				await sleep(TIMINGS.SET_DISPLAY_NONE, (token) => {
					this._cancelToken = token;
				});
			}

			arrow.style.display = "none";
		}

		this._isVisible = isVisible;
	}

	/**
	 * Устанавливает текст внутри стрелки
	 *
	 * @param text Текст для установки
	 */
	public setLabel(text: string) {
		this._label.innerText = text;
	}

	/**
	 * Встраивает стрелку в тело странице
	 */
	public mount() {
		document.body.appendChild(this._arrow);
	}

	/**
	 * Устанавливает обработчик клика по стрелке
	 *
	 * @param arrow Стрелка для которой нужно установить обработчик
	 * @param handler Обработчик клика по стрелке
	 */
	public static setOnClick(arrow: NavigationArrow, handler: (e: MouseEvent) => void) {
		// eslint-disable-next-line no-underscore-dangle
		arrow._arrow.addEventListener("click", (e) => {
			e.preventDefault();

			handler(e);
		});
	}
}

export default NavigationArrow;
