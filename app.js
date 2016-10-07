/**
 * @file Watson Diet Trainer: アプリ
 * @author Ippei SUZUKI
 */

// モジュールを読込む。
var context = require('./utils/context');
var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var multer = require('multer');
var routes = require('./routes');
var upload = multer({dest: 'upload/'});

// アプリケーションを作成する。
var app = express();

// ミドルウェアを設定する。
app.set('views', context.path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use('/', express.static(__dirname + '/public'));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(favicon(__dirname + '/public/favicon.ico'));

// ルートを設定する。
app.get('/', routes.index);
app.get('/ask', routes.ask);
app.get('/ask-classname', routes.askClassName);
app.get('/text-to-speech', routes.speech);
app.get('/answer', routes.answerstore.list);
app.get('/answer/csv', routes.answerstore.exportCsv);
app.get('/classifier', routes.classifier.list);
app.get('/classifier/:id/', routes.classifier.status);
app.post('/classifier', upload.single('training-csv'), routes.classifier.create);
app.get('/classifier/:id/delete', routes.classifier.delete);
app.get('/classifier/:id/classify', routes.classifier.classify);

// リクエトを受付ける。
app.listen(context.appEnv.port, function () {
  console.log('server starting on ' + context.appEnv.url);
});