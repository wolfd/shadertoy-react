//==============================================================================
//
// piLibs 2015-2017 - http://www.iquilezles.org/www/material/piLibs/piLibs.htm
//
// piWebUtils
//
//==============================================================================

// RequestAnimationFrame
window.requestAnimFrame = (function() {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(cb) {
      window.setTimeout(cb, 1000 / 60);
    }
  );
})();

// performance.now
window.getRealTime = (function() {
  if ("performance" in window)
    return function() {
      return window.performance.now();
    };
  return function() {
    return new Date().getTime();
  };
})();

window.URL = window.URL || window.webkitURL;

navigator.getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia;

function htmlEntities(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function piDisableTouch() {
  document.body.addEventListener("touchstart", function(e) {
    e.preventDefault();
  });
}

var piGetTime = function(timestamp) {
  var monthstr = new Array();
  monthstr[0] = "Jan";
  monthstr[1] = "Feb";
  monthstr[2] = "Mar";
  monthstr[3] = "Apr";
  monthstr[4] = "May";
  monthstr[5] = "Jun";
  monthstr[6] = "Jul";
  monthstr[7] = "Aug";
  monthstr[8] = "Sep";
  monthstr[9] = "Oct";
  monthstr[10] = "Nov";
  monthstr[11] = "Dec";

  var a = new Date(timestamp * 1000);

  var time = a.getFullYear() + "-" + monthstr[a.getMonth()] + "-" + a.getDate();

  return time;
};

export function piGetCoords(obj) {
  var x = 0;
  var y = 0;
  do {
    x += obj.offsetLeft;
    y += obj.offsetTop;
  } while ((obj = obj.offsetParent));

  return { mX: x, mY: y };
}

export function piGetMouseCoords(ev, canvasElement) {
  var pos = piGetCoords(canvasElement);
  var mcx =
    ((ev.pageX - pos.mX) * canvasElement.width) / canvasElement.offsetWidth;
  var mcy =
    canvasElement.height -
    ((ev.pageY - pos.mY) * canvasElement.height) / canvasElement.offsetHeight;

  return { mX: mcx, mY: mcy };
}

export function piGetSourceElement(e) {
  var ele = null;
  if (e.target) ele = e.target;
  if (e.srcElement) ele = e.srcElement;
  return ele;
}

export function piRequestFullScreen(ele) {
  if (ele == null) ele = document.documentElement;
  if (ele.requestFullscreen) ele.requestFullscreen();
  else if (ele.msRequestFullscreen) ele.msRequestFullscreen();
  else if (ele.mozRequestFullScreen) ele.mozRequestFullScreen();
  else if (ele.webkitRequestFullscreen)
    ele.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
}

export function piIsFullScreen() {
  return (
    document.fullscreen ||
    document.mozFullScreen ||
    document.webkitIsFullScreen ||
    document.msFullscreenElement ||
    false
  );
}

export function piExitFullScreen() {
  if (document.exitFullscreen) document.exitFullscreen();
  else if (document.msExitFullscreen) document.msExitFullscreen();
  else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
  else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
}

export function piCreateGlContext(
  cv,
  useAlpha,
  useDepth,
  usePreserveBuffer,
  useSupersampling
) {
  var opts = {
    alpha: useAlpha,
    depth: useDepth,
    stencil: false,
    premultipliedAlpha: false,
    antialias: useSupersampling,
    preserveDrawingBuffer: usePreserveBuffer,
    powerPreference: "high-performance"
  }; // "low_power", "high_performance", "default"

  var gl = null;
  if (gl == null) gl = cv.getContext("webgl2", opts);
  if (gl == null) gl = cv.getContext("experimental-webgl2", opts);
  if (gl == null) gl = cv.getContext("webgl", opts);
  if (gl == null) gl = cv.getContext("experimental-webgl", opts);

  //console.log( gl.getContextAttributes() );

  return gl;
}

export function piCreateAudioContext() {
  var res = null;
  try {
    if (window.AudioContext) res = new AudioContext();
  } catch (e) {
    res = null;
  }
  return res;
}

export function piHexColorToRGB(str) {
  // "#ff3041"
  var rgb = parseInt(str.slice(1), 16);
  var r = (rgb >> 16) & 255;
  var g = (rgb >> 8) & 255;
  var b = (rgb >> 0) & 255;
  return [r, g, b];
}

export function piCreateFPSCounter() {
  var mFrame;
  var mTo;
  var mFPS;

  var iReset = function(time) {
    mFrame = 0;
    mTo = time;
    mFPS = 60.0;
  };

  var iCount = function(time) {
    mFrame++;

    if (time - mTo > 500.0) {
      mFPS = (1000.0 * mFrame) / (time - mTo);
      mFrame = 0;
      mTo = time;
      return true;
    }
    return false;
  };

  var iGetFPS = function() {
    return mFPS;
  };

  return { Reset: iReset, Count: iCount, GetFPS: iGetFPS };
}

export function piCanMediaRecorded(canvas) {
  if (
    typeof window.MediaRecorder !== "function" ||
    typeof canvas.captureStream !== "function"
  ) {
    return false;
  }
  return true;
}

export function piCreateMediaRecorder(isRecordingCallback, canvas) {
  if (piCanMediaRecorded(canvas) == false) {
    return null;
  }

  var mediaRecorder = new MediaRecorder(canvas.captureStream());
  var chunks = [];

  mediaRecorder.ondataavailable = function(e) {
    if (e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  mediaRecorder.onstart = function() {
    isRecordingCallback(true);
  };

  mediaRecorder.onstop = function() {
    isRecordingCallback(false);
    let blob = new Blob(chunks, { type: "video/webm" });
    chunks = [];
    let videoURL = window.URL.createObjectURL(blob);
    let url = window.URL.createObjectURL(blob);
    let a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = url;
    a.download = "capture.webm";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return mediaRecorder;
}
