import { ChildProcess } from "child_process";

declare global {
	/*~ Here, declare things that go in the global namespace, or augment
	 *~ existing declarations in the global namespace
	 */
	interface String {
		fancyFormat(opts: StringFormatOptions): string;
	}
	interface CLAPP {
		SCRIPT_SRC: string;
	}
}

declare module globalThis {
	export interface CLAPP {
		SCRIPT_SRC: string;
	}

	export var CLAPP: CLAPP;
}

declare module "@clapp/setup/esbuild" {
	import type { ChildProcess } from "node:child_process";
	import type { EventEmitter } from "node:events";

	export declare function run(cwd: string, args: [], events: []): ChildProcess;
	export = EventEmitter;

	declare interface EventEmitter {
		run: typeof run;
		child: ChildProcess;
	}
}
