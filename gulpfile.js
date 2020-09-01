const { parallel, series, src, dest, watch } = require('gulp');
const concat = require('gulp-concat');
const del = require('del');
const fonts = require('gulp-google-webfonts');
const htmlmin = require('gulp-htmlmin');
const jsonminify = require('gulp-jsonminify');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const resizer = require('gulp-images-resizer');
const sass = require('gulp-sass');
sass.compiler = require('node-sass');
const svg2png = require('gulp-svg2png');
const terser = require('gulp-terser');

function css() {
    return src([
        'src/sass/steamstoretooltip.scss',
        'src/sass/options.scss'
    ])
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
        .pipe(terser())
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

function vendorSstJs() {
    return src([
        'node_modules/popper.js/dist/umd/popper.min.js',
        'node_modules/tippy.js/umd/index.all.min.js',
        'node_modules/@glidejs/glide/dist/glide.min.js'
    ])
        .pipe(terser({ output: { comments: false } }))
        .pipe(concat('vendor-sst.js'))
        .pipe(dest('dist/js/'));
}

function vendorSstCss() {
    return src([
        'node_modules/@glidejs/glide/dist/css/glide.core.min.css',
        'node_modules/@glidejs/glide/dist/css/glide.theme.min.css'
    ])
        .pipe(concat('vendor-sst.css'))
        .pipe(dest('dist/css/'));
}

function vendorSstFontCreate() {
    return src('src/fonts.list')
        .pipe(fonts())
        .pipe(dest('dist/font/'));
}

function vendorSstFontCompress() {
    return src('dist/font/fonts.css')
        .pipe(replace('url(', "url(chrome-extension://__MSG_@@extension_id__/font/"))
        .pipe(sass({ outputStyle: 'compressed' }))
        .pipe(dest('dist/font/'));
}

function vendorOptionsJs() {
    return src([
        'node_modules/nouislider/distribute/nouislider.min.js'
    ])
        .pipe(terser({ output: { comments: false } }))
        .pipe(concat('vendor-options.js'))
        .pipe(dest('dist/js/'));
}

function vendorOptionsCss() {
    return src([
        'node_modules/nouislider/distribute/nouislider.min.css'
    ])
        .pipe(concat('vendor-options.css'))
        .pipe(dest('dist/css/'));
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
exports.vendor = parallel(vendorSstJs, vendorSstCss, series(vendorSstFontCreate,
    vendorSstFontCompress), vendorOptionsJs, vendorOptionsCss);
exports.clean = clean;
exports.buildWatch = buildWatch;