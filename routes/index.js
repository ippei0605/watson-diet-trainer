/**
 * Watson Diet Trainer: ルーティング
 *
 * @module routes/index
 * @author Ippei SUZUKI
 */

'use strict';

// モジュールを読込む。
const watson = require('../models/watson');

watson.a

/**
 * Watson Speech to Text と Text to Speech のトークンを取得して、JSON を返す。
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
        },(ttsValue)=> {
            // 成功時
            res.send({
                "use": true,
                "stt": sttValue,
                "tts": ttsValue
            });
        })
    });
};


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
    watson.getAppSettings((value) => {
        res.render('index', {title: value.name});
    });
};