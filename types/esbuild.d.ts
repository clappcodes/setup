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
