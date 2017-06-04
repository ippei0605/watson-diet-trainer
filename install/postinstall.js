/**
 * @file Watson Diet Trainer: インストール後処理
 *
 * <pre>
 * データベース「answer」が無い場合、次の処理を実行する。
 *   1. データベースを作成する。
 *   2. 設計文書を登録する。
 *   3. データを登録する。
 * </pre>
 *
 * @author Ippei SUZUKI
 */

'use strict';

// モジュールを読込む。
const context = require('../utils/context');

// データ
const DATA_FILENAME = 'answer.json';

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
    return context.fs.readFileSync(__dirname + '/' + fileName).toString();
};

// 設計文書を登録する。
const insertDesignDocument = (db, doc) => {
    doc.views.list.map = readFile(MAP_LIST_FILENAME);
    db.insert(doc, (err) => {
        if (!err) {
            console.log('設計文書[%s]を登録しました。', doc._id);
            console.log(JSON.stringify(doc, undefined, 2));
        } else {
            console.log(err);
        }
    });
};

// データを登録する。
const insertDocument = (db) => {
    let data = JSON.parse(readFile(DATA_FILENAME));
    db.bulk(data, (err) => {
        if (!err) {
            console.log('文書を登録しました。');
            console.log(JSON.stringify(data, undefined, 2));
        } else {
            console.log(err);
        }
    });
};

// データベースを作成する。
const createDatabase = (database, doc) => {
    // データベースの存在をチェックする。
    context.cloudant.db.get(database, (err, body) => {
        if (err && err.error === 'not_found') {
            console.log('アプリに必要なデータベースがありません。');
            context.cloudant.db.create(database, (err) => {
                if (!err) {
                    console.log('データベース[%s]を作成しました。', database);
                    const db = context.cloudant.db.use(database);
                    insertDesignDocument(db, doc);
                    insertDocument(db);
                } else {
                    console.log(err);
                }
            });
        }
    });
};

createDatabase(context.DB_NAME, DESIGN_DOCUMENT);