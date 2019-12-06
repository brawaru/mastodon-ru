import { getClone } from "./cloner";
import { sleep, CancelToken } from "../sleep/index";
import * as pageState from "./pageState";
import * as mediaId from "./mediaId";

const enum Timing {
	/**
	 * Время до удаления класса скрытости после удаления
	 * свойства display. Необходимо, чтобы анимация отработала
	 * нормально; значения меньше 20мс не работают правильно :(
	 */
	RemoveHideClass = 20,
	/**
	 * Время до установки значения "none" стилю display,
	 * выдержка нужна, чтобы анимация успела проиграться (.25s)
	 */
	SetDisplayNone = 150,
	// /**
	//  * Время на которое отбрасывается событие скролла, чтобы не
	//  * закрывать оверлей двести раз, пока идёт прокрутка
	//  */
	// ScrollDebounce = 10,
}

const enum DatasetKeys {
	/**
	 * Для этого элемента не требуется встраивание его копии,
	 * наоборот, необходимо встроить произвольный код
	 */
	ArbitraryCode = "media-viewer-arbitrary",
	/**
	 * Для этого элемента не требуется убирать его изначальный размер
	 */
	KeepSizes = "media-viewer-keep-sizes",
}

let mediaViewersCount = 0;

/**
 * Медиа-элементы, которые привязаны к просмотрщикам
 */
const BOUND_ELEMENTS = new Set<HTMLElement>();

// FIXME: Вообще, может просто стоило запретить создавать более одного просмотрщика?

/**
 * MediaQueryList для проверки возможности отображать оверлей,
 * нам нужно примерно 1000px чтобы отображение просмотрщиком
 * имело всякий смысл
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList
 */
const WIDTH_MEDIA_QUERY = window.matchMedia("screen and (min-width: 1000px)");

export class MediaViewer {
	constructor() {
		const overlay = Object.assign(
			document.createElement("div"), {
				className: "media-overlay hidden",
				tabIndex: 0,
				style: "display: none",
			},
		);

		const mount = Object.assign(
			document.createElement("div"), {
				className: "media-mount",
			},
		);

		overlay.appendChild(mount);

		this._overlay = overlay;
		this._mount = mount;

		this._id = mediaViewersCount;
		mediaViewersCount += 1;

		this._nextMediaId = 0;

		this._prepareEvents();
	}

	/**
	 * Вешает обработчики для события клика и нажатий клавиш на оверлей
	 */
	private _prepareEvents() {
		const overlay = this._overlay;

		/**
		 * Обрабатывает ошибку из промиса, вызванного по событию
		 *
		 * @param promise Промис для обработки ошибки
		 * @param event Событие, которое запросило промис
		 */
		const handleErr = (promise: Promise<unknown>, event: string) => {
			promise.catch((err) => console.log(event, "event failed", err));
		};

		const closeEventHandler = (e: MouseEvent | KeyboardEvent) => {
			if (e.target !== overlay) return;
			if (e instanceof KeyboardEvent && e.key !== "Escape") return;

			e.preventDefault();

			handleErr(this.close(), e.type);
		};

		overlay.addEventListener("click", closeEventHandler);
		overlay.addEventListener("keyup", closeEventHandler);

		const notDisplayableHandler = (e: MediaQueryListEvent) => {
			if (e.matches && this._isOverlayVisible) {
				handleErr(this.close(), e.type);
			}
		};

		WIDTH_MEDIA_QUERY.addEventListener("change", notDisplayableHandler);

		this._notDisplayableHandler = notDisplayableHandler;
	}

	private _notDisplayableHandler?: (e: MediaQueryListEvent) => void;

	/**
	 * ID этого просмотрщика
	 */
	private readonly _id: number;

	/**
	 * Элемент оверлея, отображаемого поверх страницы
	 */
	private readonly _overlay: HTMLDivElement;

	/**
	 * Элемент блока, в который встраиваются медиа-элементы
	 */
	private readonly _mount: HTMLDivElement;

	/**
	 * ID следующего медиа элемента
	 */
	private _nextMediaId: number;

	/**
	 * Токен для отмены прошлого изменения состояния видимости
	 */
	private _cancelToken?: CancelToken;

	/**
	 * Текущее состояние видимости оверлея
	 */
	private _isOverlayVisible: boolean = false;

	/**
	 * Прошлое состояние страницы
	 */
	private _previousState?: pageState.IPageState;

	/**
	 * Текущий привязанный обработчик события скролла
	 */
	private _boundScroll?: () => void;

	/**
	 * @returns Отображается ли просмотрщик поверх страницы
	 */
	public get isVisible() {
		return this._isOverlayVisible;
	}

	/**
	 * Привязывает обработчик на скролл, чтобы закрывать просмотрщик
	 */
	private _bindScroll() {
		if (this._boundScroll != null) return;

		const onScroll = () => {
			this.close()
				.catch((err) => console.error("Failed to close overlay on scroll", err));
		};

		// const onScroll = debounce(onScroll, Timing.ScrollDebounce);

		this._boundScroll = onScroll;

		document.addEventListener("scroll", onScroll);
	}

