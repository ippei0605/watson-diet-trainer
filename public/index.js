/**
 * Watson Diet Trainer: クライアント JavaScript
 *
 * @author Ippei SUZUKI
 */

'use strict';

// 初期設定: 会話制御
let answerNumber = 0;

// テンプレートタグ: 質問
const questionTag = '<div class="row"><div class="col-xs-11"><p class="balloon-right"><%= s %></p></div></div>';

// テンプレートタグ: 回答
const answerTag = '<div class="row"><div class="col-xs-11"><p class="balloon-left"><%= s %><%= s %></p></div></div>';

// 定型メッセージ定義
const messages = {
    "error_ajax": "通信エラーです。申し訳ございませんが最初からやり直してください。"
};

// 録音ボタンタグ
const recordIconTag = {
    true: '<span class="glyphicon glyphicon-record" aria-hidden="true"></span>',
    false: '<span class="glyphicon glyphicon-stop" aria-hidden="true"></span>'
};

// テンプレートタグにパラメータを付与する。
function formatTag(tag, s) {
    const array = tag.split('<%= s %>');
    let j = 0;
    let result = array[0];
    for (let i = 1, length = array.length; i < length; i++) {
        result += s[j++] + array[i];
    }
    return result;
}

// 確度を編集する。
function formatConfidence(confidence) {
    return '[' + parseInt(Math.abs(confidence) * 100) + '%]';
}

// 定型メッセージ用の JSON を返す。
function getMessageJson(key) {
    return {
        "message": messages[key],
        "confidence": 1
    };
}

// DOM 読込み完了時の処理
$(function () {
    // テキスト読み上げオブジェクトを設定する。(非対応ブラウザを考慮 IE)
    const speechSynthesis = window.speechSynthesis || null;

    // ID セレクターを取得する。
    const conversationFieldId = $('#conversationFieldId');
    const searchFormId = $('#searchFormId');
    const qId = $('#qId');
    const recordId = $('#recordId');

    // 音声認識中フラグ
    let recording = false;

    // 初期設定: 音声認識
    let recognition = null;
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

    // 音声を出力する。
    function textToSpeech(text) {
        if (speechSynthesis) {
            speechSynthesis.cancel();
            let msg = new SpeechSynthesisUtterance(text);
            msg.lang = 'ja-JP';
            speechSynthesis.speak(msg);
        }
    }

    // 回答を表示する。
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

    // 質問する。
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

    // ブラウザが非対応な機能を表示する
    function caniuse(object, name) {
        console.log(name + ': ', object);
        if (!object) {
            conversationFieldId.append(formatTag(answerTag, [name + '<br>非対応', '']));
        }
    }

    // 開始ボタンクリック時
    $('#startBtnId').on('click', function () {
        if (answerNumber === 0) {
            // ボタンメニューを削除する。
            $('#menuId').remove();

            // フォームを表示する。
            searchFormId.show();

            // TODO iOS ブラウザでテキスト読上げさせるための御呪い。(もっと良い方法はないか？)
            textToSpeech('。');

            // ブラウザが非対応な機能を表示する。
            caniuse(recognition, 'Speech Recognition API');
            caniuse(speechSynthesis, 'Speech Synthesis API');


            // 初回挨拶する。
            ask('ask-classname', 'general_hello');
        }
    });

    // 録音ボタンクリック
    recordId.on('click', function () {
        if (recording) {
            recognition.stop();
        } else {
            recognition.start();
        }
        recordId.html(recordIconTag[recording]);
        recording = !recording;
    });

    // フォームサブミット時
    searchFormId.on('submit', function () {
        const q = qId.val();
        if (q.replace(/\s/g, '') !== '') {
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