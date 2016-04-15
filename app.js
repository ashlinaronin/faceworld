var video = document.getElementById('webcam');
var canvas = document.getElementById('selfie-canvas');
var context = canvas.getContext('2d');
var snapshot = document.getElementById('snapshot');

initWebcam();

function initWebcam() {
    navigator.getUserMedia = (navigator.getUserMedia ||
                        navigator.webkitGetUserMedia ||
                        navigator.mozGetUserMedia ||
                        navigator.msGetUserMedia ||
                        navigator.mediaDevices.getUserMedia);

    navigator.getUserMedia({video: true, audio: false}, onWebcamSuccess, onWebcamError);
}

function onWebcamSuccess(stream) {
    video.src = window.URL.createObjectURL(stream);
    video.onloadedmetadata = function(e) {
        video.play();
    }
}

function onWebcamError(e) {
    console.log('sorry: ', e);
}

function takePic(stream, cb) {
    // Video height and width aren't available until the stream starts, so
    // we grab em here
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    var dataURL = canvas.toDataURL('image/png');

    return cb(dataURL); // invoke cb with dataURL
}
