import * as fs from "fs";
import path from "path";

export async function symlink(appPath, libPath = "app.dev/lib") {
	if (!fs.existsSync(appPath)) {
		throw new Error(`App not found at: ${appPath}`);
	}
	// @ts-ignore
	const target = CLAPP_SRC_PATH;
	const dest = path.resolve(appPath, "Contents/Resources", libPath);
	if (!fs.existsSync(dest)) {
		fs.mkdirSync(dest, { recursive: true });
	}
	const linkPath = path.resolve(dest, path.dirname(target));

	if (!fs.existsSync(linkPath)) {
		fs.symlinkSync(target, linkPath, "dir");
	}
	const isDirectory = fs.statSync(linkPath).isDirectory();

	console.log("result", { target, linkPath, isDirectory });
}
