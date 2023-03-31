"use strict"

const chatSubmitBtn = document.getElementById('chatbot-submit');
const chatSubmitSpeak = document.getElementById("chatbot-submit-speak");
const chatSubmitSend = document.getElementById("chatbot-submit-send");

// 拡大ボタン
let chatbotZoomState = 'none';
const chatbot = document.getElementById('chatbot');
const chatbotBody = document.getElementById('chatbot-body');
const chatbotFooter = document.getElementById('chatbot-footer');
const chatbotZoomIcon = document.getElementById('chatbot-zoom-icon');

var robotLoadingDiv;
var bot_li;

// マイクアクセス要求
navigator.mediaDevices.getUserMedia({
  audio: true
}).then(function (stream) {
  // MediaRecorderオブジェクトで音声データを録音する
  var recorder = new MediaRecorder(stream, {
    mimeType: 'audio/webm'  });

  // 音を拾い続けるためのチャンク
  var chunks = [];
  // 録音中かどうか
  var isRecording = false;

  //集音のイベントを登録する
  recorder.addEventListener('dataavailable', function (ele) {
    chunks.push(ele.data);
  });

  // recorder.stopが実行された時のイベント
  recorder.addEventListener('stop', function (event) {
    //集音したものから音声データを作成する
    var blob = new Blob(chunks, { 'type': 'audio/webm' });

    // トグルの結果(true/false)をテキストファイルに入れておく
    var toggle = document.getElementById("lang-toggle");
    const langText = toggle.checked ? "en" : "ja"
    const langFile = new Blob([langText], {type: "text/plain"})

    // ユーザー用吹き出し
    // ulとliを作り、右寄せのスタイルを適用し投稿する
    const ul = document.getElementById('chatbot-ul');
    const li = document.createElement('li');
    li.classList.add('right');
    ul.appendChild(li);

    // 送信中のアニメーション
    const userLoadingDiv = document.createElement('div');
    li.appendChild(userLoadingDiv);
    userLoadingDiv.classList.add('chatbot-right');
    userLoadingDiv.innerHTML = '<div id= "user-loading-field"><span id= "user-loading-circle1" class="material-icons">circle</span> <span id= "user-loading-circle2" class="material-icons">circle</span> <span id= "user-loading-circle3" class="material-icons">circle</span>';
    console.log('送信中');

    // ファイルサイズが20MB以上の場合、送信しない
    if(blob.size > 20 * 1024 * 1024){
      // 送信中アニメーション削除
      userLoadingDiv.remove();

      // このdivにテキストを指定
      const div = document.createElement('div');
      li.appendChild(div);
      div.classList.add('chatbot-right');
      div.innerHTML = "<span id='error'>ファイルサイズが大きすぎるため、送信されません。</span>";

      // 一番下までスクロール
      chatToBottom();

      chunks = [];

      return;
    }

    var fd = new FormData();
    fd.append('audio_data', blob, "recording.wav");
    fd.append("lang", langFile, "lang.text");
    // フォームを送信する
    async function postAudio(){
      var r = await fetch("./save_audio", {
        method: "POST",
        body: fd
      });
      const reader = r.body.getReader();

      while (true) {
        // done: 送り切ったか, value: 送られてきたデータ
        const { done, value } = await reader.read();
        if (done) {
          robotLoadingDiv.remove();
          break;
        };
        // chunkには送られてきたjson（のテキスト）が入る（{"user_text": "\u30c1\u30e3..."}など）
        var chunk = new TextDecoder().decode(value);
        // chunkが"}で閉じられていなければ"}を追加（なぜ閉じられない？）
        if (chunk.slice(-1) !== '}') {
          if(chunk.slice(-2) !== '"') {
            chunk += '"}';
          }else{
            chunk += '}';
          }
        }
        const resJson = JSON.parse(chunk);

        // 送信中アニメーション削除
        userLoadingDiv.remove();

        
        if("user_text" in resJson){
          // ユーザー吹き出し
          var userText = resJson.user_text;
          userOutput(userText, li);

          // 一番下までスクロール
          chatToBottom();

          // ロボットの考え中アニメーション作成
          const ul = document.getElementById('chatbot-ul');
          bot_li = document.createElement('li');
          bot_li.classList.add("left");
          ul.appendChild(bot_li);
          robotLoadingDiv = document.createElement('div');
          bot_li.appendChild(robotLoadingDiv);
          robotLoadingDiv.classList.add("chatbot-left");
          robotLoadingDiv.innerHTML = '<div id= "robot-loading-field"><span id= "robot-loading-circle1" class="material-icons">circle</span> <span id= "robot-loading-circle2" class="material-icons">circle</span> <span id= "robot-loading-circle3" class="material-icons">circle</span>';
          
        }else if("bot_text" in resJson && "bot_speech" in resJson){
          var botText = resJson.bot_text;
          var botSpeech = resJson.bot_speech;

          // 考え中アニメーション削除
          robotLoadingDiv.remove();

          // ボット吹き出し
          robotOutput(botText, botSpeech, bot_li);
          console.log(botText);

          // ロボットの考え中アニメーション作成
          const ul = document.getElementById('chatbot-ul');
          bot_li = document.createElement('li');
          bot_li.classList.add("left");
          ul.appendChild(bot_li);
          robotLoadingDiv = document.createElement('div');
          bot_li.appendChild(robotLoadingDiv);
          robotLoadingDiv.classList.add("chatbot-left");
          robotLoadingDiv.innerHTML = '<div id= "robot-loading-field"><span id= "robot-loading-circle1" class="material-icons">circle</span> <span id= "robot-loading-circle2" class="material-icons">circle</span> <span id= "robot-loading-circle3" class="material-icons">circle</span>';
          
        }

        chunks = [];
      }
    }
    postAudio();
  });

  const recSign = document.getElementById('rec');
  // --------------------自分の投稿（送信ボタンを押した時の処理）--------------------
  chatSubmitBtn.addEventListener('click', () => {
    if(isRecording){
      // 録音中にボタンを押したら、録音をやめる
      recorder.stop();
      chatSubmitSpeak.style.display = "block";
      chatSubmitSend.style.display = "none";
      recSign.style.visibility = "hidden";
      isRecording = false;
    } else {
      // 録音していないときにボタンを押したら、録音開始
      recorder.start();
      chatSubmitSpeak.style.display = "none";
      chatSubmitSend.style.display = "block";
      recSign.style.visibility = "visible";
          
      // ローディング中の吹き出しを削除
      robotLoadingDiv?.remove();
      bot_li?.remove();
      
      isRecording = true;
    }
  });
}).catch(function (err) {
  console.log('The following gUM error occured: ' + err);
});

