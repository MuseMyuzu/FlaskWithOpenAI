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
    fd.append("lang", langFile, "lang.text")
    // フォームを送信する
    async function postAudio(){
      var r = await fetch("./save_audio", {
        method: "POST",
        body: fd
      });
      //var resJson = await r.json();
      var data = await r.text();
      // }以下のテキストを削除（なぜかjsonの中身が後ろにつく）
      let index = data.indexOf("}");
      if (index !== -1) {
        data = data.substring(0, index + 1);
      }
      const resJson = JSON.parse(data);
      console.log(resJson);

      // 送信中アニメーション削除
      userLoadingDiv.remove();

      var userText = resJson.user_text;
      var botText = resJson.bot_text;
      var botSpeech = resJson.bot_speech;

      const decoded_utf8str = atob(botSpeech);
      console.log("type = " + typeof(decoded_utf8str));
      console.log("size = " + decoded_utf8str.length);
      //var decoded_audio = new Blob([decoded_utf8str], { 'type': 'audio/mp3' });
      // var decoded_audio = new Blob([new Uint8Array(decoded_utf8str)], {type: "audio/wav"});
      let decoded_audio_data = atob(botSpeech);
      let audio_data = new Uint8Array(decoded_audio_data.length);
      for (let i = 0; i < decoded_audio_data.length; i++) {
        audio_data[i] = decoded_audio_data.charCodeAt(i);
      }

      let decoded_audio = new Blob([audio_data.buffer], { type: 'audio/mp3' });
      console.log("type = " + typeof(decoded_audio));
      console.log(decoded_audio);

      /*
      // ダウンロードリンクを作成
      let download_link = document.createElement('a');
      download_link.href = URL.createObjectURL(decoded_audio);
      download_link.download = 'audio.mp3';
      // ダウンロードリンクをクリック
      download_link.click();
      */

      const audio = document.createElement('audio');
      audio.src = URL.createObjectURL(decoded_audio);
      audio.controls = true;
      document.body.appendChild(audio);

      // ユーザー吹き出し
      // ユーザテキストが空の場合、エラー
      if (!userText || !userText.match(/\S/g)) return false;

      // このdivにテキストを指定
      const div = document.createElement('div');
      li.appendChild(div);
      div.classList.add('chatbot-right');
      div.textContent = userText;

      // 一番下までスクロール
      chatToBottom();

      // ボット吹き出し
      robotOutput(botText);
      console.log(botText);

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
    // モールスを全角になおす（-→ー、.→・（ただし[.]を除く）、空白はなおさない）
    const botText2byte = content_text.replace(/-/g, "ー").replace(/\.(?!])/g, "・");
    div.innerHTML = splitSpan(botText2byte);
    chatSubmitBtn.disabled = false;

    // 一番下までスクロール
    chatToBottom();

    // モールス信号再生
    playMorseCode(content_text);

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

function goToSettings(){
  location.assign("settings");
}

// テキストを半角スペースの位置で区切って、spanタグにそれぞれ入れる
function splitSpan(text){
  const splitStr = text.split(" ");

  var htmlContent = "";
  for (let i = 0; i < splitStr.length; i++) {
    // 全角スペースを付して、span要素に入れる
    htmlContent += "<span>" + splitStr[i] + "　</span>";
  }
  return htmlContent;
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

