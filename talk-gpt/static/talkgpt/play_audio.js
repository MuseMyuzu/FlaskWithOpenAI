"use strict"

let audioCtx;
let audioSrc;
let gainNode;

// 録音開始ボタンを押されたら、モールス再生は停止する。
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

// Web Audio APIを使用して音声を再生
function playAudio(audioData) {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  audioSrc = audioCtx.createBufferSource();

  gainNode = audioCtx.createGain();
  // 初期音量を設定
  updateVolume();

  /*
  audioCtx.decodeAudioData(audioData, (audioBuffer) => {
    audioSrc.buffer = audioBuffer;
    audioSrc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    audioSrc.start();

    audioSrc.stop(audioCtx.currentTime + 100);
  })
  */

  const fileReader = new FileReader();
  fileReader.onload = () => {
    const arrayBuffer = fileReader.result;
    audioCtx.decodeAudioData(arrayBuffer, (decodedData) => {
      const source = audioCtx.createBufferSource();
      source.buffer = decodedData;
      source.connect(audioCtx.destination);
      source.start();
    });
  };
  fileReader.readAsArrayBuffer(audioData);
}

function updateVolume(){
  // gainNodeがnullなどでないとき、音量バーの数値を、sin波の音量に反映
  if(gainNode){
    gainNode.gain.value = volumeControl.value;
  }
}