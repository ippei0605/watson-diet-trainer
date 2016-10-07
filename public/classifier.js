/**
 * Watson Diet Trainer: Classifier クライアント JavaScript
 *
 * @author Ippei SUZUKI
 */

function loadingView(flag) {
    $('#loading-view').remove();
    if (!flag) return;
    $('<div id="loading-view" />').appendTo('body');
}

// 現在時刻を返す。
function getNow() {
    var now = new Date();
    return now.getFullYear() + '年' + (now.getMonth() + 1) + '月' + now.getDate() + '日 ' + now.getHours() + '時' + now.getMinutes() + '分' + now.getSeconds() + '秒';
}

// Classifier のステータスを更新する。
function status(id) {
    $.getJSON('/classifier/' + id, function (value) {
        var status = value.status;
        $('#' + id + 'StatusId').text(status);
        if (status === 'Available') {
            $('#' + id + 'RadioId').prop('checked', true);
        }
    });
}

// Delete Modal を表示する。
function deleteClassifier(id) {
    $('#deleteModalId').modal();
    $('#deleteId').text(id);
}

$(document).ready(function () {
    $('#uploadId').on('submit', function () {
        if ($('#fileId').val() === '') {
            return false;
        }
    });

    $('#classifyFormId').on('submit', function () {
        var text = $('#textId').val();
        var radio = $('input[name=classifierRadio]:checked').val();
        if (text === '') {
            return false;
        }

        loadingView(true);
        $.ajax({
            type: "GET",
            url: '/classifier/' + radio + '/classify',
            data: {"text": text}
        }).done(function (value) {
            var tableTag = '<table class="table"><thead><tr><th>Class Name</th><th>Message</th><th>Confidence</th></thead><tbody>';
            value.classes.forEach(function (row) {
                tableTag += '<tr><td>' + row.class_name + '</td><td id="' + row.class_name + 'Id">unknown</td><td class="text-right">' + parseFloat(row.confidence).toFixed(3) + '</td></tr>';

                $.getJSON('/ask-classname/?text=' + row.class_name + '&now=' + getNow(), function (value) {
                    $('#' + row.class_name + 'Id').text(value.message);
                });
            });
            tableTag += '</tbody></table>';
            $('#resultTableId').html(tableTag);
            $('#resultJsonId').html('<pre>' + JSON.stringify(value, undefined, 2) + '</pre>');
            $('#textId').val('');
        }).fail(function (value) {
            console.log('通信エラーが発生しました。');
        }).always(function (value) {
            loadingView(false);
        });
        return false;
    });

    // Create Classifier
    $('#createBtnId').on('click', function () {
        var formdata = new FormData($('#uploadId').get(0));
        var okBtn = $('#okBtnId');
        okBtn.prop('disabled', true);
        $('#resultModalId').modal();
        loadingView(true);
        $.ajax({
            url: "/classifier",
            type: "POST",
            data: formdata,
            cache: false,
            contentType: false,
            processData: false,
            dataType: "text"
        }).done(function (value) {
            var json = JSON.parse(value);
            $('#resultModalMessageId').html('<pre>' + JSON.stringify(json, undefined, 2) + '</pre>');
        }).fail(function (value) {
            $('#resultModalMessageId').html('通信エラーが発生しました。');
        }).always(function (value) {
            loadingView(false);
            okBtn.prop('disabled', false);
        });
        return false;
    });

    // Delete Classifier
    $('#deleteBtnId').on('click', function () {
        var okBtn = $('#okBtnId');
        okBtn.prop('disabled', true);
        $('#resultModalId').modal();
        $('#deleteModalId').modal('hide');
        loadingView(true);
        $.ajax({
            type: "GET",
            url: '/classifier/' + $('#deleteId').text() + '/delete',
            data: {}
        }).done(function (value) {
            $('#resultModalMessageId').html('<pre>' + JSON.stringify(value, undefined, 2) + '</pre>');
        }).fail(function (value) {
            $('#resultModalMessageId').html('通信エラーが発生しました。');
        }).always(function (value) {
            loadingView(false);
            okBtn.prop('disabled', false);
        });
    });

    // Result Modal の OKボタンをクリックしたらページを再読み込みする。
    $('#okBtnId').on('click', function () {
        location.href = '/classifier';
    });
});