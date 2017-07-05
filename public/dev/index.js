/**
 * @file Watson Diet Trainer: クライアント JavaScript
 *
 * <pre>
 * 起動方法:
 * ・view/index.ejs から呼び出す。
 *
 * 起動条件:
 * jQuery および watson-speech が読込まれていること。
 *
 * 処理記述:
 * ・Q&A Chatbot を制御する。
 * </pre>
 *
 * @author Ippei SUZUKI
 */

'use strict';

// jQuery を使用する。(DOM 読込み完了時の処理)
$(function () {
    // タグ
    const questionTag = '<div class="row"><div class="col-xs-11"><p class="balloon-right"><%= s %></p></div></div>';
    const answerTag = '<div class="row"><div class="col-xs-11"><p class="balloon-left"><%= s %><%= s %></p></div></div>';
    const recordIconTag = {
        false: '<span class="glyphicon glyphicon-record" aria-hidden="true"></span>',
        true: '<span class="glyphicon glyphicon-stop" aria-hidden="true"></span>'
    };

    /// 定型メッセージ
    const messages = {
        "error_ajax": "通信エラーです。申し訳ございませんが最初からやり直してください。",
        "error_watson_auth": "Watson サービスの認証に失敗しました。申し訳ございませんが最初からやり直してください。",
    };

    // マイク入力のためのオブジェクトを設定する。チェックのみに使用。(非対応ブラウザを考慮)
    const getUserMedia = navigator.getUserMedia
        || navigator.webkitGetUserMedia
        || navigator.mozGetUserMedia
        || navigator.msGetUserMedia
        || null;

    // ID セレクターを取得する。
    const conversationFieldId = $('#conversationFieldId');
    const qId = $('#qId');
    const sttId = $('#sttId');
    const searchFormId = $('#searchFormId');

    // Watson Speech API コンテキスト
    let watsonSpeechContext = {};

    // 音声認識中フラグ
    let recording = false;

    // マイクのストリーム
    let stream = null;

    // 現在時刻を返す。
    function getNow() {
        const now = new Date();
        return now.getFullYear() + '年'
            + (now.getMonth() + 1) + '月'
            + now.getDate() + '日 '
            + now.getHours() + '時'
            + now.getMinutes() + '分'
            + now.getSeconds() + '秒';
    }

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
        let value = '';
        // 0 の時は表示しない。 (定型メッセージ)
        if (confidence !== 0) {
            value = '[' + parseInt(Math.abs(confidence) * 100) + '%]';
        }
        return value;
    }

    // 定型メッセージ用の JSON を返す。
    function getMessageJson(key) {
        return {
            "message": messages[key],
            "confidence": 0
        };
    }

    // テキストを読み上げる。
    function textToSpeech(text) {
        const param = {
            "text": text,
            "token": watsonSpeechContext.tts.token,
            "voice": watsonSpeechContext.tts.voice
        };
        WatsonSpeech.TextToSpeech.synthesize(param);
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

    // Watson Gif アニメ を制御する。 [isStart = true: 実行, false: 削除]
    function anime(isStart) {
        const loadingViewId = $('#loading-view');
        if (isStart) {
            if (!loadingViewId.length) {
                $('body').append('<div id="loading-view" />');
            }
        } else {
            if (loadingViewId.length) {
                loadingViewId.remove();
            }
        }
    }

    // Waston に質問する。
    function ask(url, text) {
        //  アニメーション ON
        anime(true);

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
            //  アニメーション OFF
            anime(false);
        });
    }

    // ブラウザが非対応な機能を表示する。
    function caniuse(object, name) {
        console.log(name + ': ', object);
        if (!object) {
            conversationFieldId.append(formatTag(answerTag, [name + ' 非対応', '']));
        }
    }

    // 音声認識ボタンクリック
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
        recording = !recording;
        sttId.html(recordIconTag[recording]);
    });

    // フォームサブミット時
    searchFormId.on('submit', function () {
        const q = qId.val();
        if (q.replace(/\s/g, '') !== '') {
            // 音声認識を停止する。
            if (recording) {
                if (stream) {
                    stream.stop();
                }
                recording = false;
                sttId.html(recordIconTag[recording]);
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

    // 初期処理を実行する。
    (function () {
        // フォームを隠す。
        searchFormId.hide();
        // 音声認識ボタンを隠す。
        sttId.hide();
        //  アニメーション ON
        anime(true);
        // ブラウザが非対応な機能を表示する。
        caniuse(getUserMedia, 'getUserMedia API');

        // Watson Speech to text と Text to Speech を使用するための情報を取得する。
        $.ajax({
            type: "GET",
            url: "/use-watson-speech"
        }).done(function (value) {
            // getUserMedia があれば音声認識ボタンを表示する。
            if (getUserMedia) {
                sttId.show();
            }
            // 情報をコンテキストにセットする。
            watsonSpeechContext = value;
            // 初回挨拶する。
            ask('ask-classname', 'general_hello');
            // フォームを表示する。
            searchFormId.show();
        }).fail(function (value) {
            console.log("error: ", value);
            viewAnswer(getMessageJson('error_watson_auth'));
        });
    })();
});