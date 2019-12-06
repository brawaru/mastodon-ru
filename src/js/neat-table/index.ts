window.addEventListener("DOMContentLoaded", () => {
	const tables = document.getElementsByTagName("table");

	for (const table of Array.from(tables)) {
		if (table.dataset.noNeat != null) continue;

		const head = table.getElementsByTagName("thead")[0];
		const body = table.getElementsByTagName("tbody")[0];

		if (head == null || body == null) continue;

		let columns: string[];

		{
			const columnsOverride = table.dataset.neatColumns;

			if (columnsOverride != null) {
				columns = columnsOverride.split(",");
			} else {
				columns = [];

				const columnElements = table.getElementsByTagName("th");

				for (const elem of Array.from(columnElements)) {
					columns.push(elem.innerText);
				}
			}
		}

		const rows = table.getElementsByTagName("tr");

		for (const row of Array.from(rows)) {
			const values = row.getElementsByTagName("td");

			for (let i = 0, l = values.length; i < l; i += 1) {
				const value = values[i];

				if (value.dataset.column == null) {
					value.dataset.column = columns[i];
				}

				if (value.innerText === " ") {
					value.dataset.empty = "true";
				}
			}
		}
	}
});
