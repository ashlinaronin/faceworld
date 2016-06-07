(function() {
	'use strict';

  	angular
		.module('faceworld')
		.factory('SynthPadService', SynthPad);

        SynthPad.$inject = ['$q', '$document', 'RendererService'];

		function SynthPad($q, $document, RendererService) {

            var synthPadDeferred = $q.defer();

            var rendererPromise = RendererService.getRenderer();
            var renderer;

            var frequencyLabel, volumeLabel;
            var audioContext, oscillator, gainNode;

            var lowNote = 261.63; // C4
            var highNote = 493.88; // B4

            // @private
            function _init() {
                audioContext = new AudioContext();
                _setupEventListeners();
            }

            function _setupEventListeners() {
                rendererPromise.then(function(resolvedRenderer) {
                    renderer = resolvedRenderer;
                    _disableTouchDeviceScrolling();

                    renderer.domElement.addEventListener('mousedown', _playSound);
					renderer.domElement.addEventListener('touchstart', _playSound);
                    renderer.domElement.addEventListener('mouseup', _stopSound);
					renderer.domElement.addEventListener('touchend', _stopSound);
					$document.on('mouseleave', _stopSound);
                });
            }

            function _disableTouchDeviceScrolling() {
				$document.on('touchmove', function(event) {
                    event.preventDefault();
                });
            }

            function _playSound(event) {
                oscillator = audioContext.createOscillator();
                gainNode = audioContext.createGain();

                oscillator.type = 'triangle';

                gainNode.connect(audioContext.destination);
                oscillator.connect(gainNode);

                _updateFrequency(event);

                oscillator.start(0);

                renderer.domElement.addEventListener('mousemove', _updateFrequency);
				renderer.domElement.addEventListener('touchmove', _updateFrequency);
                renderer.domElement.addEventListener('mouseout', _stopSound);
            }

            function _stopSound(event) {
				if (oscillator) {
					oscillator.stop(0);
				}


                renderer.domElement.removeEventListener('mousemove', _updateFrequency);
				renderer.domElement.removeEventListener('touchmove', _updateFrequency);
                renderer.domElement.removeEventListener('mouseout', _stopSound);
            }

            function _calculateNote(posX) {
                var noteDifference = highNote - lowNote;
                var noteOffset = (noteDifference / renderer.domElement.offsetWidth) * (posX - renderer.domElement.offsetLeft);
                return lowNote + noteOffset;
            }

            function _calculateVolume(posY) {
                var volumeLevel = 1 - (((100 / renderer.domElement.offsetHeight) * (posY - renderer.domElement.offsetTop)) / 100);
                return volumeLevel;
            }

            function _calculateFrequency(x, y) {
                var noteValue = _calculateNote(x);
                var volumeValue = _calculateVolume(y);

                oscillator.frequency.value = noteValue;
                gainNode.gain.value = volumeValue;

                console.log('freq: ', Math.floor(noteValue) + ' hz');
                console.log('vol: ', Math.floor(volumeValue * 100) + '%');
            }

            function _updateFrequency(event) {
                if (event.type === 'mousedown' || event.type === 'mousemove') {
                    _calculateFrequency(event.x, event.y);
                } else if (event.type === 'touchstart' || event.type === 'touchmove') {
                    var touch = event.touches[0];
                    _calculateFrequency(touch.pageX, touch.pageY);
                }
            }

            // @public
			return {
                getSynthPad: function() {
                    return synthPadDeferred.promise;
                },
                init: _init
            }
		}

})();
