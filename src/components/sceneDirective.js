(function(){
	'use strict';

	angular
        .module('faceworld')
        .directive('scene', sceneDirective);

        sceneDirective.$inject = [
            '$q', 'CameraService', 'PhotosphereService',
            'RendererService', 'WebcamService', 'AsteroidsService',
			'LightsService', 'SpheresService', 'CactusesService'
        ];

        function sceneDirective($q, CameraService, PhotosphereService,
                    RendererService, WebcamService, AsteroidsService,
					LightsService, SpheresService, CactusesService) {

            var directive = {
                link: link,
                restrict: 'EA'
            }

            var components = {
                scene: new THREE.Scene()
            }

            return directive;

            function link(scope, element, attrs) {

                $q.all({
                    camera: CameraService.getCamera(),
                    photosphere: PhotosphereService.getPhotosphere(),
                    renderer: RendererService.getRenderer(),
					pointLight: LightsService.getPointLight(),
					ambientLight: LightsService.getAmbientLight(),
                    videoTexture: WebcamService.getVideoTexture(),
					asteroids: AsteroidsService.getAsteroids(),
					cactuses: CactusesService.getCactuses(),
					bigCactus: CactusesService.getOneBigCactus()
					// spheres: SpheresService.getSpheres()
                }).then(function(resolved) {
                    // Add all the new resolved components to the components object
                    angular.extend(components, resolved);

                    addMouseMoveListener(components.renderer, components.camera, components.photosphere);
                    components.photosphere.material.map = components.videoTexture;

                    // components.scene.add(components.photosphere);
					components.scene.add(components.pointLight);
					components.scene.add(components.ambientLight);
                    components.scene.add(components.camera);
					components.scene.add(components.bigCactus);
					addTexturedObject(components.scene, components.bigCactus, components.videoTexture);
					addTexturedObjects(components.scene, components.asteroids, components.videoTexture);
					// addTexturedObjects(components.scene, components.cactuses, components.videoTexture);
                    animate();
                });
            }

			function addTexturedObjects(scene, objects, texture) {
				objects.forEach(function(object) {
					addTexturedObject(scene, object, texture);
				});
			}

			function addTexturedObject(scene, object, texture) {
				object.traverse(function(child) {
					if (child instanceof THREE.Mesh) {
						child.material.map = texture;
						child.material.needsUpdate = true;
					}
				});
				scene.add(object);
			}

            function animate() {
                window.requestAnimationFrame(animate);
                WebcamService.drawVideoFrame();
				AsteroidsService.rotateAsteroids(components.asteroids);
				CactusesService.rotateCactuses(components.cactuses);
				// components.camera.rotation.x += 0.001;
				// components.camera.position.z -= 0.1;
                components.renderer.render(components.scene, components.camera);
            }

            function addMouseMoveListener(renderer, camera, photosphere) {
                renderer.domElement.addEventListener('mousemove', function(e){
                    camera.rotation.x = Math.tan((window.innerHeight/2 - e.y)/(window.innerHeight/2));
                    photosphere.rotation.y = 4*Math.tan(e.x/window.innerWidth);
                }, false);
            }
        }

})();
