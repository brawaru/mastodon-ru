/**
 * Вытаскивает определённый параметр, следуя заданному формату
 *
 * @param format Формат поступаемых значений
 * @param param Параметр, который требуется вытащить
 * @returns Функция, которая вытаскивает параметр
 */
export function getMatcher(format: string, param: string) {
	const [start, end] = format.split(`{${param}}`);

	const startLength = start.length;
	const endLength = end === "" ? undefined : -end.length;

	return function matcher(value: string) {
		console.log("match value", value, "to", [start, end]);

		if (!value.startsWith(start)) return null;

		// eslint-disable-next-line @typescript-eslint/no-magic-numbers
		if (end !== "" && !value.endsWith(end)) return null;

		return value.slice(startLength, endLength);
	};
}

export default getMatcher;
