var express = require("express");
var app = express();
var chokidar = require("chokidar");
var watcher = chokidar.watch("./app");
watcher.on("ready", function () {
	watcher.on("all", function () {
		console.log("Clearing /dist/ module cache from server");
		Object.keys(require.cache).forEach(function (id) {
			if (/[\/\\]app[\/\\]/.test(id)) delete require.cache[id];
		});
	});
});
app.use(function (req, res, next) {
	require("./app/index")(req, res, next);
});
app.listen(9000);
