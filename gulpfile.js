/**
 * @file gulpfile
 * @author Ippei SUZUKI
 */

'use strict';

// モジュールを読込む
const
    del = require('del'),
    fs = require('fs'),
    gulp = require('gulp'),
    concat = require('gulp-concat'),
    cleanCss = require('gulp-clean-css');

// 対象ソースコード
const
    jsSrc = ['public/dev/watson-speech.min.js', 'public/dev/index.js'],
    cssSrc = ['public/dev/mybootstrap.css', 'public/dev/chatbot.css'];

// 出力ファイル名
// JavaScript の最小化 は gulp プラグインではできないため結合まで。外部で babili コマンドにより最小化する。
const
    jsDst = 'bundle.js',
    cssDst = 'bundle.min.css';

// タスクを定義する。
gulp.task('clean', (cb) => {
    return del(['public/dist', 'public/' + jsDst, 'public/' + cssDst], cb);
});

gulp.task('js-concat', ['clean'], () => {
    return gulp.src(jsSrc)
        .pipe(concat(jsDst))
        .pipe(gulp.dest('public/dist'));
});

gulp.task('css', ['clean'], () => {
    return gulp.src(cssSrc)
        .pipe(concat(cssDst))
        .pipe(cleanCss({compatibility: 'ie8'}))
        .pipe(gulp.dest('public'));

});

gulp.task('default', ['clean', 'css', 'js-concat']);
