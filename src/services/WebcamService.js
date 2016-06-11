(function() {
    'use strict';

    angular
        .module('faceworld')
        .factory('WebcamService', Webcam);

    Webcam.$inject = ['$q'];

    function Webcam($q) {

        var canvas, context, video, videoTexture;
        var videoTextureDeferred = $q.defer();
        var videoContextDeferred = $q.defer();

        // start on load
        _createElements();
        _initUserMedia();

        function _initUserMedia() {
            navigator.getUserMedia = (navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia ||
                navigator.msGetUserMedia ||
                navigator.mediaDevices.getUserMedia);

            navigator.getUserMedia({
                video: true,
                audio: false
            }, _onWebcamSuccess, _onWebcamError);
        }

        function _createElements() {
            // None of these elements are in the DOM
            canvas = document.createElement('canvas');
            context = canvas.getContext('2d');
            video = document.createElement('video');
        }

        function _onWebcamSuccess(stream) {
            video.src = window.URL.createObjectURL(stream);

            video.onloadedmetadata = function() {
                video.play();
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
								_getVideoTexture();
								_getVideoContext();
            }
        }

        function _getVideoTexture() {
            // fill style if no video
            context.fillStyle = '#000000';
            context.fillRect(0, 0, canvas.width, canvas.height);

            videoTexture = new THREE.Texture(canvas);
            videoTexture.minFilter = THREE.LinearFilter;
            videoTexture.magFilter = THREE.LinearFilter;

            videoTextureDeferred.resolve(videoTexture);
        }

        function _getVideoContext() {
            // fill style if no video
            context.fillStyle = '#000000';
            context.fillRect(0, 0, canvas.width, canvas.height);
            videoContextDeferred.resolve(context);
        }

        function _drawVideoFrame() {
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                context.drawImage(video, 0, 0);
                if (videoTexture) {
                    videoTexture.needsUpdate = true;
                }
            }
        }

        function _onWebcamError(e) {
            console.log('sorry: ', e);
        }


        return {
            getVideoTexture: function() {
                return videoTextureDeferred.promise;
            },
            getVideoContext: function() {
                return videoContextDeferred.promise;
            },
            drawVideoFrame: _drawVideoFrame,
        }
    }

})();
