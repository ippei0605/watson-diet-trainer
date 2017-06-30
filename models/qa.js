/**
 * Watson Diet Trainer: モデル
 *
 * @module models/qa
 * @author Ippei SUZUKI
 */

'use strict';

// モジュールを読込む。
const context = require('./../utils/context');

// CLASSIFIER_ID をセットする。
const classifier_id = context.CLASSIFIER_ID;

// データベース
const db = context.cloudant.db.use(context.DB_NAME);

// エラーオブジェクトからメッセージを取得する。
const gerErrorMessage = (err) => {
    console.log('error:', err);
    return {
        "class_name": "",
        "message": "エラーが発生しました。 " + err.error + " (code=" + err.code + ")",
        "confidence": 0
    };
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
            let hour = parseInt(regexp.exec(now)[4], 10);
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

/**
 * アプリケーションの設定値を取得する。
 * @param {function} callback コールバック
 */
exports.getAppSettings = (callback) => {
    db.get('app_settings', (err, doc) => {
        if (err) {
            console.log('error', err);
            callback(context.DEFAULT_APP_SETTINGS);
        } else {
            callback(doc);
        }
    });
};

/**
 * Watson Speech to Text のトークン、モデルおよびカスタムモデル ID を取得する。
 * @param {function} callbackNg - 失敗時のコールバック
 * @param {function} callbackOk - 成功時のコールバック
 * @see {@link https://github.com/watson-developer-cloud/node-sdk#authorization}
 */
exports.getSttToken = (callbackNg, callbackOk) => {
    context.sttAuth.getToken((err, sttToken) => {
        if (err) {
            console.log('Error retrieving token: ', err);
            callbackNg(err);
        } else {
            let value = {
                "token": sttToken,
                "model": context.STT_MODEL
            };
            if (context.CUSTOMIZATION_ID) {
                value.customization_id = context.CUSTOMIZATION_ID;
            }
            callbackOk(value);
        }
    });
};

/**
 * Watson Text to Speech のトークンおよびボイスを取得する。
 * @param {function} callbackNg 失敗時のコールバック
 * @param {function} callbackOk 成功時のコールバック
 * @see {@link https://github.com/watson-developer-cloud/node-sdk#authorization}
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

/**
 * クラス名によりメッセージを取得する。
 * @param {string} text 質問
 * @param {string} now 現在時刻 (yyyy年M月d日 h時m分s秒)
 * @param callback {function} コールバック
 */
exports.askClassName = (text, now, callback) => {
    getAnswer(text, 0, now, callback);
};

/**
 * テキストを分類する。
 * @param {string} text 質問
 * @param {string} now 現在時刻 (yyyy年M月d日 h時m分s秒)
 * @param callback {function} コールバック
 * @see {@link https://github.com/watson-developer-cloud/node-sdk#natural-language-classifier}
 */
exports.ask = (text, now, callback) => {
    if (classifier_id) {
        context.nlc.classify({
            "text": text,
            "classifier_id": classifier_id
        }, (err, response) => {
            if (err) {
                callback(gerErrorMessage(err));
            } else {
                let topClass = response.classes[0];
                getAnswer(topClass.class_name, topClass.confidence, now, callback);
            }
        });
    } else {
        callback({
            "class_name": "",
            "message": "環境変数に Classifier ID が設定されていません。",
            "confidence": 0
        });
    }
};
