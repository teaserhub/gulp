const { series, src, dest, parallel, watch } = require("gulp");
const htmlmin = require("gulp-html-minifier");
const uglify = require("gulp-uglify-es").default;
const sass = require("gulp-sass")(require("sass"));
const gcmq = require("gulp-group-css-media-queries");
const postcss = require("gulp-postcss");
const autoprefixer = require("gulp-autoprefixer");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const sourcemaps = require("gulp-sourcemaps");
const rename = require("gulp-rename");
const del = require("del");
const pug = require("gulp-pug");
const bs = require("browser-sync").create();

const srcPath = "src/";
const wwwPath = "www/";

const path = {
  build: {
    html: `${wwwPath}`,
    js: `${wwwPath}js`,
    css: `${wwwPath}css`,
  },
  src: {
    html: `${srcPath}pug/pages/**/*.pug`,
    js: `${srcPath}js/*.js`,
    css: `${srcPath}scss/*.scss`,
  },
  watch: {
    html: `${srcPath}pug/pages/**/*.pug`,
    js: `${srcPath}**/*.js`,
    css: `${srcPath}**/*.scss`,
  },
  clean: wwwPath,
  srcPath: srcPath,
  wwwPath: wwwPath,
};

// html
// const pages = () => {
//   return (
//     src(path.src.html)
//       .pipe(fileinclude())
//       // .pipe(htmlmin({collapseWhitespace: true}))
//       .pipe(dest(path.build.html))
//       .pipe(bs.stream())
//   );
// };

// pug
const pages = () => {
  return (
    src(path.src.html)
    .pipe(
      plumber({
        errorHandler: notify.onError(function (err) {
          return {
            title: "Pug",
            sound: false,
            message: err.message,
          };
        }),
      })
    )
      .pipe(pug({
        pretty: true
      }))
      // .pipe(htmlmin({collapseWhitespace: true}))
      .pipe(dest(path.build.html))
      .pipe(bs.stream())
  );
};
exports.pages = pages;

// js
const scripts = () => {
  return src(path.src.js)
    .pipe(uglify())
    .pipe(rename("script.minimum.js"))
    .pipe(dest(path.build.js))
    .pipe(bs.stream());
};
exports.scripts = scripts;

// css
const styles = () => {
  return (
    src(path.src.css)
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
      .pipe(
        sass({
          indentType: "tab",
          indentWidth: 1,
          outputStyle: "expanded",
        })
      )
      .pipe(gcmq())
      .pipe(autoprefixer(["last 15 versions"]))
      .pipe(sourcemaps.write())
      // .pipe(rename('style.min.css'))
      .pipe(dest(path.build.css))
      .pipe(bs.stream())
  );
};
exports.styles = styles;

// browser-sync
const server = () => {
  bs.init({
    server: path.wwwPath,
  });
};
exports.server = server;

const watchers = () => {
  watch(path.watch.css, styles);
  watch(path.watch.html, pages);
  watch(path.watch.js, scripts);
};

const clean = () => {
  return del(path.clean);
};

const build = series(clean, parallel(server, pages, scripts, styles, watchers));

exports.build = build;

exports.default = series(
  clean,
  parallel(server, pages, scripts, styles, watchers)
);
