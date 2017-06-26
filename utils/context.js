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

// データベース名を設定する。
const DB_NAME = 'answer';

// Watson Speech to Text モデル名を設定する。
const STT_MODEL = 'ja-JP_BroadbandModel';

// Watson Speech to Text 声の名前を設定する。
const TTS_VOICE = "ja-JP_EmiVoice";

// ユーザー定義の環境変数から Watson Natural Language Classifier ID を取得する。(未設定 = null)
const CLASSIFIER_ID = process.env.CLASSIFIER_ID || null;

// ユーザー定義の環境変数から Watson Speech to Text CUSTOMIZATION_ID を取得する。(未設定 = null)
const CUSTOMIZATION_ID = process.env.CUSTOMIZATION_ID || null;

// 環境変数を取得する。
const appEnv = cfenv.getAppEnv();

// サービスを取得する。
const getService = (serviceName) => {
    // サービス接続情報を取得する。
    const creds = vcapServices.getCredentials(serviceName);
    switch (serviceName) {
        case 'cloudantNoSQLDB':
            // Cloudant NoSQL DB に接続する。
            // https://github.com/cloudant/nodejs-cloudant#api-reference
            return cloudant(creds.url);
        case 'natural_language_classifier':
            // Watson Natural Language Classifier に接続する。
            // https://github.com/watson-developer-cloud/node-sdk#natural-language-classifier
            return new watson.NaturalLanguageClassifierV1(creds);
        case 'speech_to_text':
        case 'text_to_speech':
            // Watson 認証サービスに接続する。
            // https://github.com/watson-developer-cloud/node-sdk#authorization
            return new watson.AuthorizationV1(creds);
        default:
            return;
    }
};

// コンテキストをセットする。
const context = {
    "appEnv": appEnv,
    "DB_NAME": DB_NAME,
    "CLASSIFIER_ID": CLASSIFIER_ID,
    "CUSTOMIZATION_ID": CUSTOMIZATION_ID,
    "STT_MODEL": STT_MODEL,
    "TTS_VOICE": TTS_VOICE,
    "cloudant": getService('cloudantNoSQLDB'),
    "nlc": getService('natural_language_classifier'),
    "sttAuth": getService('speech_to_text'),
    "ttsAuth": getService('text_to_speech')
};

/**
 * コンテキスト
 * @property {object} appEnv 環境変数
 * @property {string} DB_NAME データベース名
 * @property {string} CLASSIFIER_ID Watson Natural Language Classifier ID
 * @property {string} CUSTOMIZATION_ID Watson Speech to Text カスタムモデル ID
 * @property {string} STT_MODEL Watson Speech to Text
 * @property {string} TTS_VOICE Watson Speech to Text 声の名前
 * @property {object} cloudant Cloudant NoSQL DB
 * @property {object} nlc Watson Natural Language Classifier
 * @property {object} sttAuth Watson Speech to Text 認証サービス
 * @property {object} ttsAuth Watson Text to Speech 認証サービス
 *
 * @type {{appEnv, DB_NAME: string, CLASSIFIER_ID: string, CUSTOMIZATION_ID: string, STT_MODEL: string, TTS_VOICE: string, cloudant, nlc, sttAuth, ttsAuth}}
 */
module.exports = context;
