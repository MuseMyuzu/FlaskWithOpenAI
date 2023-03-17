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
    /*
    fetch('/save_url', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: path
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
    })
    .catch(error => {
      console.error(error);
    });
    */
    /*
    recorder.ondataavailable = function(event) {
      // 録音された音声をフォームにセットする
      var fd = new FormData();
      fd.append('audio_data', blob, "audio.wav");
      document.getElementById('audio-data').value = URL.createObjectURL(blob);
      // フォームを送信する
      var xhr = new XMLHttpRequest();
      xhr.open('POST', '/save_wav', true);
      xhr.send(fd);
      alert("a");
    };
    */

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

