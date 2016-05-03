(function(){
	'use strict';

	angular
        .module('faceworld')
		.factory('LightsService', Lights);

        Lights.$inject = ['$q'];

        function Lights($q) {

            var pointLightDeferred = $q.defer();
            var ambientLightDeferred = $q.defer();

            var pointLight = new THREE.PointLight(0xffffff);
            pointLightDeferred.resolve(pointLight);

            var ambientLight = new THREE.AmbientLight(0x404040);
            ambientLightDeferred.resolve(ambientLight);

            return {
                getPointLight: function() {
                    return pointLightDeferred.promise;
                },
                getAmbientLight: function() {
                    return ambientLightDeferred.promise;
                }
            }
        }

})();
