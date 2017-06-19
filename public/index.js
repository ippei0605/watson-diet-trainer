/**
 * Watson Diet Trainer: クライアント JavaScript
 *
 * @author Ippei SUZUKI
 */

'use strict';

/** 初期設定: 会話制御 */
let answerNumber = 0;

/** テンプレートタグ: 質問 */
const questionTag = '<div class="row"><div class="col-xs-11"><p class="balloon-right"><%= s %></p></div></div>';

/** テンプレートタグ: 回答 */
const answerTag = '<div class="row"><div class="col-xs-11"><p class="balloon-left"><%= s %><%= s %></p></div></div>';

/** 定型メッセージ定義 */
const messages = {
    "error_ajax": "通信エラーです。申し訳ございませんが最初からやり直してください。",
    "error_watson_auth": "Watson サービスの認証に失敗しました。申し訳ございませんが最初からやり直してください。",
};

/** 録音ボタンタグ */
const recordIconTag = {
    true: '<span class="glyphicon glyphicon-record" aria-hidden="true"></span>',
    false: '<span class="glyphicon glyphicon-stop" aria-hidden="true"></span>'
};

/** テンプレートタグにパラメータを付与する。 */
function formatTag(tag, s) {
    const array = tag.split('<%= s %>');
    let j = 0;
    let result = array[0];
    for (let i = 1, length = array.length; i < length; i++) {
        result += s[j++] + array[i];
    }
    return result;
}

/** 確度を編集する。 */
function formatConfidence(confidence) {
    return '[' + parseInt(Math.abs(confidence) * 100) + '%]';
}

/** 定型メッセージ用の JSON を返す。 */
function getMessageJson(key) {
    return {
        "message": messages[key],
        "confidence": 1
    };
}

