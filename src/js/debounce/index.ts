type Fc = (...args: any[]) => void;

/**
 * Возвращает функцию, которая вызывается не более раза в определённом интервале
 *
 * @param func Фукнция, которую нужно обернуть
 * @param delay Интервал, в течение которого вызывается функция
 * @returns Обёрнутая функция
 */
export function debounce<F extends Fc>(func: F, delay: number) {
	let inDebounce: NodeJS.Timeout;

	return function debouncedFunction(this: ThisParameterType<F>, ...args: Parameters<F>) {
		// eslint-disable-next-line
		const context = this;

		clearTimeout(inDebounce);

		inDebounce = setTimeout(
			() => func.apply(context, args),
			delay,
		);
	};
}
