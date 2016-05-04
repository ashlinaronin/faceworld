(function(){
	'use strict';

	angular
        .module('faceworld')
		.factory('PhotosphereService', Photosphere);

        Photosphere.$inject = ['$q'];

        function Photosphere($q) {

            var photosphereDeferred = $q.defer();

            var sphereGeo = new THREE.SphereGeometry(800,32,32);
            var sphereTex = new THREE.MeshBasicMaterial({
            	color: 0xffffff,
            	side: THREE.BackSide
            });
            var photosphere = new THREE.Mesh(sphereGeo, sphereTex);

            photosphereDeferred.resolve(photosphere);

            return {
                getPhotosphere: function() {
                    return photosphereDeferred.promise;
                }
            }
        }

})();
