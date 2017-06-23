/**
 * @file Watson Diet Trainer: アプリ
 * @author Ippei SUZUKI
 */

'use strict';

// モジュールを読込む。
const bodyParser = require('body-parser');
const express = require('express');
const logger = require('morgan');
const path = require('path');
const favicon = require('serve-favicon');
const context = require('./utils/context');
const routes = require('./routes');

// アプリケーションを作成する。
const app = express();

// ミドルウェアを設定する。
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use('/', express.static(__dirname + '/public'));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(favicon(__dirname + '/public/favicon.ico'));

// ルートを設定する。
app.get('/', routes.index);
app.get('/ask', routes.ask);
app.get('/ask-classname', routes.askClassName);
app.get('/use-watson-speech', routes.getWatsonSpeechContext);

// リクエトを受付ける。
app.listen(context.appEnv.port, () => {
    console.log('server starting on ' + context.appEnv.url);
});