const { parallel, src, dest } = require('gulp');
const del = require('del');
const cleancss = require('gulp-clean-css');
const htmlmin = require('gulp-htmlmin');
const uglify = require('gulp-uglify-es').default;

function css() {
    return src('css/*.css')
        .pipe(cleancss())
        .pipe(dest('dist/css/'));
}

function html() {
    return src('html/*.html')
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(dest('dist/html/'));
}

function js() {
    return src('js/*.js')
        .pipe(uglify())
        .pipe(dest('dist/js/'));
}

function clean() {
    return del('dist/**')
}

exports.build = parallel(css, html, js);
exports.clean = clean;