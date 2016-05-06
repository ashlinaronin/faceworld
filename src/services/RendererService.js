(function() {
	'use strict';

  	angular
		.module('faceworld')
		.factory('RendererService', Renderer);

        Renderer.$inject = ['$q', 'WebcamService', 'PhotosphereService'];

		function Renderer($q, WebcamService, PhotosphereService) {
            var renderer;
            var rendererDeferred = $q.defer();
			_init();

            function _init() {
                var renderer = new THREE.WebGLRenderer();
                renderer.setSize(window.innerWidth, window.innerHeight);
                renderer.domElement.setAttribute('id','renderer');
                document.body.appendChild(renderer.domElement);

                rendererDeferred.resolve(renderer);

				_addResizeListener();
            }

            function _addResizeListener() {
				rendererDeferred.promise.then(function(rd) {
					window.addEventListener('resize', function(){
	                	rd.domElement.width = window.innerWidth;
	                	rd.domElement.height = window.innerHeight;
						renderer.setSize(window.innerWidth, window.innerHeight);
	                }, false);
				});
            }

			return {
                getRenderer: function() {
                    return rendererDeferred.promise;
                }
            }
		}

})();
