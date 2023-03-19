"use strict"

const chatSubmitBtn = document.getElementById('chatbot-submit');

// マイクアクセス要求
navigator.mediaDevices.getUserMedia({
  audio: true
}).then(function (stream) {
  // MediaRecorderオブジェクトで音声データを録音する
  var recorder = new MediaRecorder(stream, {
    mimeType: 'audio/webm' /*, 
    audioBitsPerSecond: 16000 ,
    channelCount: 1,
    sampleRate: 16000*/
  });

  // 音を拾い続けるためのチャンク
  var chunks = [];
  // 録音中かどうか
  var isRecording = false;
  // ユーザーの発言，回答内容を記憶する配列
  let userData = [];

  //集音のイベントを登録する
  recorder.addEventListener('dataavailable', function (ele) {
    chunks.push(ele.data);
  });

  // recorder.stopが実行された時のイベント
  recorder.addEventListener('stop', function (event) {
    //集音したものから音声データを作成する
    var blob = new Blob(chunks, { 'type': 'audio/wav; codecs=MS_PCM' });

    // トグルの結果(true/false)をテキストファイルに入れておく
    var toggle = document.getElementById("lang-toggle");
    const langText = toggle.checked ? "en" : "ja"
    const langFile = new Blob([langText], {type: "text/plain"})

    var fd = new FormData();
    fd.append('audio_data', blob, "recording.wav");
    fd.append("lang", langFile, "lang.text")
    // フォームを送信する
    async function postAudio(){
      var r = await fetch("/save_wav", {
        method: "POST",
        body: fd
      });
      var resJson = await r.json();

      var resText = resJson.user_text;
      var botText = resJson.bot_text;

      // 空行の場合送信不可
      if (!resText || !resText.match(/\S/g)) return false;

      // 投稿内容を後に活用するために、配列に保存しておく
      userData.push(resText);
      console.log(userData);

      // ulとliを作り、右寄せのスタイルを適用し投稿する
      const ul = document.getElementById('chatbot-ul');
      const li = document.createElement('li');
      // このdivにテキストを指定
      const div = document.createElement('div');

      li.classList.add('right');
      ul.appendChild(li);
      li.appendChild(div);
      div.classList.add('chatbot-right');
      div.textContent = resText;

      // モールスを全角になおす
      const botText2byte = botText.replace(/-/g, "ー").replace(/\./g, "・").replace(/ /g, "　");
      robotOutput(botText2byte);

      // 一番下までスクロール
      chatToBottom();

      chunks = [];
    }
    postAudio();
  });

  const recSign = document.getElementById('rec');
  // --------------------自分の投稿（送信ボタンを押した時の処理）--------------------
  chatSubmitBtn.addEventListener('click', () => {
    if(isRecording){
      // 録音中にボタンを押したら、録音をやめる
      recorder.stop();
      chatSubmitBtn.value = "話す";
      recSign.style.visibility = "hidden";
      isRecording = false;
    } else {
      // 録音していないときにボタンを押したら、録音開始
      recorder.start();
      chatSubmitBtn.value = "送信";
      recSign.style.visibility = "visible";
      isRecording = true;
    }
  });
}).catch(function (err) {
  console.log('The following gUM error occured: ' + err);
});




// 拡大ボタン
let chatbotZoomState = 'none';
const chatbot = document.getElementById('chatbot');
const chatbotBody = document.getElementById('chatbot-body');
const chatbotFooter = document.getElementById('chatbot-footer');
const chatbotZoomIcon = document.getElementById('chatbot-zoom-icon');

// 一番下へ
function chatToBottom() {
  const chatField = document.getElementById('chatbot-body');
  chatField.scroll(0, chatField.scrollHeight - chatField.clientHeight);
}

// --------------------ロボットの投稿--------------------
function robotOutput(content_text) {
  // 相手の返信が終わるまで、その間は返信不可にする
  // なぜなら、自分の返信を複数受け取ったことになり、その全てに返信してきてしまうから
  // 例："Hi!〇〇!"を複数など

  chatSubmitBtn.disabled = true;

  // ulとliを作り、左寄せのスタイルを適用し投稿する
  const ul = document.getElementById('chatbot-ul');
  const li = document.createElement('li');
  li.classList.add('left');
  ul.appendChild(li);

  // 考え中アニメーションここから
  const robotLoadingDiv = document.createElement('div');

  setTimeout(() => {
    li.appendChild(robotLoadingDiv);
    robotLoadingDiv.classList.add('chatbot-left');
    robotLoadingDiv.innerHTML = '<div id= "robot-loading-field"><span id= "robot-loading-circle1" class="material-icons">circle</span> <span id= "robot-loading-circle2" class="material-icons">circle</span> <span id= "robot-loading-circle3" class="material-icons">circle</span>';
    console.log('考え中');
    // 考え中アニメーションここまで

    // 一番下までスクロール
    chatToBottom();
  }, 800);

  setTimeout( () => {

    // 考え中アニメーション削除
    robotLoadingDiv.remove();

    // このdivにテキストを指定
    const div = document.createElement('div');
    li.appendChild(div);
    div.classList.add('chatbot-left');
    div.textContent = content_text
    chatSubmitBtn.disabled = false;

    // 一番下までスクロール
    chatToBottom();

  }, 2000);

  if (chatbotZoomState === 'large' && window.matchMedia('(min-width:700px)').matches) {
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

