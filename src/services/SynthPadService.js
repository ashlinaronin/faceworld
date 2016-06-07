(function() {
	'use strict';

  	angular
		.module('faceworld')
		.factory('SynthPadService', SynthPad);

        SynthPad.$inject = ['$q', '$document', 'RendererService'];

		function SynthPad($q, $document, RendererService) {

            var synthPadDeferred = $q.defer();

            var rendererPromise = RendererService.getRenderer();
            var canvas;

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
                    canvas = resolvedRenderer.domElement;
                    _disableTouchDeviceScrolling();

					angular.element(canvas).on('mousedown touchstart', _playSound);
					angular.element(canvas).on('mouseup touchend', _stopSound);
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

                _updateSound(event);

                oscillator.start(0);

				angular.element(canvas).on('mousemove touchmove', _updateSound);
				angular.element(canvas).on('mouseout', _stopSound);
            }

            function _stopSound(event) {
				if (oscillator) {
					oscillator.stop(0);
				}

				angular.element(canvas).off('mousemove touchmove', _updateSound);
				angular.element(canvas).off('mouseout', _stopSound);
            }

            function _calculatePitch(posX) {
                var noteDifference = highNote - lowNote;
                var noteOffset = (noteDifference / canvas.offsetWidth) * (posX - canvas.offsetLeft);
                return lowNote + noteOffset;
            }

            function _calculateVolume(posY) {
                var volumeLevel = 1 - (((100 / canvas.offsetHeight) * (posY - canvas.offsetTop)) / 100);
                return volumeLevel;
            }

            function _calculateNote(x, y) {
                var noteValue = _calculatePitch(x);
                var volumeValue = _calculateVolume(y);

                oscillator.frequency.value = noteValue;
                gainNode.gain.value = volumeValue;

                console.log('freq: ', Math.floor(noteValue) + ' hz');
                console.log('vol: ', Math.floor(volumeValue * 100) + '%');
            }

            function _updateSound(event) {
                if (event.type === 'mousedown' || event.type === 'mousemove') {
                    _calculateNote(event.x, event.y);
                } else if (event.type === 'touchstart' || event.type === 'touchmove') {
                    var touch = event.touches[0];
                    _calculateNote(touch.pageX, touch.pageY);
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
