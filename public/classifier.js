/**
 * Watson Diet Trainer: Classifier クライアント JavaScript
 *
 * @author Ippei SUZUKI
 */

// Classifier のステータスを更新する。
function status(id) {
    $.getJSON('/classifier/' + id, (value) => {
        const status = value.status;
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

// DOM 読込み完了時に実行
$(() => {
    $('#uploadId').on('submit', () => {
        if ($('#fileId').val() === '') {
            return false;
        }
    });

    $('#classifyFormId').on('submit', () => {
        let text = $('#textId').val();
        let radio = $('input[name=classifierRadio]:checked').val();
        if (text === '') {
            return false;
        }

        loadingView(true);
        $.ajax({
            type: "GET",
            url: '/classifier/' + radio + '/classify',
            data: {"text": text}
        }).done((value) => {
            let tableTag = '<table class="table"><thead><tr><th>Class Name</th><th>Message</th><th>Confidence</th></thead><tbody>';
            value.classes.forEach((row) => {
                tableTag += '<tr><td>' + row.class_name + '</td><td id="' + row.class_name + 'Id">unknown</td><td class="text-right">' + parseFloat(row.confidence).toFixed(3) + '</td></tr>';

                $.getJSON('/ask-classname/?text=' + row.class_name + '&now=' + getNow(), (value) => {
                    $('#' + row.class_name + 'Id').text(value.message);
                });
            });
            tableTag += '</tbody></table>';
            $('#resultTableId').html(tableTag);
            $('#resultJsonId').html('<pre>' + JSON.stringify(value, undefined, 2) + '</pre>');
            $('#textId').val('');
        }).fail((value) => {
            console.log('通信エラーが発生しました。');
        }).always((value) => {
            loadingView(false);
        });
        return false;
    });

    // Create Classifier
    $('#createBtnId').on('click', () => {
        let formdata = new FormData($('#uploadId').get(0));
        let okBtn = $('#okBtnId');
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
        }).done((value) => {
            let json = JSON.parse(value);
            $('#resultModalMessageId').html('<pre>' + JSON.stringify(json, undefined, 2) + '</pre>');
        }).fail((value) => {
            $('#resultModalMessageId').html('通信エラーが発生しました。');
        }).always((value) => {
            loadingView(false);
            okBtn.prop('disabled', false);
        });
        return false;
    });

    // Delete Classifier
    $('#deleteBtnId').on('click', () => {
        let okBtn = $('#okBtnId');
        okBtn.prop('disabled', true);
        $('#resultModalId').modal();
        $('#deleteModalId').modal('hide');
        loadingView(true);
        $.ajax({
            type: "GET",
            url: '/classifier/' + $('#deleteId').text() + '/delete',
            data: {}
        }).done((value) => {
            $('#resultModalMessageId').html('<pre>' + JSON.stringify(value, undefined, 2) + '</pre>');
        }).fail((value) => {
            $('#resultModalMessageId').html('通信エラーが発生しました。');
        }).always((value) => {
            loadingView(false);
            okBtn.prop('disabled', false);
        });
    });

    // Result Modal の OKボタンをクリックしたらページを再読み込みする。
    $('#okBtnId').on('click', () => {
        location.href = '/classifier';
    });
});