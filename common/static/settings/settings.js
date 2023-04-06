/*
Copyright (c) 2023 by MF3PGM (https://codepen.io/masa_mf3/pen/WNpjJzM)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

"use strict"

// 拡大ボタン
let chatbotZoomState = 'none';
const chatbot = document.getElementById('chatbot');
const chatbotBody = document.getElementById('chatbot-body');
const chatbotFooter = document.getElementById('chatbot-footer');
const chatbotZoomIcon = document.getElementById('chatbot-zoom-icon');

function switchToEnglish(){
    location.assign("./settings-en");
}

function switchToJapanese(){
    location.assign("./settings");
}

// PC用の拡大縮小機能
function chatbotZoomShape() {
    chatbotZoomState = 'large';
    console.log(chatbotZoomState);

    chatbot.classList.add('chatbot-zoom');
    chatbotBody.classList.add('chatbot-body-zoom');
    chatbotFooter.classList.add('chatbot-footer-zoom');
    // 縮小アイコンに変更
    chatbotZoomIcon.textContent = 'fullscreen_exit';
    chatbotZoomIcon.setAttribute('onclick', 'chatbotZoomOff()');

    if (window.matchMedia('(min-width:700px)').matches) {
        //PC処理
        document.querySelectorAll('.chatbot-left').forEach((cl) => {
            cl.style.maxWidth = '52vw';
        });
        document.querySelectorAll('.chatbot-right').forEach((cr) => {
            cr.style.maxWidth = '52vw';
        });
        document.querySelectorAll('.chatbot-left-rounded').forEach((cr) => {
            cr.style.maxWidth = '52vw';
        });
    }
}
function chatbotZoom() {
    // 拡大する
    chatbotZoomShape();
    window.location.href = '#chatbot';
    // フルスクリーン
    // document.body.requestFullscreen();
}
function chatbotZoomOffShape() {
    chatbotZoomState = 'middle';
    console.log(chatbotZoomState);

    chatbot.classList.remove('chatbot-zoom');
    chatbotBody.classList.remove('chatbot-body-zoom');
    chatbotFooter.classList.remove('chatbot-footer-zoom');
    // 拡大アイコンに変更
    chatbotZoomIcon.textContent = 'fullscreen';
    chatbotZoomIcon.setAttribute('onclick', 'chatbotZoom()');

    document.querySelectorAll('.chatbot-left').forEach((cl) => {
        cl.style.maxWidth = '70%';
    });
    document.querySelectorAll('.chatbot-right').forEach((cr) => {
        cr.style.maxWidth = '70%';
    });
    document.querySelectorAll('.chatbot-left-rounded').forEach((cr) => {
        cr.style.maxWidth = '70%';
    });
}
function chatbotZoomOff() {
    // 縮小する
    chatbotZoomOffShape();
    window.history.back();
    // フルスクリーン解除
    // document.exitFullscreen();
}