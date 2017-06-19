/**
 * Watson Diet Trainer: モデル
 *
 * @module models/watson
 * @author Ippei SUZUKI
 */

'use strict';

// モジュールを読込む。
const context = require('./../utils/context');

// データベース
const db = context.cloudant.db.use(context.DB_NAME);

/** アプリケーションの設定値を取得する。 */
exports.getAppSettings = (callback) => {
    db.get('app_settings', (err, doc) => {
        if (err) {
            console.log('error', err);
            callback(err);
        } else {
            callback(doc)
        }
    });
};

/**
 * Watson Speech to Text のトークンおよびモデルを取得する。
 * @param callbackNg - 失敗時のコールバック
 * @param callbackOk - 成功時のコールバック
 * @see {https://github.com/watson-developer-cloud/node-sdk#authorization}
 */
exports.getSttToken = (callbackNg, callbackOk) => {
    context.sttAuth.getToken((err, sttToken) => {
        if (err) {
            console.log('Error retrieving token: ', err);
            callbackNg(err);
        } else {
            //TODO カスタムモデルの情報を付加、環境変数にあれば設定する。
            callbackOk({
                "token": sttToken,
                "model": context.STT_MODEL
            });
        }
    });
};

/**
 * Watson Text to Speech のトークンおよびボイスを取得する。
 * @param callbackNg - 失敗時のコールバック
 * @param callbackOk - 成功時のコールバック
 * @see {https://github.com/watson-developer-cloud/node-sdk#authorization}
 */
exports.getTtsToken = (callbackNg, callbackOk) => {
    context.ttsAuth.getToken((err, ttsToken) => {
        if (err) {
            console.log('Error retrieving token: ', err);
            callbackNg(err);
        } else {
            callbackOk({
                "token": ttsToken,
                "voice": context.TTS_VOICE
            });
        }
    });
};

// 定型コールバックする。
const handler = (err, response, callback) => {
    if (err) {
        callback(err);
    } else {
        callback(response);
    }
};

/** Natural Language Classifier の一覧を返す。 */
exports.listClassifier = (callback) => {
    context.nlc.list({}, (err, response) => handler(err, response, callback));
};

/** Natural Language Classifier のステータスを返す。 */
exports.statusClassifier = (id, callback) => {
    context.nlc.status({classifier_id: id}, (err, response) => handler(err, response, callback));
};

/** Natural Language Classifier を新規作成 (トレーニング) する。 */
exports.createClassifier = (params, callback) => {
    context.nlc.create(params, (err, response) => handler(err, response, callback));
};

/** Natural Language Classifier を削除する。 */
exports.removeClassifier = (id, callback) => {
    context.nlc.remove({classifier_id: id}, (err, response) => handler(err, response, callback));
};

// エラーオブジェクトからメッセージを取得する。
const gerErrorMessage = (err) => {
    console.log('error:', err);
    return ({
        "class_name": "",
        "message": "エラーが発生しました。" + JSON.stringify(err, undefined, 2),
        "confidence": 0
    });
};

// こんにちはを変換する。
const replaceHello = (text, replaceText) => {
    return text.replace(/こんにちは/g, replaceText);
};

// 条件により回答を確定する。
const finalAnswer = (value, now) => {
    switch (value.class_name) {
        case 'general_hello':
            let regexp = /(\d+)年(\d+)月(\d+)日 (\d+)時(\d+)分(\d+)秒/;
            let hour = parseInt(regexp.exec(now)[4]);
            if (hour >= 17) {
                value.message = replaceHello(value.message, 'こんばんは');
            } else if (hour < 11 && hour >= 5) {
                value.message = replaceHello(value.message, 'おはようございます');
            } else if (hour < 5) {
                value.message = replaceHello(value.message, 'お疲れ様です');
            }
            break;

        default:
            break;
    }
    return value;
};

// 回答を取得する。
const getAnswer = (class_name, confidence, now, callback) => {
    db.get(class_name, (err, body) => {
        if (err) {
            callback(gerErrorMessage(err));
        } else {
            callback(finalAnswer({
                "class_name": body._id,
                "message": body.message,
                "confidence": confidence
            }, now));
        }
    });
};

/** クラス名によりメッセージを取得する */
exports.askClassName = (text, now, callback) => {
    getAnswer(text, 1, now, callback);
};

/** テキストを分類する。 */
exports.ask = (text, now, callback) => {
    context.nlc.classify({
        text: text,
        classifier_id: context.CLASSIFIER_ID
    }, (err, response) => {
        if (err) {
            callback(gerErrorMessage(err));
        } else {
            let topClass = response.classes[0];
            getAnswer(topClass.class_name, topClass.confidence, now, callback);
        }
    });
};


/** 全コンテンツを取得する。 */
const listContent = (callback) => {
    db.view('answers', 'list', (err, body) => {
        let list = [];
        body.rows.forEach((row) => {
            delete row.value._rev;
            list.push(row.value);
        });
        callback(list);
    });
};

/** 全データ (アプリケーション設定値およびコンテンツ) を取得する。 */
exports.listAll = (callback) => {
    listContent((list) => {
        db.get('app_settings', (err, doc) => {
            list.unshift({
                "_id": doc._id,
                "name": doc.name
            });
            callback(list);
        });
    });
};

/** コンテンツリストからCVS形式のトレーニングデータを作成する。*/
exports.exportCsv = (callback) => {
    listContent((list) => {
        let csv = '';
        list.forEach((doc) => {
            const questions = doc.questions;
            if (questions) {
                questions.forEach((question) => {
                    csv += '"' + question + '","' + doc._id + '"\n';
                });
            }
        });
        callback(csv);
    });


};

/** コンテンツリストから Speech to Text 用のコーパスを作成する。*/
exports.exportCorpus = (list) => {
    let buffer = '';
    list.forEach((doc) => {
        buffer += '質問\n'
        if (doc.questions !== undefined) {
            doc.questions.forEach((question) => {
                buffer += question + '\n';
            });
        }
        buffer += '回答\n' + doc.message + '\n';
    });
    return buffer;
};

/** Classify */
exports.classify = (id, text, callback) => {
    context.nlc.classify({
        text: text,
        classifier_id: id
    }, (err, response) => handler(err, response, callback));
};
