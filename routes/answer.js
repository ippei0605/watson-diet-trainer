/**
 * Watson Diet Trainer: ルーティング (DB参照)
 *
 * @module routes/index
 * @author Ippei SUZUKI
 */

'use strict';

// モジュールを読込む。
const watson = require('../models/watson');

/** コンテンツを表示する。(テスト用) */
exports.list = (req, res) => {
    watson.listContent((value) => {
        res.send(JSON.stringify({"docs": value}, undefined, 2));
    });
};

/** トレーニングデータを表示する。(テスト用) */
exports.exportCsv = (req, res) => {
    watson.listContent((value) => {
        res.send(watson.exportCsv(value));
    });
};