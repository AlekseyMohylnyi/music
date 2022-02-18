/* Paths */
var path = {
    build: {
        html: "dist/",
        js: "dist/js/",
        css: "dist/css/",
        images: "dist/img/",
        fonts: "dist/fonts/"
    },
    src: {
        html: ["src/*.html", "!" + "src/_*.html"],
        js: "src/js/*.js",
        css: "src/scss/style.scss",
        images: "src/img/**/*.{jpg,png,svg,gif,ico}",
        fonts: "src/fonts/*.{woff,woff2,ttf}"
    },
    watch: {
        html: "src/**/*.html",
        js: "src/js/**/*.js",
        css: "src/scss/**/*.scss",
        images: "src/img/**/*.{jpg,png,svg,gif,ico,webp}",
        fonts: "src/fonts/**/*.*"
    },
    clean: "./dist"
}

let {src, dest} = require('gulp'),
    gulp = require('gulp'),
    browsersync = require('browser-sync').create(),
    fileinclude = require('gulp-file-include'),
    del = require('del'),
    scss = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    media = require('gulp-group-css-media-queries'),
    cleancss = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify-es').default,
    rigger = require('gulp-rigger'),
    babel = require('gulp-babel'),
    imagemin = require('gulp-imagemin');
    

function browserSync(params) {
    browsersync.init({
        server: {baseDir: "./dist"},
        port: 3000,
        notify: false
    })
}

function html() {
    return src(path.src.html)
        .pipe(fileinclude())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream())
}

function css() {
    return src(path.src.css)
        .pipe(scss({outputStyle: "expanded"}))
        .pipe(media())
        .pipe(autoprefixer({overrideBrowserslist: ['last 5 versions'], cascade: true}))
        .pipe(dest(path.build.css))
        .pipe(cleancss())
        .pipe(rename({suffix: '.min'}))
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream())
}

function js() {
    return src(path.src.js)
        .pipe(rigger())
        .pipe(babel({presets: ['@babel/preset-env']}))
        .pipe(gulp.dest(path.build.js))        
        .pipe(uglify())
        .pipe(rename({extname: ".min.js"}))
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream());
}

function images() {
    return src(path.src.images)
        .pipe(
            imagemin({
                progressive: true,
                optimizationLevel: 5,
                interlaced: true,
                svgoPlugins: [{removeViewBox: true}]
            })
        )
        .pipe(dest(path.build.images))
        .pipe(browsersync.stream())
}

function fonts() {
    return src(path.src.fonts)
        .pipe(dest(path.build.fonts))
        .pipe(browsersync.stream())
}

function watchFiles() {
    gulp.watch([path.watch.html], html),
    gulp.watch([path.watch.css], css),
    gulp.watch([path.watch.js], js),
    gulp.watch([path.watch.images], images),
    gulp.watch([path.watch.fonts], fonts)
}

function clean() {
    return del(path.clean)
}

let build = gulp.series(clean, gulp.parallel(html, css, js, images, fonts));
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.html = html;
exports.css = css;
exports.js = js;
exports.images = images;
exports.fonts = fonts;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = watch;