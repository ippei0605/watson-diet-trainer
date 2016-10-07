/**
 * Watson Diet Trainer: ルーティング (Natural Language Classifier 管理)
 *
 * @module routes/index
 * @author Ippei SUZUKI
 */

// モジュールを読込む。
var context = require('../utils/context');
var watson = require('../models/watson');

/** Classifier を表示する。 */
exports.list = function (req, res) {
    watson.listClassifier(function (body) {
        res.render('classifier', {
            list: body.classifiers
        });
    });
};

/** Classifier のステータスを返す。 */
exports.status = function (req, res) {
    watson.statusClassifier(req.params.id, function (value) {
        res.json(value);
    });
};

/** Classifier を新規作成する。 */
exports.create = function (req, res) {
    watson.createClassifier({
        language: 'ja',
        name: context.path.basename(req.file.originalname, '.csv'),
        training_data: context.fs.createReadStream(req.file.path)
    }, function (value) {
        res.json(value);
    });
};

/** Classifier を削除する。 */
exports.delete = function (req, res) {
    watson.removeClassifier(req.params.id, function (value) {
        res.json(value);
    });
};

/** Classify */
exports.classify = function (req, res) {
    watson.classify(req.params.id, req.query.text, function (value) {
        res.json(value);
    });
};