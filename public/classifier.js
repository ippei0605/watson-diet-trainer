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

    $('#classifyFormId').on('submit', function () {
        let text = $('#textId').val();
        let radio = $('input[name=classifierRadio]:checked').val();
        if (text && radio) {
            // Watson GIF アニメ ON
            $('body').append('<div id="loading-view" />');

            $.ajax({
                type: "GET",
                url: '/classifier/' + radio + '/classify',
                data: {
                    "text": text,
                    "now": getNow()
                }
            }).done(function (value) {
                // 表とヘッダーを表示する。
                $('#resultTableId').html('<table class="table"><thead><tr><th>Class Name</th><th>Message</th><th>Confidence</th></thead><tbody></tbody></table>');

                // 行を表示する。
                value.table.forEach(function (row) {
                    $('#resultTableId tbody').append('<tr><td>' + row.class_name + '</td><td>' + row.message + '</td><td class="text-right">' + parseFloat(row.confidence).toFixed(3) + '</td></tr>');
                });

                // JSON を表示する。
                $('#resultJsonId').html('<pre>' + JSON.stringify(value.raw, undefined, 2) + '</pre>');
                $('#textId').val('');
            }).fail(function () {
                console.log('通信エラーが発生しました。');
            }).always(function () {
                // Watson GIF アニメ OFF
                $('#loading-view').remove();
            });
        }
        // サブミットせずに終了する。(画面遷移しない。)
        return false;
    });

    // Create Classifier
    $('#createBtnId').on('click', function () {
        const filename = $('#fileId').val();
        if (filename !== '') {
            // フォームデータを作成する。
            const formdata = new FormData($('#uploadId').get(0));

            // Result Modal を表示する。
            okBtnId.prop('disabled', true);
            $('#resultModalId').modal();

            // Watson GIF アニメ ON
            $('body').append('<div id="loading-view" />');

            $.ajax({
                url: "/classifier",
                type: "POST",
                data: formdata,
                cache: false,
                contentType: false,
                processData: false,
                dataType: "text"
            }).done(function (value) {
                const json = JSON.parse(value);
                resultModalMessageId.html('<pre>' + JSON.stringify(json, undefined, 2) + '</pre>');
            }).fail(function () {
                resultModalMessageId.html('通信エラーが発生しました。');
            }).always(function () {
                // Watson GIF アニメ OFF
                $('#loading-view').remove();

                okBtnId.prop('disabled', false);
            });
        }
        return false;
    });

    // Delete Classifier Confirm
    $('#classifierTableId td a').on('click', function () {
        $('#deleteModalId').modal();
        $('#deleteId').text($(this).closest('tr').children('td:eq(1)').text());
    });

    // Delete Classifier
    $('#deleteBtnId').on('click', function () {
        okBtnId.prop('disabled', true);
        $('#resultModalId').modal();
        $('#deleteModalId').modal('hide');

        // Watson GIF アニメ ON
        $('body').append('<div id="loading-view" />');

        $.ajax({
            type: "POST",
            url: '/classifier/' + $('#deleteId').text() + '/delete',
            data: {}
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
        location.href = '/classifier';
    });
});