// 一番下へ
function chatToBottom() {
  const chatField = document.getElementById('chatbot-body');
  chatField.scroll(0, chatField.scrollHeight - chatField.clientHeight);
}

// --------------------ユーザーの投稿--------------------
// 吹き出しのliも引数に入れる（送信中のアニメーションのために吹き出しが必要）
function userOutput(content_text, li){
  // ユーザテキストが空の場合、エラー
  if (!content_text || !content_text.match(/\S/g)) return false;

  // このdivにテキストを指定
  const div = document.createElement('div');
  li?.appendChild(div);
  div.classList.add('chatbot-right');
  div.textContent = content_text;

  // 一番下までスクロール
  chatToBottom();
}

// --------------------ロボットの投稿--------------------
function robotOutput(content_text, botSpeech, li) {
  // 相手の返信が終わるまで、その間は返信不可にする
  // なぜなら、自分の返信を複数受け取ったことになり、その全てに返信してきてしまうから
  // 例："Hi!〇〇!"を複数など

  chatSubmitBtn.disabled = true;

  // 音声データの文字列をバイナリに変換
  let decoded_audio_data = atob(botSpeech);
  let audio_data = new Uint8Array(decoded_audio_data.length);
  for (let i = 0; i < decoded_audio_data.length; i++) {
    audio_data[i] = decoded_audio_data.charCodeAt(i);
  }
  let blob = new Blob([audio_data.buffer], { type: 'audio/mp3' });

  // このdivにテキストを指定
  const div = document.createElement('div');
  li?.appendChild(div);
  div.classList.add('chatbot-left');
  div.textContent = content_text;
  chatSubmitBtn.disabled = false;

  // 一番下までスクロール
  chatToBottom();

  // 回答の音声再生
  playAudio(blob);


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

function goToSettings(){
  location.assign("settings");
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

