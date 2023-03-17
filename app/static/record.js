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

  //集音のイベントを登録する
  recorder.addEventListener('dataavailable', function (ele) {
    chunks.push(ele.data);
  });

  // recorder.stopが実行された時のイベント
  recorder.addEventListener('stop', function (event) {

    var dl = document.querySelector("#dl");

    //集音したものから音声データを作成する
    var blob = new Blob(chunks, { 'type': 'audio/wav; codecs=MS_PCM' });
    var path = URL.createObjectURL(blob);
    dl.href = path;
    dl.download = 'sample.wav';

    // 録音した音声データを再生するためのaudio要素を作成する
    var audioElement = document.createElement('audio');
    audioElement.controls = true;
    document.body.appendChild(audioElement);
    audioElement.src = path;

    var fd = new FormData();
    fd.append('audio_data', blob, "recording.wav");
    // フォームを送信する
    fetch("/save_wav", {
      method: "POST",
      body: fd
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
    })
    .catch((error) => {
      console.error(error);
    })

    chunks = [];
  });

  // 録音開始ボタンをクリックしたときの処理
  document.getElementById("start").onclick = function () {
    recorder.start();
    document.getElementById("start").disabled = true;
    document.getElementById("stop").disabled = false;
  };

  // 録音停止ボタンをクリックしたときの処理
  document.getElementById("stop").onclick = function () {
    recorder.stop();
    document.getElementById("start").disabled = false;
    document.getElementById("stop").disabled = true;
  };
}).catch(function (err) {
  console.log('The following gUM error occured: ' + err);
});


// 「userCount」は実質必要ないが、管理しやすくするために導入する（「chatList」のコメントアウト，最後のやまびこ，今後の開発）
let userCount = 0;
// ユーザーの発言，回答内容を記憶する配列
let userData = [];

// 一番下へ
function chatToBottom() {
    const chatField = document.getElementById('chatbot-body');
    chatField.scroll(0, chatField.scrollHeight - chatField.clientHeight);
}

const userText = document.getElementById('chatbot-text');
const chatSubmitBtn = document.getElementById('chatbot-submit');

// ロボットが投稿をする度にカウントしていき、投稿を管理する
let robotCount = 0;
// 選択肢の正解個数
let qPoint = 0;

// 選択肢ボタンを押したときの次の選択肢（textのa，bなど）
let nextTextOption = '';

// 拡大ボタン
let chatbotZoomState = 'none';
const chatbot = document.getElementById('chatbot');
const chatbotBody = document.getElementById('chatbot-body');
const chatbotFooter = document.getElementById('chatbot-footer');
const chatbotZoomIcon = document.getElementById('chatbot-zoom-icon');

