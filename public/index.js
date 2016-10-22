/**
 * Watson Diet Trainer: クライアント JavaScript
 *
 * @author Ippei SUZUKI
 */

// 初期設定: 会話制御
var answerNumber = 0;

// 初期設定: 音声出力
var audio = new Audio('');

// 音声を出力する。
function textToSpeech(text) {
    audio.pause();
    console.log('textToSpeech: ', text);
    audio.src = '/text-to-speech/?text=' + text;
    audio.play();
}

// テンプレートタグにパラメータを付与する。
function formatTag(tag, s) {
    var array = tag.split('<%= s %>');
    var j = 0;
    var result = array[0];
    for (var i = 1; i < array.length; i++) {
        result += s[j++] + array[i];
    }
    return result;
}

// テンプレートタグ: 回答
var answerTag = '<div class="row"><div class="col-xs-11"><p class="balloon-left"><%= s %><%= s %></p></div></div>'

// 回答を表示する。
function viewAnswer(value) {
    var message = value.message;
    var confidence = formatConfidence(value.confidence);

    // 回答を読み上げる。
    textToSpeech(message);

    // 回答を表示する。
    $('#conversation_field').append(formatTag(answerTag, [message, confidence]));

    // 最下部までスクロールする。
    window.scrollTo(0, document.body.scrollHeight);
}

// 確度を編集する。
function formatConfidence(confidence) {
    return '[' + parseInt(Math.abs(confidence) * 100) + '%]';
}

// 定型メッセージ定義
var message = {
    "error_ajax": "通信エラーです。申し訳ございませんが最初からやり直してください。"
};

// 定型メッセージを表示する。
function fixMessage(key) {
    viewAnswer({
        "message": message[key],
        "confidence": 1
    });
}

// テンプレートタグ: 質問
var questionTag = '<div class="row"><div class="col-xs-11"><p class="balloon-right"><%= s %></p></div></div>';

// 質問を表示する。
function viewQuestion(q) {
    $('#conversation_field').append(formatTag(questionTag, [q]));
    // 最下部までスクロールする。
    window.scrollTo(0, document.body.scrollHeight);
}

// 質問する。
function ask(url, text) {
    answerNumber++;
    loadingView(true);

    $.ajax({
        type: "GET",
        url: url,
        data: {
            "text": text,
            "now": getNow()
        }
    }).done(function (value) {
        viewAnswer(value);
    }).fail(function (value) {
        fixMessage('error_ajax');
    }).always(function (value) {
        loadingView(false);
    });
}

// 録音ボタンタグ
var recordIconTag = {
    on: '<span class="glyphicon glyphicon-record" aria-hidden="true"></span>',
    off: '<span class="glyphicon glyphicon-stop" aria-hidden="true"></span>'
};

$(document).ready(function () {
    // 初期設定: 音声認識
    var recognition = null;
    try {
        recognition = new webkitSpeechRecognition();
        recognition.lang = 'ja';
        // 録音終了時トリガーを設定する。
        recognition.addEventListener('result', function (event) {
            var text = event.results.item(0).item(0).transcript;
            var qId = $('#qId');
            qId.val(text);
            qId.focus();
            $('#recordId').html('<span class="glyphicon glyphicon-record" aria-hidden="true"></span>');
            recording = false;
        }, false);
    } catch (e) {
        $('#recordId').hide();
        console.log('error:', e);
    }

    // 音声認識中フラグ
    var recording = false;

    // 初回挨拶
    if (answerNumber == 0) {
        ask('ask-classname', 'general_hello');
    }

    // 録音開始
    $('#recordId').on('click', function () {
        if (recording) {
            $('#recordId').html(recordIconTag['on']);
            recognition.stop();
        } else {
            recording = true;
            $('#recordId').html(recordIconTag['off']);
            recognition.start();
        }
    });

    // Watson へ問い合わせる。
    $('#searchFormId').on('submit', function () {
        var qId = $('#qId');
        var q = qId.val();
        if (q.replace(/\s/g, '') !== '') {
            qId.val('');
            viewQuestion(q);
            ask('ask', q);
        }
        return false;
    });
});
