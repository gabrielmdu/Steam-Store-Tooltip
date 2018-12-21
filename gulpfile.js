const { parallel, src, dest, watch } = require('gulp');
const all = require('gulp-all');
const del = require('del');
const sass = require('gulp-sass');
sass.compiler = require('node-sass');
const htmlmin = require('gulp-htmlmin');
const uglify = require('gulp-uglify-es').default;
const jsonminify = require('gulp-jsonminify');
const resizer = require('gulp-images-resizer');
const rename = require('gulp-rename');

function css() {
    return src('src/sass/*.scss')
        .pipe(sass({ outputStyle: 'compressed' }))
        .pipe(dest('dist/css/'));
}

function html() {
    return src('src/html/*.html')
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(dest('dist/html/'));
}

function js() {
    return src('src/js/*.js')
        .pipe(uglify())
        .pipe(dest('dist/js/'));
}

function rsc() {
    [128, 48, 32, 16].forEach(size =>
        src('src/img/icon128.png')
            .pipe(resizer({ width: size }))
            .pipe(rename(`icon${size}.png`))
            .pipe(dest('dist/img/'))
    );

    return src('src/manifest.json')
        .pipe(jsonminify())
        .pipe(dest('dist'));
}

function vendor() {
    return src('node_modules/tippy.js/dist/tippy.all.min.js')
        .pipe(dest('dist/js/'));
}

function clean() {
    return del('dist/**');
}

function buildWatch() {
    watch('src/sass/*.scss', css);
    watch('src/html/*.html', html);
    watch('src/js/*.js', js);
    watch(['src/manifest.json', 'src/img/icon128.png'], rsc);
}

exports.build = parallel(css, html, js, rsc);
exports.vendor = vendor;
exports.clean = clean;
exports.buildWatch = buildWatch;