const { series, src, dest, parallel, watch } = require("gulp");
const htmlmin = require("gulp-html-minifier");
const uglify = require("gulp-uglify-es").default;
const sass = require("gulp-sass")(require("sass"));
const postcss = require("gulp-postcss");
const autoprefixer = require("gulp-autoprefixer");
const plumber = require("gulp-plumber"); // Отслеживание ошибок
const notify = require("gulp-notify");
const sourcemaps = require("gulp-sourcemaps");
const fileinclude = require("gulp-file-include");
const rename = require("gulp-rename");
const del = require("del");
const bs = require("browser-sync").create();

// html
const pages = () => {
  return (
    src("src/*.html")
      .pipe(fileinclude())
      // .pipe(htmlmin({collapseWhitespace: true}))
      .pipe(dest("www/"))
      .pipe(bs.stream())
  );
};
exports.pages = pages;

// js
const scripts = () => {
  return src("src/js/script.js")
    .pipe(uglify())
    .pipe(rename("script.min.js"))
    .pipe(dest("www/js/"))
    .pipe(bs.stream());
};
exports.scripts = scripts;

// css
const styles = () => {
  return (
    src("src/scss/style.scss")
      .pipe(
        plumber({
          errorHandler: notify.onError(function (err) {
            return {
              title: "Styles",
              sound: false,
              message: err.message,
            };
          }),
        })
      )
      .pipe(sourcemaps.init())
      .pipe(sass())
      .pipe(autoprefixer(["last 15 versions"]))
      .pipe(sourcemaps.write())
      // .pipe(rename('style.min.css'))
      .pipe(dest("www/css"))
      .pipe(bs.stream())
  );
};
exports.styles = styles;

// browser-sync
const server = () => {
  bs.init({
    server: "./www",
  });
};
exports.server = server;

const watchers = () => {
  watch("src/**/*.scss", styles);
  watch("src/**/*.html", pages);
};

const clean = () => {
  return del("www/");
};

const build = series(clean, parallel(pages, scripts, styles));

exports.build = build;

exports.default = parallel(server, pages, scripts, styles, watchers);
