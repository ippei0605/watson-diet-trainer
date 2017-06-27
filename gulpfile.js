// モジュールを読込む
const del = require('del');
const gulp = require('gulp');
const concat = require('gulp-concat');
const cleanCss = require('gulp-clean-css');

// 対象ソースコード
const jsSrc = ['public/dev/watson-speech.min.js', 'public/dev/index.js'];
const cssSrc = ['public/dev/mybootstrap.css', 'public/dev/chatbot.css'];

// 出力ファイル名
const jsDst = 'bundle.min.js';
const cssDst = 'bundle.min.css';

// タスクを定義する。
gulp.task('clean', (cb) => {
    del(['public/dist', 'public/' + jsDst, 'public/' + cssDst], cb);
});

gulp.task('js-concat', () => {
    return gulp.src(jsSrc)
        .pipe(concat(jsDst))
        .pipe(gulp.dest('public/dist'))
});

gulp.task('css', () => {
    return gulp.src(cssSrc)
        .pipe(concat(cssDst))
        .pipe(cleanCss({compatibility: 'ie8'}))
        .pipe(gulp.dest('public'));
});

gulp.task('default', ['clean', 'css', 'js-concat']);