/**
 * @file gulpfile
 * @author Ippei SUZUKI
 */

'use strict';

// モジュールを読込む
const del = require('del');
const fs = require('fs');
const gulp = require('gulp');
const concat = require('gulp-concat');
const cleanCss = require('gulp-clean-css');
const pump = require('pump');
const context = require('./utils/context');

// 対象ソースコード
const jsSrc = ['public/dev/watson-speech.min.js', 'public/dev/index.js'];
const cssSrc = ['public/dev/mybootstrap.css', 'public/dev/chatbot.css'];

// 出力ファイル名
const jsDst = 'bundle.min.js';
const cssDst = 'bundle.min.css';

// トレーニングデータ
const TRAINING_FILENAME = './data/diet-classifier.csv';

// 設計文書 Map Function: list
const MAP_LIST_FILENAME = './data/list.function';

// 設計文書 (Functionは空で定義)
const DESIGN_DOCUMENT = {
    "_id": "_design/answers",
    "views": {
        "list": {
            "map": ""
        }
    }
};

// コンテンツデータ
const CONTENT_FILENAME = './data/diet-answer.json';

// ファイルを読込む。
const readFile = (fileName) => {
    return fs.readFileSync(__dirname + '/' + fileName).toString();
};

// タスクを定義する。
gulp.task('clean', (cb) => {
    del(['public/dist', 'public/' + jsDst, 'public/' + cssDst], cb);
});

gulp.task('js-concat', () => {
    return gulp.src(jsSrc)
        .pipe(concat(jsDst))
        .pipe(gulp.dest('public/dist'))
});

gulp.task('css', ['clean'], () => {
    return gulp.src(cssSrc)
        .pipe(concat(cssDst))
        .pipe(cleanCss({compatibility: 'ie8'}))
        .pipe(gulp.dest('public'));

});

gulp.task('nlc', () => {
    const params = {
        "language": "ja",
        "name": "diet-classifier",
        "training_data": fs.createReadStream(__dirname + '/' + TRAINING_FILENAME)
    };
    context.nlc.create(params, (err, response) => {
        if (err) {
            console.log(err);
        } else {
            console.log('NLC の Classifier を作成します。');
            console.log(response);
        }
    });
});

const insertDocs = () => {
    // データベースに接続する。
    const db = context.cloudant.db.use(context.DB_NAME);

    // 設計文書を読み込む。
    let doc = DESIGN_DOCUMENT;
    doc.views.list.map = readFile(MAP_LIST_FILENAME);

    // 設計文書を挿入する。
    db.get(doc._id, (err) => {
        if (err && err.error === 'not_found') {
            console.log('アプリに必要な設計文書がありません。');
            db.insert(doc, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log('設計文書[%s]を登録しました。', doc._id);
                    console.log(JSON.stringify(doc, undefined, 2));
                }
            });
        }
    });

    // コンテンツを読み込む。
    let data = JSON.parse(readFile(CONTENT_FILENAME));

    // コンテンツを挿入する。
    db.bulk(data, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('文書を登録しました。');
            console.log(JSON.stringify(data, undefined, 2));
        }
    });
};

gulp.task('cloudant', (cb) => {
    // データベースの存在をチェックする。
    context.cloudant.db.get(context.DB_NAME, (err, body) => {
        if (err && err.error === 'not_found') {
            console.log('アプリに必要なデータベースがありません。');
            context.cloudant.db.create(context.DB_NAME, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log('データベース[%s]を作成しました。', context.DB_NAME);
                    cb();
                }
            });
        }
    });
});

//gulp.task('default', ['clean', 'css', 'js-concat', 'nlc', 'cloudant-db', 'cloudant-design', 'cloudant-content']);
gulp.task('default', ['clean', 'css', 'js-concat']);


gulp.task('one', function (cb) {
    console.log('one');
    cb(); // if err is not null and not undefined, the run will stop, and note that it failed
});

// identifies a dependent task must be complete before this one begins
gulp.task('two', ['one'], function () {
    console.log('two');
});

gulp.task('d', ['one', 'two']);