const { task, src, dest, watch, parallel, series } = require("gulp");
const sass = require("gulp-sass");
const path = require("path");
const { default: run } = require("gulp-run-command");
const csso = require("gulp-csso");
const header = require("gulp-header");

sass.compiler = require("node-sass");

/**
 * Директория, в которой появляются итоговые файлы
 */
const DIST = path.join(process.cwd(), "dist", "assets");

/**
 * Название JS компонентов сайта, которые можно использовать
 */
const JS_COMPONENTS = [
	"icu-tester",
	"media-viewer",
	"nav-arrows",
	"neat-table",
];

task('sass', () => {
	return src("./src/css/**/*.scss")
		.pipe(sass.sync().on("error", sass.logError))
		.pipe(csso())
		.pipe(header("---\nlayout: null\n---\n"))
		.pipe(dest(path.join(DIST, "css")));
});

task("sass:watch", () => {
	watch("./src/css/**/*.scss", ["sass"]);
});

task("components", (done) => {
	const componentsSource = path.resolve(process.cwd(), "./src/js");
	const componentsDir = path.join(DIST, "js");

	console.log(componentsDir);

	const jobs = [];

	for (const componentName of JS_COMPONENTS) {
		const componentPath = path.join(componentsSource, componentName);
		const componentConfigPath = path.join(componentPath, "rollup.config.js");

		const componentConfig = require(componentConfigPath);

		function complileComponent() {
			// return src(componentConfiguration.input)
			// 	.pipe(rollup(componentConfiguration, componentConfiguration))
			// 	.pipe(dest(componentsDir));

			return run(`rollup -c "${componentConfigPath}"`)();
		}

		complileComponent.displayName = `components:${componentName}:compile`;

		function applyHeader() {
			const outputFile = componentConfig.output[0].file;

			return src(outputFile)
				.pipe(header("---\nlayout: null\n---\n"))
				.pipe(dest(path.dirname(outputFile)))
		}

		applyHeader.displayName = `components:${componentName}:header`;

		jobs.push(complileComponent);
		jobs.push(applyHeader);
	}

	function finalize(seriesDone) {
		seriesDone();

		done();
	}

	finalize.displayName = "components:finalize";

	return series(...jobs, finalize)();
});

task("default", parallel(["sass", "components"]));
