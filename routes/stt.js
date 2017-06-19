/**
 * Watson Diet Trainer: ルーティング (Speech to Text 管理)
 *
 * @module routes/stt
 * @author Ippei SUZUKI
 */

'use strict';

// モジュールを読込む。
const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const context = require('../utils/context');

// ルーターを作成する。
const router = express.Router();

// ファイルアップロードを設定する。
const upload = multer({
    "storage": multer.diskStorage({
        "destination": (req, file, cb) => {
            cb(null, 'upload/');
        },
        "filename": (req, file, cb) => {
            // 拡張子 txt が無いと SpeechToText#addCorpus でエラーになる。
            cb(null, Date.now() + '-' + file.originalname);
        }
    })
});

/** Speech to Text 管理画面を表示する。 */
router.get('/', (req, res) => {
    context.stt.getCustomizations(null, (error, value) => {
        let list = {};
        if (error) {
            console.log('Error:', error);
        } else {
            list = value.customizations;
        }
        res.render('stt', {"list": list});
    });
});

/** カスタムモデルをトレーニングする。 */
router.post('/:id/train', (req, res) => {
    const params = {
        "customization_id": req.params.id
    };
    context.stt.trainCustomization(params, (error, value) => {
        if (error) {
            console.log('Error:', error);
            res.json(error);
        } else {
            res.json(value);
        }
    });
});

/** カスタムモデルを作成する。 */
router.post('/', (req, res) => {
    // リクエストパラメータを取得する。
    const name = req.body.name === '' ? 'NoName' : req.body.name;
    const description = req.body.description;

    //  STT API のパラメータをセットする。
    const params = {
        "name": name,
        "base_model_name": "ja-JP_BroadbandModel",
        "description": description
    };

    // STT API を実行する。
    context.stt.createCustomization(params, (error, value) => {
        if (error) {
            console.log('Error:', error);
            res.json(error);
        } else {
            res.json(value);
        }
    });
});

/** カスタムモデルを削除する。 */
router.post('/:id/delete', (req, res) => {
    const params = {
        "customization_id": req.params.id
    };

    context.stt.deleteCustomization(params, (error, value) => {
        if (error) {
            console.log('Error:', error);
            res.json(error);
        } else {
            res.json(value);
        }
    });
});

/** カスタムモデルを表示する。 */
router.get('/:id', (req, res) => {
    const params = {
        "customization_id": req.params.id
    };

    context.stt.getCustomization(params, (error, model) => {
        if (error) {
            console.log('Error:', error);
            res.json(error);
        } else {
            context.stt.getCorpora(params, function (error, corpora) {
                if (error) {
                    console.log('Error:', error);
                    res.json(error);
                } else {
                    res.json({
                        "model": model,
                        "corpora": corpora
                    });
                }
            });
        }
    });
});

/** コーパスを追加する。 */
router.post('/:id/corpus', upload.single('corpus-txt'), (req, res) => {
    const params = {
        "customization_id": req.params.id,
        "name": path.basename(req.file.originalname, '.txt'),
        "corpus": fs.createReadStream(req.file.path)
    };

    context.stt.addCorpus(params, (error, value) => {
        if (error) {
            console.log('Error:', error);
            res.json(error);
        } else {
            res.json(value);
        }
    });
});

module.exports = router;