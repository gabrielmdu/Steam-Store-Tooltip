const { parallel, series, src, dest, watch } = require('gulp');
const del = require('del');
const sass = require('gulp-sass');
sass.compiler = require('node-sass');
const htmlmin = require('gulp-htmlmin');
const uglify = require('gulp-uglify-es').default;
const jsonminify = require('gulp-jsonminify');
const resizer = require('gulp-images-resizer');
const rename = require('gulp-rename');
const svg2png = require('gulp-svg2png');

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

function rscSvg() {
    return src('src/img/icon.svg', { allowEmpty: true })
        .pipe(svg2png({ width: '128' }))
        .pipe(rename('icon128.png'))
        .pipe(dest('dist/img/'));
}

function rscResize(done) {
    [48, 32, 16].forEach(size =>
        src('dist/img/icon128.png')
            .pipe(resizer({ width: size }))
            .pipe(rename(`icon${size}.png`))
            .pipe(dest('dist/img/')));
    
    done();
}

function rscJson() {
    return src('src/*.json')
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
    watch('src/img/icon.svg', series(rscSvg, rscResize));
    watch('src/*.json', rscJson);
}

exports.build = parallel(css, html, js, series(rscSvg, rscResize), rscJson);
exports.vendor = vendor;
exports.clean = clean;
exports.buildWatch = buildWatch;