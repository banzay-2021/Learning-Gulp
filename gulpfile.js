let prodject_folder = "dist";
let source_folder = "#src";

let path = {
    build: {
        html: prodject_folder + '/',
        css: prodject_folder + '/css/',
        js: prodject_folder + '/js/',
        img: prodject_folder + '/img/',
        fonts: prodject_folder + '/fonts/'
    },
    scr: {
        html: [source_folder + '/*.html', '!' + source_folder + '/_*.html'],
        css: source_folder + '/scss/style.scss',
        js: source_folder + '/js/script.js',
        img: source_folder + '/img/**/*.+(png|jpg|gif|ico|svg|webp)',
        fonts: source_folder + '/fonts/*.ttf'
    },
    watch: {
        html: source_folder + '/**/*.html',
        css: source_folder + '/scss/**/*.scss',
        js: source_folder + '/js/**/*..js',
        img: source_folder + '/img/**/*.+(png|jpg|gif|ico|svg|webp)',
    },
    clean: './' + prodject_folder + '/'
};

let {src, dest} = require('gulp'),
    gulp = require('gulp'),
    browsersync = require('browser-sync').create(),
    fileinclude = require('gulp-file-include'),
    del = require('del'),
    scss = require('gulp-sass')(require('sass')),
    autoprefixer = require('gulp-autoprefixer'),
    group_media = require('gulp-group-css-media-queries'),
    cleanCSS = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify-es').default(),
    babel = require('gulp-babel'),
    imagemin = require('gulp-imagemin'),
    webp = require('gulp-webp'),
    webphtml = require('gulp-webp-html'),
    webpcss = require('gulp-webpcss'),
    svgSprite = require('gulp-svg-sprite');


function browserSync(params) {
    browsersync.init({
        server: {
            baseDir: './' + prodject_folder + '/'
        },
        port: 3000,
        notify: false
    })
}

function html() {
    return src(path.scr.html)
        .pipe(fileinclude())
        .pipe(webphtml())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream())
}

function css() {
    return src(path.scr.css)
        .pipe(
            scss({
                outputStyle: 'expanded'
            }).on('error', scss.logError)
        )
        .pipe(
            group_media()
        )
        .pipe(
            autoprefixer({
                overrideBrowserslist: ['last 5 versions'],
                cascade: true
            })
        )
        .pipe(
            webpcss({
                webpClass: '.webp',
                noWebpClass: '.no-webp'
            })
        )
        .pipe(dest(path.build.css))
        .pipe(
            cleanCSS({
                level: 2
            })
        )
        .pipe(
            rename({
                basename: 'styles',
                suffix: '.min',
                extname: '.css'
            })
        )
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream())
}

function js() {
    return src(path.scr.js)
        .pipe(fileinclude())
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        .pipe(dest(path.build.js))
        .pipe(uglify)
        .pipe(
            rename({
                basename: 'scripts',
                suffix: '.min',
                extname: '.js'
            })
        )
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream())
}

function images() {
    return src(path.scr.img)
        .pipe(
            webp({
                quality: 70
            })
        )
        .pipe(dest(path.build.img))
        .pipe(src(path.scr.img))
        .pipe(
            imagemin({
                progressive: true,
                svgoPlugin: [{removeViewBox: false}],
                interlaced: true,
                optimizationLevel: 3
            })
        )
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream())
}

gulp.task('svgSprite', function () {
    return gulp.src([source_folder + '/iconsprite/*.svg'])
        .pipe(
            svgSprite({
                mode: {
                    stack: {
                        sprite: '../icons/icons.svg',
                        example: true,
                    }
                }
            })
        )
        .pipe(dest(path.build.img))
})

function wathcFiles(params) {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], images);
}

function clear(params) {
    return del(path.clean);
}

let build = gulp.series(clear, gulp.parallel(images, js, css, html));
let watch = gulp.parallel(build, wathcFiles, browserSync);

exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;