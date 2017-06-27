/**
 * Watson Diet Trainer: ルーティング
 *
 * @module routes/index
 * @author Ippei SUZUKI
 */

'use strict';

// モジュールを読込む。
const watson = require('../models/qa');

/**
 * Watson Speech to Text と Text to Speech のトークンを取得して、JSON を返す。
 * @param req {object} リクエスト
 * @param res {object} レスポンス
 */
exports.getWatsonSpeechContext = (req, res) => {
    watson.getSttToken(() => {
        // 失敗時
        res.status(500).send('Error retrieving token');
    }, (sttValue) => {
        // 成功時
        watson.getTtsToken((err) => {
            // 失敗時
            res.status(500).send('Error retrieving token');
        }, (ttsValue) => {
            // 成功時
            res.send({
                "stt": sttValue,
                "tts": ttsValue
            });
        })
    });
};

/**
 * Watson に尋ねる。
 * @param req {object} リクエスト
 * @param res {object} レスポンス
 */
exports.ask = (req, res) => {
    watson.ask(req.query.text, req.query.now, (value) => {
        res.send(value);
    });
};

/**
 * クラス名を問合せる。
 * @param req {object} リクエスト
 * @param res {object} レスポンス
 */
exports.askClassName = (req, res) => {
    watson.askClassName(req.query.text, req.query.now, (value) => {
        res.send(value);
    });
};

/**
 * Q&A 画面を表示する。
 * @param req {object} リクエスト
 * @param res {object} レスポンス
 */
exports.index = (req, res) => {
    watson.getAppSettings((value) => {
        res.render('index', {title: value.name});
    });
};