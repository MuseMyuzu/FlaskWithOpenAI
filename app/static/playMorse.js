function playMorseCode(morseCode) {
    // 音声を鳴らすためのAudioContextオブジェクトを生成
    const audioContext = new AudioContext();
    // モールス信号を再生する周波数（Hz）
    const frequency = 500;
    // モールス信号を再生する長さ（ms）
    const duration = 200;
  
    // モールス信号を分解して再生する
    for (let i = 0; i < morseCode.length; i++) {
      const signal = morseCode[i];
      if (signal === '.') {
        playSignal(frequency, duration, audioContext);
      } else if (signal === '-') {
        playSignal(frequency, duration * 3, audioContext);
      }
      // 信号間の間隔を挿入する
      if (i !== morseCode.length - 1) {
        pause(duration, audioContext);
      }
    }
  }
  
  // 信号を再生する関数
  function playSignal(frequency, duration, audioContext) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
  
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
  
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gainNode.gain.value = 0.1;
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  }
  
  // 信号間の間隔を挿入する関数
  function pause(duration, audioContext) {
    const gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination