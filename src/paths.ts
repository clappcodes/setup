import * as fs from "fs";
import path from "path";

export function symlink(appPath: string, libPath = "app.dev/lib") {
	if (!fs.existsSync(appPath)) {
		throw new Error(`App not found at: ${appPath}`);
	}
	// @ts-ignore
	const target = CLAPP_SRC_PATH;
	const parsed = path.parse(target);

	const dest = path.resolve(appPath, "Contents/Resources/", libPath);
	const linkPath = path.resolve(dest, parsed.name);

	if (!fs.existsSync(dest)) {
		fs.mkdirSync(dest, { recursive: true });
	}

	if (!fs.existsSync(linkPath)) {
		fs.symlinkSync(target, linkPath, "dir");
	}
	const isDirectory = fs.statSync(linkPath).isDirectory();

	return { target, linkPath, isDirectory };
}

// export function init(force = false) {
// 	const { devPath, libPath, proPath, srcPath } = props;

// 	if (force || !fs.existsSync(props.devPath)) {
// 		fs.mkdirSync(props.libPath, { recursive: true });
// 		fs.mkdirSync(props.proPath, { recursive: true });

// 		fs.writeFileSync(
// 			path.resolve(props.devPath, "index.html"),
// 			`
//       <script>var _es = new EventSource('/esbuild').addEventListener('change', (e) => console.log(e.data))</script>
//       <h1>crawless (ext) app</h1><pre>${JSON.stringify(props, null, 2)}</pre>`
// 		);

// 		// create empty entry points
// 		fs.writeFileSync(props.libFile("main.ts"), ``);
// 		fs.writeFileSync(props.proFile("main.ts"), ``);

// 		console.log("[app] [init]", { devPath, libPath, proPath, srcPath });
// 	}

// 	console.log("[app] [paths]", { devPath, libPath, proPath, srcPath });

// 	// copy app & run files
// 	// fs.copyFileSync(props.srcFile('app.js'), props.libFile('app.js'))
// 	// fs.copyFileSync(props.srcFile('run.js'), props.libFile('run.js'))

// 	// console.log('[app] synced!', [
// 	//   props.libFile('app.js'),
// 	//   props.libFile('run.js'),
// 	// ])
// }
