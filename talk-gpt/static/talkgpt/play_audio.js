"use strict"

let audioCtx;
let audioSrc;
let gainNode;

// 録音開始ボタンを押されたら、再生は停止する。
const submitBtn = document.getElementById('chatbot-submit');
submitBtn.addEventListener('click', () => {
  audioSrc?.stop();
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

/*
// Web Audio APIを使用して音声を再生
function playAudio(blob) {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  gainNode = audioCtx.createGain();
  // 初期音量を設定
  updateVolume();

  const fileReader = new FileReader();
  fileReader.onload = () => {
    const arrayBuffer = fileReader.result;
    audioCtx.decodeAudioData(arrayBuffer, (decodedData) => {
      audioSrc = audioCtx.createBufferSource();
      audioSrc.buffer = decodedData;
      audioSrc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      audioSrc.start();
    });
  };
  fileReader.readAsArrayBuffer(blob);
}
*/

let audioBufferList = [];

function playAudio(blob) {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioCtx.createGain();
    // 初期音量を設定
    updateVolume();
  }

  const fileReader = new FileReader();
  fileReader.onload = () => {
    const arrayBuffer = fileReader.result;
    audioCtx.decodeAudioData(arrayBuffer, (decodedData) => {
      audioBufferList.push(decodedData);
      if (audioBufferList.length === 1) {
        playBuffer();
      }
    });
  };
  fileReader.readAsArrayBuffer(blob);
}

function playBuffer() {
  const audioSrc = audioCtx.createBufferSource();
  const buffer = audioCtx.createBuffer(audioBufferList.length, audioBufferList[0].length, audioBufferList[0].sampleRate);

  for (let i = 0; i < audioBufferList.length; i++) {
    buffer.getChannelData(i).set(audioBufferList[i].getChannelData(0));
  }

  audioSrc.buffer = buffer;
  audioSrc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  audioSrc.start();

  audioSrc.onended = () => {
    audioBufferList.shift();
    if (audioBufferList.length > 0) {
      playBuffer();
    }
  };
}

function updateVolume(){
  // gainNodeがnullなどでないとき、音量バーの数値を、sin波の音量に反映
  if(gainNode){
    gainNode.gain.value = volumeControl.value;
  }
}
