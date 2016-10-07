/**
 * Watson Diet Trainer: コンテキスト
 *
 * @module utils/context
 * @author Ippei SUZUKI
 */

/** データベース名 */
exports.DB_NAME = 'answer';

/** 環境変数 */
exports.appEnv = require('cfenv').getAppEnv();

// VCAP_SERVICES
var vcapServices = JSON.parse(process.env.VCAP_SERVICES);

/** データベース接続 */
var cloudantCreds = vcapServices.cloudantNoSQLDB[0].credentials;
exports.cloudant = require('cloudant')(cloudantCreds.url);

/** Watson Text-To-Speech */
var textToSpeechCreds = vcapServices.text_to_speech[0].credentials;
var TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');
var textToSpeech = new TextToSpeechV1({
    username: textToSpeechCreds.username,
    password: textToSpeechCreds.password
});
exports.textToSpeech = textToSpeech;

/** Watson Natural Language Classifier */
var naturalLanguageClassifierCreds = vcapServices.natural_language_classifier[0].credentials;
var NaturalLanguageClassifier = require('watson-developer-cloud/natural_language_classifier/v1');
var naturalLanguageClassifier = new NaturalLanguageClassifier({
    username: naturalLanguageClassifierCreds.username,
    password: naturalLanguageClassifierCreds.password,
    version: 'v1'
});
exports.naturalLanguageClassifier = naturalLanguageClassifier;

/** Watson Natural Language Classifier ID (ユーザー定義の環境変数から取得) */
exports.CLASSIFIER_ID = process.env.CLASSIFIER_ID;

/** File System */
exports.fs = require('fs');

/** Path */
exports.path = require('path');