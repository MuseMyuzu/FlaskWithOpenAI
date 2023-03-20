"use strict"

// モールス信号のパラメータを設定
const dotDuration = 200; // ドットの持続時間（ミリ秒）
const dashDuration = dotDuration * 3; // ダッシュの持続時間（ミリ秒）
const pauseDuration = dotDuration; // 文字間の休止時間（ミリ秒）

// Web Audio APIを使用してモールス信号を再生
function playMorseCode(text) {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioContext();
  const oscillator = audioCtx.createOscillator();
  oscillator.type = 'sine';
  oscillator.connect(audioCtx.destination);
  oscillator.start();

  const sequence = text.split('').flatMap((char) => {
    if (char){
        if(char === " "){
            return [pauseDuration * 2];
        }else if(char === ".") {
            return [dotDuration, pauseDuration];
        }else if(char === "-") {
            return [dashDuration, pauseDuration];
        }
    }
    return [];
  });

  console.log(sequence);
  
  let time = audioCtx.currentTime;
  sequence.forEach((duration) => {
    oscillator.frequency.setValueAtTime(800, time);
    time += duration / 1000;
    oscillator.frequency.setValueAtTime(0, time);
    time += pauseDuration / 1000;
  });

  oscillator.stop(time);
}