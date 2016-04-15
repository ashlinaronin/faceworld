var video, canvas, context;

//createElements();
createElements();
initWebcam();

function createElements() {
    // None of these elements are in the DOM
    canvas = document.createElement('canvas');
    context = canvas.getContext('2d');
    video = document.createElement('video');
}

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

    video.addEventListener('canplay', function() {
        video.play();
        setTimeout(function() {
            takePic(function(dataUrl) {
                updateSphereMap(dataUrl);
            });
        }, 100);

    });
}

function onWebcamError(e) {
    console.log('sorry: ', e);
}

function takePic(cb) {
    // Video height and width aren't available until the stream starts, so
    // we grab em here
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    var dataURL = canvas.toDataURL('image/png');

    return cb(dataURL); // invoke cb with dataURL
}
