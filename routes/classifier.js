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

/** Classifier を表示する。 */
exports.list = (req, res) => {
    watson.listClassifier((body) => {
        res.render('classifier', {list: body.classifiers});
    });
};

/** Classifier のステータスを返す。 */
exports.status = (req, res) => {
    watson.statusClassifier(req.params.id, (value) => {
        res.json(value);
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

/** Classify */
exports.classify = (req, res) => {
    watson.classify(req.params.id, req.query.text, (value) => {
        res.json(value);
    });
};