// --------------------ロボットの投稿--------------------
function robotOutput() {
  // 相手の返信が終わるまで、その間は返信不可にする
  // なぜなら、自分の返信を複数受け取ったことになり、その全てに返信してきてしまうから
  // 例："Hi!〇〇!"を複数など
    
  robotCount ++;
  console.log('robotCount：' + robotCount);

  chatSubmitBtn.disabled = true;
  
// ulとliを作り、左寄せのスタイルを適用し投稿する
  const ul = document.getElementById('chatbot-ul');
  const li = document.createElement('li');
  li.classList.add('left');
  ul.appendChild(li);
  
  // 考え中アニメーションここから
  const robotLoadingDiv = document.createElement('div');

  setTimeout( ()=> {
      li.appendChild(robotLoadingDiv);
      robotLoadingDiv.classList.add('chatbot-left');
      robotLoadingDiv.innerHTML = '<div id= "robot-loading-field"><span id= "robot-loading-circle1" class="material-icons">circle</span> <span id= "robot-loading-circle2" class="material-icons">circle</span> <span id= "robot-loading-circle3" class="material-icons">circle</span>';
      console.log('考え中');
      // 考え中アニメーションここまで

      // 一番下までスクロール
      chatToBottom();
  }, 800);

  setTimeout( ()=> {

      // 考え中アニメーション削除
      robotLoadingDiv.remove();

      if (chatList[robotCount].option === 'choices') {
          const qAnswer = `q-${robotCount}-${chatList[robotCount].text.answer}`;
          const choiceField = document.createElement('div');
          choiceField.id = `q-${robotCount}`;
          choiceField.classList.add('chatbot-left-rounded');
          li.appendChild(choiceField);
        
          // 質問タイトル
          const choiceTitle = document.createElement('div');
          choiceTitle.classList.add('choice-title');
          choiceTitle.textContent = chatList[robotCount].text.title;
          choiceField.appendChild(choiceTitle);
          // 質問文
          const choiceQ = document.createElement('div');
          choiceQ.textContent = chatList[robotCount].text.question;
          choiceQ.classList.add('choice-q');
          choiceField.appendChild(choiceQ);
        
          // 選択肢作成
          for (let i = 0; i < chatList[robotCount].text.choices.length; i ++) {
              const choiceButton = document.createElement('button');
              choiceButton.id = `${choiceField.id}-${i}`; // id設定
              choiceButton.setAttribute('onclick', 'pushChoice(this)'); // ボタンを押した際の合図
              choiceButton.classList.add('choice-button');
              choiceField.appendChild(choiceButton);
              choiceButton.textContent = chatList[robotCount].text.choices[i];
          }
        
      } else {
          // このdivにテキストを指定
          const div = document.createElement('div');
          li.appendChild(div);
          div.classList.add('chatbot-left');
          
          // テキストを加工する場合（次の回答が選択型でも使えるようにここに設置）
          textSpecial();  
        
          switch(chatList[robotCount].option) {
              case 'normal':
                  if (chatList[robotCount].text.qTrue) {
                      // 複数のテキストのうち特定のものを設定するとき
                      if(chatList[robotCount].link) {
                          div.innerHTML = `<a href= "${chatList[robotCount].text[nextTextOption]}" onclick= "chatbotLinkClick()">${chatList[robotCount].text[nextTextOption]}</a>`;
                      } else {
                          div.textContent = chatList[robotCount].text[nextTextOption];
                      }
                  } else if (robotCount > 1 && chatList[robotCount - 1].questionNextSupport) {
                      console.log('次の回答の選択肢は' + nextTextOption);
                      // 答えのない質問（次にサポートあり）
                      if(chatList[robotCount].link) {
                          div.innerHTML = `<a href= "${String(chatList[robotCount].text[nextTextOption])}" onclick= "chatbotLinkClick()">${String(chatList[robotCount].text[nextTextOption])}</a>`;
                      } else {
                          div.textContent = String(chatList[robotCount].text[nextTextOption]);
                      }
                  } else {
                      // 通常
                      if(chatList[robotCount].link) {
                          div.innerHTML = `<a href= "${chatList[robotCount].text}" onclick= "chatbotLinkClick()">${chatList[robotCount].text}</a>`;
                      } else {
                          div.textContent = chatList[robotCount].text;
                      }
                  }
              break;

              case 'random':
                  if(chatList[robotCount].link) {
                      div.innerHTML = `<a href= "${chatList[robotCount].text[Math.floor(Math.random() * chatList[robotCount].text.length)]}" onclick= "chatbotLinkClick()">${chatList[robotCount].text[Math.floor(Math.random() * chatList[robotCount].text.length)]}</a>`;
                  } else {
                      div.textContent = chatList[robotCount].text[Math.floor(Math.random() * chatList[robotCount].text.length)];
                  }
                  
              break;
          }
          chatSubmitBtn.disabled = false;
      }

      // 一番下までスクロール
      chatToBottom();

      // 連続投稿
      if (chatList[robotCount].continue) {
          robotOutput();
      }
  }, 2000);

  if(chatbotZoomState === 'large' && window.matchMedia('(min-width:700px)').matches) {
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

// 最初にロボットから話しかける
robotOutput();


// --------------------自分の投稿（送信ボタンを押した時の処理）--------------------
chatSubmitBtn.addEventListener('click', () => {

// 空行の場合送信不可
if (!userText.value || !userText.value.match(/\S/g)) return false;

userCount ++;

console.log(`userCount: ${userCount}`);

// 投稿内容を後に活用するために、配列に保存しておく
userData.push(userText.value);
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
div.textContent = userText.value;

if(robotCount < Object.keys(chatList).length) {
  robotOutput();
} else {
  // repeatRobotOutput(userText.value);
  repeatRobotOutput();
}

// 一番下までスクロール
chatToBottom();

// テキスト入力欄を空白にする
userText.value = '';
});


// 最後やまびこ
function repeatRobotOutput() {
  robotCount ++;
  console.log(robotCount);

  chatSubmitBtn.disabled = true;
                 
  const ul = document.getElementById('chatbot-ul');
  const li = document.createElement('li');
  li.classList.add('left');
  ul.appendChild(li);

  // 考え中アニメーションここから
  const robotLoadingDiv = document.createElement('div');

  setTimeout( ()=> {
      li.appendChild(robotLoadingDiv);
      robotLoadingDiv.classList.add('chatbot-left');
      robotLoadingDiv.innerHTML = '<div id= "robot-loading-field"><span id= "robot-loading-circle1" class="material-icons">circle</span> <span id= "robot-loading-circle2" class="material-icons">circle</span> <span id= "robot-loading-circle3" class="material-icons">circle</span>';
      console.log('考え中');
      // 考え中アニメーションここまで

      // 一番下までスクロール
      chatToBottom();
  }, 800);
  
  setTimeout( ()=> {

      // 考え中アニメーション削除
      robotLoadingDiv.remove();
    
      // このdivにテキストを指定
      const div = document.createElement('div');
      li.appendChild(div);
      div.classList.add('chatbot-left');

      div.textContent = userData[userCount - 1];
    
      // 一番下までスクロール
      chatToBottom();

      chatSubmitBtn.disabled = false;

  }, 2000);

  if(chatbotZoomState === 'large') {
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

