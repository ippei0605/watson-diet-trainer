/**
 * @file Watson Diet Trainer: インストール後処理 (package.json の scripts.postinstall で実行するように設定)
 *
 * <pre>
 * 1. データベース「answer」が無い場合、次の処理を実行する。
 *   1-1 データベースを作成する。
 *   1-2 設計文書を登録する。
 *   1-3 データを登録する。
 * 2. NLC の Classifier を作成する。
 * (1 と 2 は並列処理)
 * </pre>
 *
 * @author Ippei SUZUKI
 */

'use strict';

// モジュールを読込む。

const
    fs = require('fs'),
    context = require('../utils/context');

// コンテンツデータ
const CONTENT_FILENAME = 'answer.json';

// トレーニングデータ
const TRAINING_FILENAME = 'classifier.csv';

// 設計文書 Map Function: list
const MAP_LIST_FILENAME = 'list.function';

// 設計文書 (Functionは空で定義)
const DESIGN_DOCUMENT = {
    "_id": "_design/answers",
    "views": {
        "list": {
            "map": ""
        }
    }
};

// ファイルを読込む。
const readFile = (fileName) => {
    return fs.readFileSync(__dirname + '/' + fileName).toString();
};

// 設計文書を登録する。
const insertDesignDocument = (db, doc) => {
    doc.views.list.map = readFile(MAP_LIST_FILENAME);
    db.insert(doc, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('設計文書[%s]を登録しました。', doc._id);
            console.log(JSON.stringify(doc, undefined, 2));
        }
    });
};

// データを登録する。
const insertDocuments = (db) => {
    let data = JSON.parse(readFile(CONTENT_FILENAME));
    db.bulk(data, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('文書を登録しました。');
            console.log(JSON.stringify(data, undefined, 2));
        }
    });
};

// データベースを作成する。
const createDatabase = () => {
    // データベースの存在をチェックする。
    context.cloudant.db.get(context.DB_NAME, (err, body) => {
        if (err && err.error === 'not_found') {
            console.log('アプリに必要なデータベースがありません。');
            context.cloudant.db.create(context.DB_NAME, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log('データベース[%s]を作成しました。', context.DB_NAME);
                    const db = context.cloudant.db.use(context.DB_NAME);
                    insertDesignDocument(db, DESIGN_DOCUMENT);
                    insertDocuments(db);
                }
            });
        }
    });
};

// NLC の Classifier を作成する。
const createClassifier = () => {
    const params = {
        "language": "ja",
        "name": "diet-classifier",
        "training_data": fs.createReadStream(__dirname + '/' + TRAINING_FILENAME)
    };
    context.nlc.create(params, (err, response) => {
        if (err) {
            console.log(err);
        } else {
            console.log('NLC の Classifier を作成しました。(学習中)');
            console.log(response);
        }
    });
};

// 処理1
createDatabase();
// 処理2
createClassifier();
