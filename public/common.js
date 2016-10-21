/**
 * Watson Diet Trainer: クライアント JavaScript (共通)
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