/**
 * Watson Diet Trainer: Classifier クライアント JavaScript
 *
 * @author Ippei SUZUKI
 */

'use strict';

// DOM 読込み完了時の処理
$(function () {
    // ID セレクターを取得する。
    const okBtnId = $('#okBtnId');
    const resultModalMessageId = $('#resultModalMessageId');
    const sttStartId = $('#sttStartId');
    const sttStopId = $('#sttStopId');
    const resultId = $('#resultId');
    const corpusCloseBtnId = $('#corpusCloseBtnId');
    const corpusResultId = $('#corpusResultId');

    // マイクのストリーム
    let stream = null;

    function setRecoredingButton(flg) {
        sttStartId.prop('disabled', flg);
        sttStopId.prop('disabled', !flg);
    }

    setRecoredingButton(false);

    // 音声認識を開始する。
    sttStartId.on('click', function () {
        setRecoredingButton(true);

        // Watson Speech to text と Text to Speech を使用するための情報を取得する。
        $.ajax({
            type: "GET",
            url: "/use-watson-speech"
        }).done(function (watsonSpeechContext) {
            let param = {
                "token": watsonSpeechContext.stt.token,
                "model": "ja-JP_BroadbandModel",
                "outputElement": "#outputId" // CSS selector or DOM Element
            };

            // カスタムモデルを指定する。
            let radio = $('input[name=modelRadio]:checked').val();
            if (radio !== 'default') {
                param.customization_id = radio;
            }

            // Speech to Text を呼び出す。
            stream = WatsonSpeech.SpeechToText.recognizeMicrophone(param);

            stream.on('error', function (err) {
                console.log(err);
                $('#outputId').append('<p class="text-danger">' + err + '</p>');
            });
        }).fail(function (value) {
            console.log("error: ", value);
            resultId.html('<h3>Error</h3><pre>' + JSON.stringify(value, undefined, 2) + '</pre>');
        }).always(function (value) {
        });
    });

    // 音声認識を停止する。
    sttStopId.on('click', function () {
        setRecoredingButton(false);

        if (stream) {
            stream.stop();

        }
    });


    // モデルのラジオボタンをクリックした時に、モデル情報を表示する。
    $('[name=modelRadio]').click(function () {
        const radio = $('[name=modelRadio]:checked').val();
        if (radio === 'default') {
            resultId.html('');
        } else {
            // Watson GIF アニメ ON
            $('body').append('<div id="loading-view" />');

            // モデル情報を取得する。
            $.ajax({
                "type": "GET",
                "url": "/stt/" + radio
            }).done(function (value) {
            }).fail(function (value) {
                console.log("error: ", value);
            }).always(function (value) {
                // Watson GIF アニメ OFF
                $('#loading-view').remove();
                // モデル情報を表示する。
                resultId.html('<h3>Model</h3><pre>' + JSON.stringify(value.model, undefined, 2) + '</pre>');
                resultId.append('<h3>Corpora</h3><pre>' + JSON.stringify(value.corpora, undefined, 2) + '</pre>');
            });
        }
    });

    // カスタムモデルをトレーニングする。
    $('#trainId').on('click', function () {
        let radio = $('input[name=modelRadio]:checked').val();
        if (radio !== 'default') {
            // Result モーダルを表示する。
            okBtnId.prop('disabled', true);
            resultModalMessageId.html('');
            $('#resultModalId').modal();

            // Watson GIF アニメ ON
            $('body').append('<div id="loading-view" />');

            $.ajax({
                "type": "POST",
                "url": "/stt/" + radio + "/train"
            }).done(function (value) {
            }).fail(function (value) {
                console.log("error: ", value);
            }).always(function (value) {
                // Watson GIF アニメ OFF
                $('#loading-view').remove();
                resultModalMessageId.html('<pre>' + JSON.stringify(value, undefined, 2) + '</pre>');
                okBtnId.prop('disabled', false);
            });
        }
    });

    // Add Corpus Confirm
    $('#addCorpusId').on('click', function () {
        let radio = $('input[name=modelRadio]:checked').val();
        if (radio !== 'default') {
            // Add corpus モーダルを表示する。
            corpusResultId.html('');
            $('#corpusModalId').modal();
        }
    });

    //TODO ファイルアップロードだとエラーになる。400
    // Add corpus
    $('#uploadCorpusBtnId').on('click', function () {
        const filename = $('#corpusfileId').val();
        if (filename !== '') {
            // フォームデータを作成する。
            const formdata = new FormData($('#uploadCorpusId').get(0));

            corpusCloseBtnId.prop('disabled', true);

            // Watson GIF アニメ ON
            $('body').append('<div id="loading-view" />');
            let radio = $('input[name=modelRadio]:checked').val();

            $.ajax({
                url: "/stt/" + radio + "/corpus",
                type: "POST",
                data: formdata,
                cache: false,
                contentType: false,
                processData: false,
                dataType: "text"
            }).done(function (value) {
                const json = JSON.parse(value);
                corpusResultId.html('<pre>' + JSON.stringify(json, undefined, 2) + '</pre>');
            }).fail(function () {
                corpusResultId.html('通信エラーが発生しました。');
            }).always(function () {
                // Watson GIF アニメ OFF
                $('#loading-view').remove();

                corpusCloseBtnId.prop('disabled', false);
            });
        }
        //return false;
    });

    // Create Model Confirm
    $('#createModelId').on('click', function () {
        $('#createModalId').modal();
    });

    // Create Model
    $('#createBtnId').on('click', function () {
        // 入力項目から値を取得する。
        const name = $('#createNameId').val();
        const description = $('#createDescriptionId').val();
        console.log(name, description);

        okBtnId.prop('disabled', true);
        $('#resultModalId').modal();
        $('#createModalId').modal('hide');

        // Watson GIF アニメ ON
        $('body').append('<div id="loading-view" />');

        $.ajax({
            "type": "POST",
            "url": "/stt",
            "data": {
                "name": name,
                "description": description
            }
        }).done(function (value) {
            resultModalMessageId.html('<pre>' + JSON.stringify(value, undefined, 2) + '</pre>');
        }).fail(function (value) {
            resultModalMessageId.html('通信エラーが発生しました。');
        }).always(function (value) {
            // Watson GIF アニメ OFF
            $('#loading-view').remove();

            okBtnId.prop('disabled', false);
        });
    });

    // Delete Model Confirm
    $('#deleteModelId').on('click', function () {
        let radio = $('input[name=modelRadio]:checked').val();
        if (radio !== 'default') {
            $('#deleteModalId').modal();
            $('#deleteId').text(radio);
        }
    });

    // Delete Model
    $('#deleteBtnId').on('click', function () {
        okBtnId.prop('disabled', true);
        $('#resultModalId').modal();
        $('#deleteModalId').modal('hide');

        // Watson GIF アニメ ON
        $('body').append('<div id="loading-view" />');

        $.ajax({
            "type": "POST",
            "url": "/stt/" + $('#deleteId').text() + "/delete",
            "data": {}
        }).done(function (value) {
            resultModalMessageId.html('<pre>' + JSON.stringify(value, undefined, 2) + '</pre>');
        }).fail(function (value) {
            resultModalMessageId.html('通信エラーが発生しました。');
        }).always(function (value) {
            // Watson GIF アニメ OFF
            $('#loading-view').remove();

            okBtnId.prop('disabled', false);
        });
    });

    // Result Modal の OKボタンをクリックしたらページを再読み込みする。
    okBtnId.on('click', function () {
        location.href = '/stt';
    });
});