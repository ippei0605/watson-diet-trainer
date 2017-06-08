/**
 * Watson Diet Trainer: ルーティング (Natural Language Classifier 管理)
 *
 * @module routes/index
 * @author Ippei SUZUKI
 */

'use strict';

// モジュールを読込む。
const context = require('../utils/context');
const watson = require('../models/watson');

// Classifier の一覧 (src) にステータスを付加して配列 (dst) を作成して、コールバックする。
const listStatus = (src, dst, callback) => {
    const num = dst.length;
    if (num === src.length) {
        callback(dst);
    } else {
        watson.statusClassifier(src[num].classifier_id, (value) => {
            dst.push(value);
            listStatus(src, dst, callback);
        });
    }
};

/** Classifier を表示する。 */
exports.list = (req, res) => {
    watson.listClassifier((value) => {
        listStatus(value.classifiers, [], (value) => {
            res.render('classifier', {list: value});
        });
    });
};

/** Classifier を新規作成する。 */
exports.create = (req, res) => {
    watson.createClassifier({
        language: 'ja',
        name: context.path.basename(req.file.originalname, '.csv'),
        training_data: context.fs.createReadStream(req.file.path)
    }, (value) => {
        res.json(value);
    });
};

/** Classifier を削除する。 */
exports.delete = (req, res) => {
    watson.removeClassifier(req.params.id, (value) => {
        res.json(value);
    });
};

// Classify の結果配列 (src) よりメッセージを付加して配列 (dst) を作成して、コールバックする。
const listAnswer = (src, dst, now, callback) => {
    const num = dst.length;
    if (num === src.length) {
        callback(dst);
    } else {
        watson.askClassName(src[num].class_name, now, (value) => {
            value.confidence = src[num].confidence;
            dst.push(value);
            listAnswer(src, dst, now, callback);
        });
    }
};

/** Classify */
exports.classify = (req, res) => {
    watson.classify(req.params.id, req.query.text, (raw) => {
        listAnswer(raw.classes, [], req.query.now, (table) => {
            res.json({
                "raw": raw,
                "table": table
            });
        });
    });
};