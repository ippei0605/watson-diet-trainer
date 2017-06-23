/**
 * Watson Diet Trainer: コンテキスト
 *
 * @module utils/context
 * @author Ippei SUZUKI
 */

'use strict';

// モジュールを読込む。
const cfenv = require('cfenv');
const cloudant = require('cloudant');
const vcapServices = require('vcap_services');
const watson = require('watson-developer-cloud');

/** データベース名 */
exports.DB_NAME = 'answer';

/** Watson Speech to Text モデル名 */
exports.STT_MODEL = 'ja-JP_BroadbandModel';

/** Watson Speech to Text 声名 */
exports.TTS_VOICE = "ja-JP_EmiVoice";

/** 環境変数 */
exports.appEnv = cfenv.getAppEnv();

// Cloudant NoSQL DB の接続情報を取得する。
const cloudantCreds = vcapServices.getCredentials('cloudantNoSQLDB');

/**
 * Cloudant NoSQL DB に接続する。
 * @see {https://github.com/cloudant/nodejs-cloudant#api-reference}
 */
exports.cloudant = cloudant(cloudantCreds.url);

// Watson Natural Language Classifier の接続情報を取得する。
const nlsCreds = vcapServices.getCredentials('natural_language_classifier');

/** Watson Natural Language Classifier */
exports.nlc = new watson.NaturalLanguageClassifierV1(nlsCreds);

/** Watson Natural Language Classifier ID (ユーザー定義の環境変数から取得) */
exports.CLASSIFIER_ID = process.env.CLASSIFIER_ID;

/** Watson Speech to Text CUSTOMIZATION_ID (ユーザー定義の環境変数から取得) */
exports.CUSTOMIZATION_ID = process.env.CUSTOMIZATION_ID || null;

// Watson Speech to Text の接続情報を取得する。
const sttCreds = vcapServices.getCredentials('speech_to_text');

/**
 * Watson Speech to Text 認証サービス
 * @see {https://github.com/watson-developer-cloud/node-sdk#authorization}
 */
exports.sttAuth = new watson.AuthorizationV1(sttCreds);

/**
 * Watson Speech to Text
 */
exports.stt = new watson.SpeechToTextV1(sttCreds);

// Watson Text to Speech の接続情報を取得する。
const ttsCreds = vcapServices.getCredentials('text_to_speech');

/**
 * Watson Text to Speech 認証サービス
 * @see {https://github.com/watson-developer-cloud/node-sdk#authorization}
 */
exports.ttsAuth = new watson.AuthorizationV1(ttsCreds);

/** File System */
exports.fs = fs;

/** Path */
const path = path;

const text = 'HAHAHA';

/**
 *
 * @type {{text: string, path: *}}
 */
const context = {
    text:text,
    path:path

};
