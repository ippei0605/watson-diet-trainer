/**
 * Watson Diet Trainer: ルーティング (DB参照)
 *
 * @module routes/index
 * @author Ippei SUZUKI
 */

'use strict';

// モジュールを読込む。
const express = require('express');
const watson = require('../models/watson');

// ルーターを作成する。
const router = express.Router();

/** コンテンツを表示する。 */
router.get('/', (req, res) => {
    watson.listAll((value) => {
        res.send(JSON.stringify({"docs": value}, undefined, 2));
    });
});

/** トレーニングデータを表示する。 */
router.get('/csv', (req, res) => {
    watson.exportCsv((csv) => {
        res.send(csv);
    });
});

/** トレーニングデータを表示する。 */
router.get('/corpus', (req, res) => {
    watson.listContent((value) => {
        res.send(watson.exportCorpus(value));
    });
});

module.exports = router;