/**
 * Watson Diet Trainer: ルーティング (DB参照)
 *
 * @module routes/index
 * @author Ippei SUZUKI
 */

// モジュールを読込む。
var watson = require('../models/watson');

/** コンテンツを表示する。(テスト用) */
exports.list = function (req, res) {
    watson.listContent(function (value) {
        var data = {"docs": value};
        res.send(JSON.stringify(data, undefined, 2));
    });
};

/** トレーニングデータを表示する。(テスト用) */
exports.exportCsv = function (req, res) {
    watson.listContent(function (value) {
        res.send(watson.exportCsv(value));
    });
};