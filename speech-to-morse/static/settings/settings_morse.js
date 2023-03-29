"use strict"

function backToHome() {
    // モールスの速さ（duration）を取得
    const durRangeDiv = document.getElementById("dur-range");
    const durRangeValue = durRangeDiv.value;
    
    location.assign("./?dur=" + durRangeValue);
}
