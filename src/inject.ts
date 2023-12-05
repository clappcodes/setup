import {
	renameSync,
	existsSync,
	readFileSync,
	writeFileSync,
	rmSync,
} from "node:fs";
import { exec } from "node:child_process";
import path from "node:path";

/**
 * Unpack app.asar & inject module script tag in index.html
 * @param appPath Application path (ex: /Applications/Crawless.app)
 * @param libFile Relative js file path (ex: app.dev/lib/ext.js)
 * @returns {string} `/Applications/Crawless.app/Contents/Resources/app.dev/lib/ext.js`
 */
export default function inject(appPath: string, libFile: string) {
	return new Promise<string>((resolve, reject) => {
		const resPath = path.resolve(appPath, "Contents/Resources/");

		const index_html_file = path.resolve(
			resPath,
			"app.asar/",
			"dist/ui/index.html"
		);
		const script_src = path.join(resPath, libFile);
		const script_type = "module";

		if (!existsSync(resPath)) {
			reject("This directory doesn't exist.");
			// process.exit(0);
		}

		if (!existsSync(_path("app.asar"))) {
			reject('This directory doesn\'t contain "app.asar".');
			// process.exit(0);
		}

		// Create a backup of the app.asar file if one doesn't already exist.
		if (!existsSync(_path("app.asar.bak"))) {
			console.log("Creating a backup of app.asar because none exists.");
			renameSync(_path("app.asar"), _path("app.asar.bak"));
			// createReadStream(_path('app.asar')).pipe(createWriteStream(_path('app.asar.bak')));
		}

		if (existsSync(_path("app.asar"))) {
			console.log("app.asar already exists. Removing it.");
			if (existsSync(_path("app.asar.old"))) {
				rmSync(_path("app.asar.old"), { recursive: true, force: true });
			}
			renameSync(_path("app.asar"), _path("app.asar.old"));
		}

		// Extract the asar file.
		exec(`asar extract ${_path("app.asar.bak")} ${_path("app.asar")}`, () => {
			let filePath = index_html_file;
			let contents = readFileSync(filePath, "utf8");

			console.log(`Processing ${index_html_file}...`);
			contents = contents.replace(
				/<title>Crawless<\/title>/,
				`<title>Crawless (dev)<\/title>\n<script type="${script_type}" src="${script_src}"></script>`
			);
			// contents = contents.replace(/script-src/, "script-src blob: 'unsafe-eval'")
			writeFileSync(filePath, contents);

			rmSync(_path("app.asar.old"), { recursive: true, force: true });

			console.log("Done", script_src);

			resolve(script_src);
		});
		function _path(to) {
			return resPath.replace(/\/+$/, "") + "/" + to.replace(/^\/+/, "");
		}
	});
}
