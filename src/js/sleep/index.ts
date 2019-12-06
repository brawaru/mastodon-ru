/**
 * Представляет собой функцию, отменяющую в прошлом установленный таймер
 */
export type CancelToken = (reason: string) => void;

type CancelTokenCallback = (cancel: CancelToken) => void;

/**
 * Возвращает Promise, который разрешиться по истечению
 * какого-то заданного количества времени
 *
 * @param timeout Количество времени в мс
 * @param onCancelToken Функция, которой передаётся функция отмены
 * @returns Promise, который решится по истечению времени
 */
// eslint-disable-next-line @typescript-eslint/promise-function-async
export function sleep(timeout?: number, onCancelToken?: CancelTokenCallback) {
	return new Promise((resolve, reject) => {
		// let resolved = false;

		const timer = setTimeout(() => {
			resolve();

			// resolved = true;
		}, timeout);

		if (onCancelToken == null) return;

		onCancelToken((reason) => {
			// if (resolved) {
			// 	throw new Error("This timer is already fired.");
			// }

			clearTimeout(timer);

			reject(new Error(reason));
		});
	});
}

export default sleep;
