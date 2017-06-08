/**
 * Watson Diet Trainer: ルーティング
 *
 * @module routes/index
 * @author Ippei SUZUKI
 */

'use strict';

// モジュールを読込む。
const watson = require('../models/watson');
exports.answerstore = require('./answer.js');
exports.classifier = require('./classifier.js');

/** Watson に尋ねる。 */
exports.ask = (req, res) => {
    watson.ask(req.query.text, req.query.now, (value) => {
        res.send(value);
    });
};

/** クラス名を問合せる。 */
exports.askClassName = (req, res) => {
    watson.askClassName(req.query.text, req.query.now, (value) => {
        res.send(value);
    });
};

/** Q&A 画面を表示する。 */
exports.index = (req, res) => {
    res.render('index');
};