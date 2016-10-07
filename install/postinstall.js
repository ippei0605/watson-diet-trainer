/**
 * @file Watson Diet Trainer: インストール後処理
 *
 * <pre>
 * ・データベース「answer」が無い場合、
 *   - データベースを作成する。
 *   - 設計文書を登録する。
 *   - データを登録する。
 * </pre>
 *
 * @author Ippei SUZUKI
 */

// モジュールを読込む。
var context = require('../utils/context');

// データ
var DATA_FILENAME = 'answer.json';

// 設計文書 Map Function: list
var MAP_LIST_FILENAME = 'list.function';

// 設計文書 (Functionは空で定義)
var DESIGN_DOCUMENT = {
    "_id": "_design/answers",
    "views": {
        "list": {
            "map": ""
        }
    }
};

// ファイルを読込む。
var readFunction = function (fileName) {
    return context.fs.readFileSync(__dirname + '/' + fileName).toString();
};

// 設計文書を登録する。
var insertDesignDocument = function (db, doc) {
    doc.views.list.map = readFunction(MAP_LIST_FILENAME);
    db.insert(doc, function (err) {
        if (!err) {
            console.log('設計文書[%s]を登録しました。', doc._id);
            console.log(JSON.stringify(doc, undefined, 2));
        } else {
            console.log(err);
        }
    });
};

// データを登録する。
var insertDocument = function (db) {
    var data = JSON.parse(readFunction(DATA_FILENAME));
    db.bulk(data, function (err) {
        if (!err) {
            console.log('文書を登録しました。');
            console.log(JSON.stringify(data, undefined, 2));
        } else {
            console.log(err);
        }
    });
};

// データベースを作成する。
var createDatabese = function (database, doc) {
    // データベースの存在をチェックする。
    context.cloudant.db.get(database, function (err, body) {
        if (err && err.error === 'not_found') {
            console.log('アプリに必要なデータベースがありません。');
            context.cloudant.db.create(database, function (err) {
                if (!err) {
                    console.log('データベース[%s]を作成しました。', database);
                    var db = context.cloudant.db.use(database);
                    insertDesignDocument(db, doc);
                    insertDocument(db);
                } else {
                    console.log(err);
                }
            });
        }
    });
};

createDatabese(context.DB_NAME, DESIGN_DOCUMENT);