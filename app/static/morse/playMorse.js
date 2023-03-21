"use strict"

const AudioContext = window.AudioContext || window.webkitAudioContext;

let oscillator;
let gainNode;

// 録音開始ボタンを押されたら、モールス再生は停止する。
const submitBtn = document.getElementById('chatbot-submit');
submitBtn.addEventListener('click', () => {
  oscillator?.stop();
});

var volumeControl = document.getElementById('volume-range');
const volumeIcon = document.getElementById("volume-icon");
volumeControl.addEventListener('input', function() {
  // 音量バーを取得し、変更された時に音量を更新
  updateVolume();

  // 音量が0の場合、アイコンをミュートにする
  if(Number(volumeControl.value) === 0){
    volumeIcon.textContent = "volume_off";
  }else{
    volumeIcon.textContent = "volume_up";
  }
});

// Web Audio APIを使用してモールス信号を再生
function playMorseCode(text) {
  // モールス信号のパラメータを設定
  const durDict = {1: 35, 2: 50, 3: 75, 4: 100, 5: 150};
  const durationDiv = document.getElementById("duration");
  var durNumber = Number(durationDiv.textContent);
  // 値が設定されてない場合、スピードに3を代入
  if(1 <= durNumber && durNumber < 5){
    ;
  }else{
      durNumber = 3;
  }
  const dotDuration = durDict[durNumber] // ドットの持続時間（ミリ秒）
  const dashDuration = dotDuration * 3; // ダッシュの持続時間（ミリ秒）
  const pauseDuration = dotDuration; // 文字間の休止時間（ミリ秒）

  // オシレータ生成
  const audioCtx = new AudioContext();
  gainNode = audioCtx.createGain();
  // 初期音量を設定
  updateVolume();
  oscillator = audioCtx.createOscillator();
  oscillator.type = 'sine';
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  // モールス再生
  oscillator.start();
  console.log("start");

  // モールスのトンツー作成
  let time = audioCtx.currentTime;
  // モールスのうち、[]で囲まれた部分のみ削除
  text = text.replace(/\[[^\]]+\]/g, "");
  text.split('').flatMap((char) => {
    if (char === ".") {
      oscillator.frequency.setValueAtTime(800, time);
      time += dotDuration / 1000;
    } else if (char === "-") {
      oscillator.frequency.setValueAtTime(800, time);
      time += dashDuration / 1000;
    } else if (char === " ") {
      oscillator.frequency.setValueAtTime(0, time);
      time += pauseDuration / 1000;
    }
    oscillator.frequency.setValueAtTime(0, time);
    time += pauseDuration / 1000;
  })

  oscillator.stop(time);
}

function updateVolume(){
  // gainNodeがnullなどでないとき、音量バーの数値を、sin波の音量に反映
  if(gainNode){
    gainNode.gain.value = volumeControl.value;
  }
}