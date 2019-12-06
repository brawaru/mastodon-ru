const CLONES_MAP = new WeakMap<HTMLElement, HTMLElement>();

/**
 * Представляет собой обработчик после первого клонирования элемента
 *
 * @param element Новый, склонированный элемент
 */
type PostCloneCallback<EL extends HTMLElement> = (element: EL) => void;

/**
 * Клонирует элемент и сохраняет его для дальнейшего возврата
 * при вызове этой функции с тем же элементом
 *
 * @param element Элемент, для которого требуется копия
 * @param postClone Обработчик, который вызывается после клонирования
 * @returns Склонированный элемент
 */
export function getClone<E extends HTMLElement>(element: E, postClone?: PostCloneCallback<E>) {
	let clone = CLONES_MAP.get(element);

	if (clone == null) {
		clone = <E> element.cloneNode(true);

		CLONES_MAP.set(element, clone);

		if (postClone != null) {
			// eslint-disable-next-line
			postClone(<any> clone);
		}
	}

	return clone;
}
