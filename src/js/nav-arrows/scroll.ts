/**
 * Проскролливает к нужной кординате Y
 *
 * @param newY Координата по Y к которой нужно перейти
 * @param smoothly Должен ли переход к координате быть плавным
 */
export function scrollToY(newY: number, smoothly: boolean = false) {
	if (smoothly) {
		window.scroll({
			behavior: "smooth",
			top: newY,
		});

		return;
	}

	window.scroll(window.scrollX, newY);
}