	/**
	 * Убирает обработчик со скролла
	 */
	private _unbindScroll() {
		if (this._boundScroll == null) return;

		document.removeEventListener("scroll", this._boundScroll);

		this._boundScroll = undefined;
	}

	/**
	 * Устанавливает видимость просмотрщика
	 *
	 * @param isVisible Видимость просмотрщика
	 */
	private async _setOverlayVisibility(isVisible: boolean) {
		if (isVisible === this._isOverlayVisible) {
			return;
		}

		if (this._cancelToken != null) {
			console.log("prev cancel");

			this._cancelToken("Another event called.");
		}

		if (isVisible) {
			console.log("pre-class-off");
			this._overlay.style.display = "";

			await sleep(Timing.RemoveHideClass, (token) => {
				this._cancelToken = token;
			});

			console.log("post-class-off");
			this._overlay.classList.remove("hidden");
		} else {
			console.log("pre-hide");
			this._overlay.classList.add("hidden");

			await sleep(Timing.SetDisplayNone, (token) => {
				this._cancelToken = token;
			});

			console.log("post-hide");
			this._overlay.style.display = "none";

			this._mount.innerHTML = "";
		}

		this._isOverlayVisible = isVisible;

		this._cancelToken = undefined;
	}

	/**
	 * Скрывает просмотрщик
	 */
	public async close() {
		this._unbindScroll();

		await this._setOverlayVisibility(false);

		const prevState = this._previousState;

		if (prevState == null) return;

		pageState.setState(prevState);
	}

	/**
	 * Убирает прошлые размеры медиа-элемента
	 *
	 * @param media Медиа-элемент, который был склонирован
	 */
	private _voidSizes(media: HTMLElement) {
		media.style.width = "";
		media.style.height = "";
		media.removeAttribute("width");
		media.removeAttribute("height");
	}

	/**
	 * Отображает медиа-элемент в этом просмотрщике
	 *
	 * @param media Медиа-элемент, который нужно отобразить
	 */
	public async popupMedia(media: HTMLElement) {
		let parent = media.parentElement;

		let clonable: HTMLElement;

		if (parent?.tagName === "PICTURE") {
			clonable = parent;

			parent = parent.parentElement;
		} else {
			clonable = media;
		}

		this._mount.innerHTML = "";

		const arbitraryCode = media.dataset[DatasetKeys.ArbitraryCode];

		let clonedElement: HTMLElement | null = null;

		if (arbitraryCode != null) {
			this._mount.innerHTML = arbitraryCode;

			clonedElement = <HTMLElement> this._mount.firstChild!;
		} else {
			const mountable = getClone(clonable, (clone) => {
				clonedElement = clone;
			});

			this._mount.appendChild(mountable);
		}

		if (clonedElement != null && media.dataset[DatasetKeys.KeepSizes] !== "true") {
			if (clonedElement.tagName === "PICTURE") {
				clonedElement = clonedElement.querySelector("img");
			}

			if (clonedElement != null) this._voidSizes(clonedElement);
		}

		if (parent?.tagName === "FIGURE") {
			const caption = parent.querySelector("figcaption");

			if (caption != null) {
				this._mount.appendChild(
					getClone(caption),
				);
			}
		}

		this._previousState = pageState.getState();

		await this._setOverlayVisibility(true);

		this._bindScroll();

		pageState.setState({
			focusedElement: this._overlay,
			// eslint-disable-next-line
			url: mediaId.getMediaURL(media) ?? undefined,
		});
	}

	/**
	 * Привязывает медиа-элемент к этому просмотрщику
	 *
	 * @param media Медиа-элемент, который необходимо привязать
	 */
	public bindMedia(media: HTMLElement) {
		if (BOUND_ELEMENTS.has(media)) {
			throw new Error("This element is already bound to this or another viewer.");
		}

		const popMedia = (e: Event) => {
			if (!WIDTH_MEDIA_QUERY.matches) return;

			e.preventDefault();

			this.popupMedia(media)
				.catch(
					(error) => console.error(
						"click event failed for bound media element",
						error,
					),
				);
		};

		media.addEventListener("click", (e) => {
			if (e.target !== media) return;

			popMedia(e);
		});

		media.addEventListener("keyup", (e) => {
			if (e.target !== media || e.key !== "Enter") return;

			popMedia(e);
		});

		media.classList.add("media-overlay-available");

		mediaId.setMediaID(
			media,
			mediaId.createID(this._id, this._nextMediaId),
		);

		this._nextMediaId += 1;

		BOUND_ELEMENTS.add(media);
	}

	/**
	 * Встраивает просмотрщик в тело страницы
	 */
	public mount() {
		document.body.appendChild(this._overlay);
	}

	/**
	 * Убирает просмотрщик со страницы
	 */
	public destroy() {
		const notDisplayableHandler = this._notDisplayableHandler;

		if (notDisplayableHandler != null) {
			WIDTH_MEDIA_QUERY.removeEventListener("change", notDisplayableHandler);
		}

		this._overlay.remove();
	}
}

export default MediaViewer;
