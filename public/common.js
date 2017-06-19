/**
 * Watson Diet Trainer: クライアント JavaScript (共通)
 *
 * @author Ippei SUZUKI
 */

'use strict';

// 現在時刻を返す。
function getNow() {
    const now = new Date();
    return now.getFullYear() + '年' + (now.getMonth() + 1) + '月' + now.getDate() + '日 ' + now.getHours() + '時' + now.getMinutes() + '分' + now.getSeconds() + '秒';
}