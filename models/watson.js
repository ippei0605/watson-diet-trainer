/**
 * Watson Diet Trainer: モデル
 *
 * @module models/watson
 * @author Ippei SUZUKI
 */

// モジュールを読込む。
var context = require('./../utils/context');

// データベースを使用する。
var db = context.cloudant.db.use(context.DB_NAME);

/** 音声を返す。 */
exports.speech = function (text) {
    return context.textToSpeech.synthesize({
        "text": text,
        "voice": "ja-JP_EmiVoice",
        "accept": "audio/wav"
    });
};

/** Natural Language Classifier の一覧を返す。 */
exports.listClassifier = function (callback) {
    context.naturalLanguageClassifier.list({}, function (err, response) {
        if (err) {
            callback(err);
        } else {
            callback(response);
        }
    });
};

/** Natural Language Classifier のステータスを返す。 */
exports.statusClassifier = function (id, callback) {
    context.naturalLanguageClassifier.status({classifier_id: id}, function (err, response) {
        if (err) {
            callback(err);
        } else {
            callback(response);
        }
    });
};

/** Natural Language Classifier を新規作成 (トレーニング) する。 */
exports.createClassifier = function (params, callback) {
    context.naturalLanguageClassifier.create(params, function (err, response) {
        if (err) {
            callback(err);
        } else {
            callback(response);
        }
    });
};

/** Natural Language Classifier を削除する。 */
exports.removeClassifier = function (id, callback) {
    context.naturalLanguageClassifier.remove({classifier_id: id}, function (err, response) {
        if (err) {
            callback(err);
        } else {
            callback(response);
        }
    });
};

// エラーオブジェクトからメッセージを取得する。
var gerErrorMessage = function (err) {
    console.log('error:', err);
    return ({
        "class_name": "",
        "message": "エラーが発生しました。" + JSON.stringify(err, undefined, 2),
        "confidence": 0
    });
};

// こんにちはを変換する。
var replaceHello = function (text, replaceText) {
    return text.replace(/こんにちは/g, replaceText);
};

// 条件により回答を確定する。
var finalAnswer = function (value, now) {
    switch (value.class_name) {
        case 'general_hello':
            var regexp = /(\d+)年(\d+)月(\d+)日 (\d+)時(\d+)分(\d+)秒/;
            var hour = parseInt(regexp.exec(now)[4]);
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
var getAnswer = function (class_name, confidence, now, callback) {
    db.get(class_name, function (err, body) {
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
exports.askClassName = function (text, now, callback) {
    getAnswer(text, 1, now, callback);
};

/** テキストを分類する。 */
exports.ask = function (text, now, callback) {
    context.naturalLanguageClassifier.classify({
        text: text,
        classifier_id: context.CLASSIFIER_ID
    }, function (err, response) {
        if (err) {
            callback(gerErrorMessage(err));
        } else {
            var topClass = response.classes[0];
            getAnswer(topClass.class_name, topClass.confidence, now, callback);
        }
    });
};

/** 全コンテンツを取得する。 */
exports.listContent = function (callback) {
    db.view('answers', 'list', function (err, body) {
        var value = [];
        body.rows.forEach(function (row) {
            delete row.value._rev;
            value.push(row.value);
        });
        callback(value);
    });
};

// CSV形式の行を出力する。
var formatLine = function (text, class_name) {
    return '"' + text + '","' + class_name + '"\n';
};

/** コンテンツリストからCVS形式のトレーニングデータを取得する。*/
exports.exportCsv = function (list) {
    var buffer = '';
    list.forEach(function (doc) {
        if (doc.questions !== undefined) {
            doc.questions.forEach(function (question) {
                buffer += formatLine(question, doc._id);
            });
        }
    });
    return buffer;
};

/** Classify */
exports.classify = function (id, text, callback) {
    context.naturalLanguageClassifier.classify({
        text: text,
        classifier_id: id
    }, function (err, response) {
        if (err) {
            callback(err);
        } else {
            callback(response);
        }
    });
};