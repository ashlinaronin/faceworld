(function() {
	'use strict';

  	angular
		.module('faceworld')
		.factory('BackgroundVideoService', BackgroundVideo);

        BackgroundVideo.$inject = ['$q'];

		function BackgroundVideo($q) {

            var canvas, context, video, videoTexture;
            var videoTextureDeferred = $q.defer();

            // start on load
            _createElements();
            _startVideo('assets/palms.mp4');
            _getVideoTexture();

            function _createElements() {
                // None of these elements are in the DOM
                canvas = document.createElement('canvas');
                context = canvas.getContext('2d');
                video = document.createElement('video');
            }

            function _startVideo(url) {
                video.src = url;
                video.load();

                video.onloadedmetadata = function() {
                    video.play();
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    console.dir(video);
                    console.dir(canvas);
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

            function _drawVideoFrame() {
                if (video.readyState === video.HAVE_ENOUGH_DATA) {
                    context.drawImage(video, 0, 0);
                    if (videoTexture) {
                        videoTexture.needsUpdate = true;
                    }
                }
            }

            function _onBackgroundVideoError(e) {
                console.log('sorry: ', e);
            }


			return {
                getVideoTexture: function() {
                    return videoTextureDeferred.promise;
                },
                drawVideoFrame: _drawVideoFrame,
            }
		}

})();
