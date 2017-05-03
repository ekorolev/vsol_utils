const gulp = require("gulp");
const config = require("./config.json");
const bs = require("browser-sync").create();
const del = require("del");
const rigger = require("gulp-rigger");
const sass = require("gulp-sass");
const sourcemaps = require("gulp-sourcemaps");
const mainBowerFiles = require("main-bower-files");
const exec = require("child_process").exec;

gulp.task("js:build", function () {
	return gulp.src("src/**/*.js")
		.pipe(rigger())
		.pipe(gulp.dest("public"));
});

gulp.task("style:build", function () {
	return gulp.src("src/**/*.sass")
		.pipe(sourcemaps.init())
		.pipe(sass())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest("public"));
});

gulp.task("html:build", function () {
	return gulp.src("src/**/*.html")
		.pipe(gulp.dest("public"));
});

gulp.task("server", function (done) {
	exec("forever stopall", (err, stdout, stderr) => {
		console.log(stdout);
		exec("forever start -l ./out.log -a -w --watchDirectory /home/korolev/Development/virtlife/server/ ./server/server.js", (err, stdout, stderr) => {
			console.log(err);
			console.log(stdout);
			done();
		});
	});
});

gulp.task("browser", function () {
	bs.init({
		proxy: {
			target: "http://vsol.loc",
			ws: false
		},
		server: false,
		ghostMode: false,
		open: false,
		browser: "google chrome"
	});
});

gulp.task("clean", function () {
	return del("public");
});

gulp.task("build", gulp.series("html:build", "style:build", "js:build"));

function reloadBrowser(done) { bs.reload(); done(); };
gulp.task("watch", function () {
	gulp.watch("src/**/*.html", gulp.series("html:build", reloadBrowser ));
	gulp.watch("src/**/*.js", gulp.series("js:build", reloadBrowser ));
	gulp.watch("src/**/*.sass", gulp.series("style:build", reloadBrowser ));
});

gulp.task("default", gulp.series("clean", "build", gulp.parallel("browser", "server", "watch")));
