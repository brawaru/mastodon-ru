// import nodeResolve from "";
// import typescript from "";
// import commonJS from "rollup-plugin-commonjs";
// import yaml from "rollup-plugin-yaml";
// import replace from "@rollup/plugin-replace";
// import license from "rollup-plugin-license";

const nodeResolve = require("rollup-plugin-node-resolve");
const typescript = require("rollup-plugin-typescript2");
const commonJS = require("rollup-plugin-commonjs");
// const yaml = require("rollup-plugin-yaml");
const minify = require("rollup-plugin-babel-minify");

const path = require("path");

const CWD = process.cwd();

const PATH = {
	ASSETS: path.join(CWD, "dist/assets/js"),
	PKG_FILE: path.join(CWD, "package.json"),
};

const pkg = require(PATH.PKG_FILE);

function getDirectoryName(fileName) {
	fileName = path.resolve(fileName);

	return path.dirname(fileName).split(path.sep).pop();
}

// function replaceExt(fileName, ext) {
// 	const extName = path.extname(fileName);
// 	const basename = path.basename(fileName, extName);

// 	return `${basename}${ext}`;
// }

function getConfig(mainFile) {
	if (mainFile == null) {
		throw new Error("Main file is not specified.");
	} else if (!path.isAbsolute(mainFile)) {
		throw new Error("Main file path must be absolute.");
	}

	const outputFile = path.join(
		PATH.ASSETS,
		`${getDirectoryName(mainFile)}.js`,
	);

	return {
		input: mainFile,
		output: [{
			file: outputFile,
			format: "iife",
		}],
		external: [
			...Object.keys(pkg.dependencies || {}),
			...Object.keys(pkg.peerDependencies || {}),
		],

		plugins: [
			nodeResolve({
				browser: true,
			}),
			typescript({
				typescript: require("typescript"),
			}),
			commonJS(),
			// yaml(),
			minify({
				comments: false,
			}),
		],

		experimentalTopLevelAwait: true,
		experimentalOptimizeChunks: true,
	};
}

module.exports = {
	getConfig,
};
