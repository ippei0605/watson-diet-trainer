/**
 * Watson Diet Trainer: コンテキスト
 *
 * @module utils/context
 * @author Ippei SUZUKI
 */

'use strict';

// モジュールを読込む。
const Cfenv = require('cfenv');
const VcapServices = require('vcap_services');
const Cloudant = require('cloudant');
const Watson = require('watson-developer-cloud');

// データベース名
exports.DB_NAME = 'answer';

/** 環境変数 */
exports.appEnv = Cfenv.getAppEnv();

// Cloudant NoSQL DB の接続情報を取得する。
const cloudantCreds = VcapServices.getCredentials('cloudantNoSQLDB');

/** Cloudant NoSQL DB に接続する。 */
exports.cloudant  = Cloudant(cloudantCreds.url);

// Watson Natural Language Classifier の接続情報を取得する。
const nlsCreds = VcapServices.getCredentials('natural_language_classifier');

/** Watson Natural Language Classifier */
exports.nlc = new Watson.NaturalLanguageClassifierV1(nlsCreds);

/** Watson Natural Language Classifier ID (ユーザー定義の環境変数から取得) */
exports.CLASSIFIER_ID = process.env.CLASSIFIER_ID;

/** File System */
exports.fs = require('fs');

/** Path */
exports.path = require('path');