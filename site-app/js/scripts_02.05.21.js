// import * as THREE from './build/three.module.js';
// import * as STLLoader from './examples/js/loaders/STLLoader.js';
// import * as OrbitControls from './examples/js/controls/OrbitControls.js';

// !VA AALIYAH SITE SCRIPTS
// !VA 
console.log('scripts.js loaded');

     
function main() {
  // !VA Chapter 1 - Fundamentals
  // !VA canvas and renderer
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas});
  // !VA Camera. See the Lights chapter.
  const fov = 45;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  // !VA Changing 5 to 100. Nothing happens until you change camera.position
  // const far = 5;
  const far = 100;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  // !VA Changing camera.position to camera.position.set(0, 10, 20), as set in the Lights chapter.
  // camera.position.z = 2;
  camera.position.set(0, 10, 20);

  // !VA Note that you have to prefix all the new objects with the THREE keyword unless you import them as ES6 modules and include the object name in the import, as Greggman does. This is described in the OrbitControls section of the Lights chapter.
  const controls = new THREE.OrbitControls(camera, canvas);
  controls.target.set(0, 5, 0);
  controls.update();



  // !VA scene
  const scene = new THREE.Scene();
  // !VA light - light depends on material, the basic material doesn't refract light. See below under material
  scene.background = new THREE.Color('black');

  {
    const planeSize = 40;

    const loader = new THREE.TextureLoader();
    const texture = loader.load('https://threejsfundamentals.org/threejs/resources/images/checker.png');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    const repeats = planeSize / 2;
    texture.repeat.set(repeats, repeats);

    const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.rotation.x = Math.PI * -.5;
    scene.add(mesh);
  }
  {
    const cubeSize = 4;
    const cubeGeo = new THREE.BoxBufferGeometry(cubeSize, cubeSize, cubeSize);
    const cubeMat = new THREE.MeshPhongMaterial({color: '#8AC'});
    const mesh = new THREE.Mesh(cubeGeo, cubeMat);
    mesh.position.set(cubeSize + 1, cubeSize / 2, 0);
    scene.add(mesh);
  }
  {
    const sphereRadius = 3;
    const sphereWidthDivisions = 32;
    const sphereHeightDivisions = 16;
    const sphereGeo = new THREE.SphereBufferGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
    const sphereMat = new THREE.MeshPhongMaterial({color: '#CA8'});
    const mesh = new THREE.Mesh(sphereGeo, sphereMat);
    mesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
    scene.add(mesh);
  }

  // !VA GUI Helper (dat.GUI) is here: https://github.com/dataarts/dat.gui. Not using it, need ES6 modules to load it.
  // class ColorGUIHelper {
  //   constructor(object, prop) {
  //     this.object = object;
  //     this.prop = prop;
  //   }
  //   get value() {
  //     return `#${this.object[this.prop].getHexString()}`;
  //   }
  //   set value(hexString) {
  //     this.object[this.prop].set(hexString);
  //   }
  // }

  {
    const color = 0xFFFFFF;
    const directionallightintensity = 1;
    // !VA Directional light
    const directionallight = new THREE.DirectionalLight(color, directionallightintensity);
    directionallight.position.set(0, 10, 0);
    directionallight.target.position.set(-5, 0, 0);
    scene.add(directionallight);
    scene.add(directionallight.target);

    // !VA DirectionalLightHelper just helps by providing a visible representation of the directional light to help with positioning. You set the light position with the position vector values.
    const pointlightintensity = .5;
    const directionallighthelper = new THREE.DirectionalLightHelper(directionallight);
    scene.add(directionallighthelper);

    // !VA Point light - point lights have no target but has a distance
    const pointlightcolor = 0xff0000;
    const pointlight = new THREE.PointLight(pointlightcolor, pointlightintensity);
    pointlight.position.set( -5 , 10, 0);
    // !VA Pointlight distance is a value between 0 and non-zero. 0 means the light does not attenuate. There is no maximum but it's related to attenuation. I don't understand this, except that 40 seems to be the value that appears most often in examples. 
    pointlight.distance =  0;
    // pointlight.target.position.set(-5, 0, 0);
    scene.add(pointlight);

    const pointlighthelper = new THREE.PointLightHelper(pointlight);
    scene.add(pointlighthelper);

    // !VA Not using the GUI helper
    // const gui = new GUI();
    // gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
    // gui.add(light, 'intensity', 0, 2, 0.01);

  }

  // !VA This is from https://github.com/mrdoob/three.js/blob/master/examples/webgl_loader_stl.html
  const loader = new THREE.STLLoader();
  loader.load( 'housing.stl', function ( geometry ) {

    const material = new THREE.MeshPhongMaterial( { color: 0xff5533, specular: 0x111111, shininess: 200 } );
    const mesh = new THREE.Mesh( geometry, material );

    mesh.position.set( 0, - 0.25, 0.6 );
    mesh.position.set( 0, 0, 0 );
    mesh.rotation.set( 0, - Math.PI / 2, 0 );
    mesh.rotation.set( 0, - Math.PI / 2, 0 );
    mesh.scale.set( 0.5, 0.5, 0.5 );

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    scene.add( mesh );

  } );

  // !VA This centers the scene within the camera view: https://stackoverflow.com/questions/33700856/how-to-center-objects-in-the-browser-in-three-js
  camera.lookAt(scene.position);

  // camera.lookAt(mesh.position);


  // !VA Fix the jagged edges by setting renderer.setSize to the clientWidth and clientHeight properties. 
  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }


  // !VA This was only used for animation, which isn't being used now that the orbit controls are implemented.
  function render(time) {
    time *= 0.001;

    // !VA Execute resizeRendererToDisplaySize to determine if the canvas sizes changed and if it has set the renderer size accordingly. 
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    // !VA Ensure that the objects appear with the proper aspect ratio when the window is resized. 
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();


    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

}


// !VA run the main() function
main();

