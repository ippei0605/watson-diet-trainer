/**
 * Watson Diet Trainer: ルーティング
 *
 * @module routes/index
 * @author Ippei SUZUKI
 */

// モジュールを読込む。
var watson = require('../models/watson');
exports.answerstore = require('./answer.js');
exports.classifier = require('./classifier.js');

/** 音声を返す。 */
exports.speech = function (req, res) {
    watson.speech(req.query.text).pipe(res);
};

/** Watson に尋ねる。 */
exports.ask = function (req, res) {
    watson.ask(req.query.text, req.query.now, function (value) {
        res.send(value);
    });
};

/** クラス名を問合せる。 */
exports.askClassName = function (req, res) {
    watson.askClassName(req.query.text, req.query.now, function (value) {
        res.send(value);
    });
};

/** Q&A 画面を表示する。 */
exports.index = function (req, res) {
    res.render('index');
};