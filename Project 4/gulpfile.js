var gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	minifyCSS = require('gulp-minify-css'),
	rename = require('gulp-rename'),
	imagemin = require('gulp-imagemin'),
	zopfli = require("gulp-zopfli"),
	uncss = require('gulp-uncss'),
	cmq = require('gulp-combine-media-queries'),
	htmlmin = require('gulp-htmlmin'),
	zip = require('gulp-zip'),
	imageop = require('gulp-image-optimization');

gulp.task('images', function(cb) {
    gulp.src(['src/**/*.png','src/**/*.jpg','src/**/*.gif','src/**/*.jpeg']).pipe(imageop({
        optimizationLevel: 5,
        progressive: true,
        interlaced: true
    })).pipe(gulp.dest('public/images')).on('end', cb).on('error', cb);
});

gulp.task('scripts', function() {
	gulp.src(['js/**/*.js', '!js/**/*.min.js'])
	.pipe(rename({suffix:'.min'}))
	.pipe(uglify())
	.pipe(gulp.dest('js'))
	gulp.src(['views/**/*.js', '!views/**/*.min.js'])
	.pipe(rename({suffix:'.min'}))
	.pipe(uglify())
	.pipe(gulp.dest('views'));
});

gulp.task('styles', function() {
	gulp.src(['css/*.css', '!css/*.min.css'])
	.pipe(rename({suffix:'.min'}))
	.pipe(minifyCSS())
	.pipe(gulp.dest('css'))
	gulp.src(['views/**/*.css', '!views/**/*.min.css'])
	.pipe(rename({suffix:'.min'}))
	.pipe(minifyCSS())
	.pipe(gulp.dest('views'));
});

gulp.task('jpgs', function() {
	gulp.src('img/pizzeria.jpg')
	.pipe(imagemin({progressive: true}))
	.pipe(gulp.dest('img'));
});

gulp.task('compress', function() {
    gulp.src("./dev/scripts/*.js")
    .pipe(zopfli())
    .pipe(gulp.dest("./public/scripts"));
});

gulp.task('uncss', function() {
    gulp.src('site.css')
        .pipe(uncss({
            html: ['index.html', 'posts/**/*.html', 'http://example.com']
        }))
        .pipe(gulp.dest('./out'));
});

gulp.task('cmq', function () {
  gulp.src('src/**/*.css')
    .pipe(cmq({
      log: true
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('minify', function() {
  gulp.src('src/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('dist'))
});

gulp.task('zip', function () {
    gulp.src('src/*')
        .pipe(zip('archive.zip'))
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['scripts', 'styles', 'jpgs', 'compress', 'uncss', 'cmq', 'minify', 'zip', 'images']);

module.exports = gulp;