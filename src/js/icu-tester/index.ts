const CSS_URL = "{{ '/assets/css/icu-tester.css' | absolute_url }}";

/**
 * Возвращает ссылку на редактор ICU MessageFormat
 *
 * @param code Код, который будет отображён в редакторе
 * @returns Ссылка на редактор кода
 */
function createTestLink(code: string) {
	return `https://format-message.github.io/icu-message-format-for-translators/editor.html?m=${encodeURIComponent(code)}`;
}

// TODO: стоит ли оно вообще его пихать в отдельный файл?

/**
 * Встраивает CSS код для отображения молнии рядом со ссылкой
 */
function injectCSS() {
	const cssLink = Object.assign(
		document.createElement("link"), {
			rel: "stylesheet",
			type: "text/css",
			href: CSS_URL,
		},
	);

	document.head.appendChild(cssLink);
}

window.addEventListener("DOMContentLoaded", () => {
	const codeblocks = <HTMLElement[]> <unknown> document.querySelectorAll("code.language-icu");

	let shouldInjectCSS = false;

	for (const codeblock of codeblocks) {
		shouldInjectCSS = true;

		const a = Object.assign(
			document.createElement("a"), {
				className: "icu-test no-link-deco",
				href: createTestLink(codeblock.innerText),
				target: "_blank",
				rel: "noopenner",
			},
		);

		a.setAttribute("aria-label", "Запустить код в редакторе");

		codeblock.parentElement?.appendChild(a);

		a.appendChild(codeblock);
	}

	if (shouldInjectCSS) injectCSS();
});
