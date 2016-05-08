(function(){
	'use strict';

	angular
        .module('faceworld')
        .directive('scene', sceneDirective);

        sceneDirective.$inject = [
            '$q', 'CameraService', 'PhotosphereService',
            'RendererService', 'WebcamService', 'AsteroidsService',
			'LightsService', 'SpheresService', 'CactusesService',
			'StarsService'
        ];

        function sceneDirective($q, CameraService, PhotosphereService,
                    RendererService, WebcamService, AsteroidsService,
					LightsService, SpheresService, CactusesService,
					StarsService) {

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
                    // photosphere: PhotosphereService.getPhotosphere(),
                    renderer: RendererService.getRenderer(),
					pointLight: LightsService.getPointLight(),
					ambientLight: LightsService.getAmbientLight(),
                    webcamVideoTexture: WebcamService.getVideoTexture(),
					bigCactus: CactusesService.getOneBigCactus(),
					stars: StarsService.getParticles()
                }).then(function(resolved) {
                    // Add all the new resolved components to the components object
                    angular.extend(components, resolved);

                    addMouseMoveListener(components.renderer, components.camera, components.bigCactus);
                    // components.photosphere.material.map = components.webcamVideoTexture;

					components.scene.add(components.pointLight);
					components.scene.add(components.ambientLight);
                    components.scene.add(components.camera);
					components.scene.add(components.bigCactus);
					components.scene.add(components.stars);

					addTexturedObject(components.scene, components.bigCactus, components.webcamVideoTexture);

					// addTexturedObjects(components.scene, components.asteroids, components.webcamVideoTexture);
					// addTexturedObjects(components.scene, components.cactuses, components.webcamVideoTexture);
                    animate();
					console.dir(components.scene);
                });
            }

			// function addTexturedObjects(scene, objects, texture) {
			// 	objects.forEach(function(object) {
			// 		addTexturedObject(scene, object, texture);
			// 	});
			// }
			//
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
				StarsService.updateParticles();
				components.bigCactus.rotation.y += 0.005;
                components.renderer.render(components.scene, components.camera);
            }

            function addMouseMoveListener(renderer, camera, cactus) {
                renderer.domElement.addEventListener('mousemove', function(e){
					camera.rotation.x = Math.tan((window.innerHeight - e.x)/(window.innerHeight*2));
					camera.position.z = 20*Math.tan((window.innerHeight/2 + e.x)/(window.innerHeight));
					// camera.position.z = 20*Math.tan((window.innerHeight/2 + e.x)/(window.innerHeight)) + window.innerWidth/2;
					// cactus.position.z = -1000*((window.innerHeight/2 + e.x)/(window.innerHeight/2)) + 2000;
                }, false);
            }

			function onWindowResize() {
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				renderer.setSize(window.innerWidth, window.innerHeight);
			}
        }

})();
