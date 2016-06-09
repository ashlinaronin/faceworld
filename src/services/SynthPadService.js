(function() {
	'use strict';

  	angular
		.module('faceworld')
		.factory('SynthPadService', SynthPad);

        SynthPad.$inject = ['$q', '$document', '$window', 'RendererService'];

		function SynthPad($q, $document, $window, RendererService) {

            var synthPadDeferred = $q.defer();

            var rendererPromise = RendererService.getRenderer();
            var canvas;

            var frequencyLabel, volumeLabel;
            var audioContext, gainNode, panner;
			var oscillators = [];

            // var lowNote = 261.63; // C4
			var lowNote = 140;
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
				_createDevices();
				_connectDevices();
                _updateSound(event);
				_startOscillators();

				angular.element(canvas).on('mousemove touchmove', _updateSound);
				angular.element(canvas).on('mouseout', _stopSound);
            }

			function _startOscillators() {
				for (var i = 0; i < oscillators.length; i++) {
					oscillators[i].start(0);
				}
			}

			function _createDevices() {
				_createOscillators({
					numberOfOscillators: 15,
					type: 'triangle',
					detuneSeed: 150
				});
                gainNode = audioContext.createGain();
			}

			function _createOscillators(options) {
				for (var i = 0; i < options.numberOfOscillators; i++) {
					var oscillator = audioContext.createOscillator();
					oscillator.type = options.type;
					oscillator.detune.value = Math.random() * options.detuneSeed;
					oscillators.push(oscillator);
				}
			}

			function _connectOscillatorsToGain() {
				for (var i = 0; i < oscillators.length; i++) {
					oscillators[i].connect(gainNode);
				}
			}

			function _connectDevices() {
				_connectOscillatorsToGain();
                gainNode.connect(audioContext.destination);
			}

            function _stopSound(event) {
				_stopOscillators();
				_deleteOscillators();

				angular.element(canvas).off('mousemove touchmove', _updateSound);
				angular.element(canvas).off('mouseout', _stopSound);
            }

			function _stopOscillators() {
				if (oscillators.length) {
					for (var i = 0; i < oscillators.length; i++) {
						oscillators[i].stop(0);
					}
				}
			}

			function _deleteOscillators() {
				oscillators = [];
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

				_setOscillatorsFrequency(noteValue);
                gainNode.gain.value = volumeValue;

                console.log('freq: ', Math.floor(noteValue) + ' hz');
                console.log('vol: ', Math.floor(volumeValue * 100) + '%');
            }

			function _setOscillatorsFrequency(freq) {
				for (var i = 0; i < oscillators.length; i++) {
					oscillators[i].frequency.value = freq;
				}
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
