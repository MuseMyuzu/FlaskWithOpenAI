"use strict"

let audioCtx;
let audioSrc = null;
let gainNode;
let audioBufferList = [];

// 録音開始ボタンを押されたら、再生は停止する。
const submitBtn = document.getElementById('chatbot-submit');
submitBtn.addEventListener('click', () => {
  audioSrc?.stop();
  audioBufferList = [];
  robotLoadingDiv?.remove();
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

function playAudio(blob) {
  // 音声を鳴らす初期設定
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioCtx.createGain();
    // 初期音量を設定
    updateVolume();
  }

  // blobをarrayBufferにして再生する
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
  audioSrc = audioCtx.createBufferSource();
  audioSrc.buffer = audioBufferList[0];
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
