import { getMatcher } from "./matcher";

const PROPS = {
	MEDIA_VIEW_ID: "mediaViewerId",
	MEDIA_VIEW_ID_ATTR: "data-media-viewer-id",
};

const MEDIA_ID_REGEXP = /^([0-9]+-[0-9]+)$/;
const MEDIA_URL = "#/media/{id}";
const MEDIA_URL_MATCHER = getMatcher(MEDIA_URL, "id");
const MEDIA_ID_QUERY = (id: string) => `[${PROPS.MEDIA_VIEW_ID_ATTR}="${id}"]`;

/**
 * @param param0 Медиа-элемент, для которого доступен просмотрщик
 * @returns ID просмоторщика
 */
export function getMediaID({ dataset }: HTMLElement) {
	// eslint-disable-next-line
	return dataset[PROPS.MEDIA_VIEW_ID] ?? null;
}

/**
 * Создаёт ID для медиа-элемента
 *
 * @param viewerId ID просмотрщика
 * @param mediaId ID медиа
 * @returns Новосозданный крутецкий и уникальнейший ID
 * которого не соискать больше на этой планете (хотя...)
 */
export function createID(viewerId: number, mediaId: number) {
	return `${viewerId}-${mediaId}`;
}

/**
 * Устанавливает ID просмотрщика
 *
 * @param param0 Элемент медиа, для которого требуется установить ID
 * @param id ID который требуется установить
 * @throws {Error} Если ID некорректен
 */
export function setMediaID({ dataset }: HTMLElement, id: string) {
	if (!MEDIA_ID_REGEXP.test(id)) {
		throw new Error("Incorrect ID.");
	}

	dataset[PROPS.MEDIA_VIEW_ID] = id;
}

/**
 * @param media Элемент медиа, для которого доступен режим просмотра
 * @returns Ссылка для входа в режим просмотра
 */
export function getMediaURL(media: HTMLElement) {
	const id = getMediaID(media);

	if (id == null) return null;

	return MEDIA_URL.replace("{id}", id);
}

/**
 * Ищет элемент по соответствующим ID или ссылке
 *
 * @param scope Область, в которой нужно найти элемент
 * @param id ID или ссылка элемент для которых нужно найти
 * @param isUrl Представлена ли в параметре `id` ссылка
 * @returns Найденный элемент
 */
export function queryElement(scope: ParentNode, id: string, isUrl?: boolean) {
	let normalizedId: string | null = id;

	if (isUrl != null && isUrl) {
		normalizedId = MEDIA_URL_MATCHER(id);
	}

	if (normalizedId == null) return null;

	return <HTMLElement> scope.querySelector(MEDIA_ID_QUERY(normalizedId));
}