/** DOM 読込み完了時の処理 */
$(function () {
    // テキスト読み上げオブジェクトを設定する。(非対応ブラウザを考慮)
    const speechSynthesis = window.speechSynthesis || null;

    // 音声認識オブジェクトを設定する。(非対応ブラウザを考慮)
    let recognition = null;

    // マイク入力のためのオブジェクトを設定する。チェックのみに使用。(非対応ブラウザを考慮)
    const getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || null;

    // ID セレクターを取得する。
    const conversationFieldId = $('#conversationFieldId');
    const searchFormId = $('#searchFormId');
    const qId = $('#qId');
    const recordId = $('#recordId');
    const sttId = $('#sttId');


    // Watson Speech API コンテキスト
    let watsonSpeechContext = {};

    // 音声認識中フラグ
    let recording = false;

    /** Watson Text to Speech でテキストを読み上げる。 */
    function speechWatson(text) {
        let param = {
            "token": watsonSpeechContext.tts.token,
            "text": text,
            "voice": watsonSpeechContext.tts.voice
        };
        WatsonSpeech.TextToSpeech.synthesize(param);
    }

    /** Speech Synthesis API でテキストを読み上げる。 */
    function speech(text) {
        if (speechSynthesis) {
            speechSynthesis.cancel();
            let msg = new SpeechSynthesisUtterance(text);
            msg.lang = 'ja-JP';
            speechSynthesis.speak(msg);
        }
    }

    /** テキストを読み上げる。 */
    function textToSpeech(text) {
        if (watsonSpeechContext.use) {
            speechWatson(text);
        } else {
            speech(text);
        }
    }

    /** 回答を表示する。 */
    function viewAnswer(value) {
        const message = value.message;
        const confidence = formatConfidence(value.confidence);

        // 回答を読み上げる。
        textToSpeech(message);

        // 回答を表示する。
        conversationFieldId.append(formatTag(answerTag, [message, confidence]));

        // 最下部までスクロールする。
        window.scrollTo(0, document.body.scrollHeight);
    }

    /** 質問する。 */
    function ask(url, text) {
        answerNumber++;

        // Watson GIF アニメ ON
        $('body').append('<div id="loading-view" />');

        $.ajax({
            type: "GET",
            url: url,
            data: {
                "text": text,
                "now": getNow()
            }
        }).done(function (value) {
            viewAnswer(value);
        }).fail(function () {
            viewAnswer(getMessageJson('error_ajax'));
        }).always(function () {
            // Watson GIF アニメ OFF
            $('#loading-view').remove();
        });
    }

    /** ブラウザが非対応な機能を表示する */
    function caniuse(object, name) {
        console.log(name + ': ', object);
        if (!object) {
            conversationFieldId.append(formatTag(answerTag, [name + ' 非対応', '']));
        }
    }

    /** 開始ボタンクリック時 (Speech Recognition API, Speech Synthsis API) */
    $('#startBtnId').on('click', function () {
        if (answerNumber === 0) {
            // 音声認識オブジェクトを設定する。
            try {
                recognition = new webkitSpeechRecognition();
                recognition.lang = 'ja';
                // 録音終了時トリガーを設定する。
                recognition.addEventListener('result', function (event) {
                    recordId.html(recordIconTag[recording]);
                    qId.val(event.results.item(0).item(0).transcript);
                    qId.focus();
                    recording = false;
                }, false);
            } catch (e) {
                recordId.hide();
                console.log('error:', e);
            }

            // ブラウザが非対応な機能を表示する。
            caniuse(recognition, 'Speech Recognition API');
            caniuse(speechSynthesis, 'Speech Synthesis API')

            // TODO iOS ブラウザでテキスト読上げさせるための御呪い。(もっと良い方法はないか？)
            speech('。');

            // ボタンメニューを削除する。
            $('#menuId').remove();

            // フォームを表示する。
            sttId.hide();
            searchFormId.show();

            // 初回挨拶する。
            ask('ask-classname', 'general_hello');
        }
    });

    /** 開始ボタンクリック時 (Watson Speech to Text, Text to Speech) */
    $('#startBtnWatsonId').on('click', function () {
        if (answerNumber === 0) {
            // ボタンメニューを削除する。
            $('#menuId').remove();

            // フォームを表示する。
            if (!getUserMedia) {
                sttId.hide();
            }
            recordId.hide();
            searchFormId.show();

            // ブラウザが非対応な機能を表示する。
            caniuse(getUserMedia, 'getUserMedia API');

            // Watson Speech to text と Text to Speech を使用するための情報を取得する。
            $.ajax({
                type: "GET",
                url: "/use-watson-speech"
            }).done(function (value) {
                // 情報をコンテキストにセットする。
                watsonSpeechContext = value;
                // 初回挨拶する。
                ask('ask-classname', 'general_hello');
            }).fail(function (value) {
                console.log("error: ", value);
                viewAnswer(getMessageJson('error_watson_auth'));
            }).always(function (value) {
            });
        }
    });

    // マイクのストリーム
    let stream = null;

    /** 録音ボタンクリック (Watson Speech to Text) */
    sttId.on('click', function () {
        if (recording) {
            if (stream) {
                stream.stop();
            }
            qId.focus();
        } else {
            let param = {
                token: watsonSpeechContext.stt.token,
                model: 'ja-JP_BroadbandModel',
                outputElement: '#qId' // CSS selector or DOM Element
            };
            if (watsonSpeechContext.stt.customization_id) {
                param.customization_id = watsonSpeechContext.stt.customization_id;
            }
            stream = WatsonSpeech.SpeechToText.recognizeMicrophone(param);

            stream.on('error', function (err) {
                console.log(err);
            });
        }
        sttId.html(recordIconTag[recording]);
        recording = !recording;
    });

    /** 録音ボタンクリック (Speech Recognition API) */
    recordId.on('click', function () {
        if (recording) {
            recognition.stop();
        } else {
            recognition.start();
        }
        recordId.html(recordIconTag[recording]);
        recording = !recording;
    });

    /** フォームサブミット時 */
    searchFormId.on('submit', function () {
        const q = qId.val();
        if (q.replace(/\s/g, '') !== '') {
            // Watson Speech to Text により音声認識を停止する。
            if (watsonSpeechContext.use) {
                if (stream) {
                    stream.stop();
                }
                sttId.html(recordIconTag[recording]);
                recording = false;
            }

            // 入力項目をクリアする。
            qId.val('');

            // 質問を表示する。
            conversationFieldId.append(formatTag(questionTag, [q]));

            // Watson に問い合わせる。
            ask('ask', q);
        }

        qId.focus();

        // サブミットせずに終了する。(画面遷移しない。)
        return false;
    });

    // フォームを隠す。
    searchFormId.hide();
});