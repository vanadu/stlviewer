// !VA If type="module" is added to scripts.js declaration then ES6 import will work, but eslint flags the first import declaration as an error.
import * as THREE from '../build/three.module.js';
import { GridHelper } from '../src/helpers/GridHelper.js';
import {OrbitControls} from '../examples/jsm/controls/OrbitControls.js';
import { STLLoader } from '../examples/jsm/loaders/STLLoader.js';

const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({canvas});
const scene = new THREE.Scene();


// Global variables for bounding boxes
let bbox;

const loader = new STLLoader();
const promise = loader.loadAsync('model1.stl');
promise.then(function ( geometry ) {
  const material = new THREE.MeshPhongMaterial( { color: 0xff5533, specular: 0x111111, shininess: 200 } );
  const mesh = new THREE.Mesh( geometry, material );
  // !VA Cener the mesh geometry in the scene.
  geometry.center();
  mesh.geometry.computeBoundingBox();
  bbox = mesh.geometry.boundingBox;
  console.log(`bbox.max.y :>> ${bbox.max.y};`)
  // !VA Takes rotation values in radians, so convert, see function at top of main closure
  // !VA Rotate model so it is standing upright.
  // mesh.rotation.x = deg2rad(270);
  // mesh.rotation.y = 0;
  // mesh.rotation.z =0;
  // console.log('mesh.rotation :>> ');
  // console.log(mesh.rotation);
  // mesh.position.set( 0, - 0.25, 0.6 );
  mesh.position.set( 0, bbox.max.y, 0 );
  // !VA Rotation, the original is commented
  // mesh.rotation.set( 0, - Math.PI / 2, 0 );
  mesh.rotation.set( 0, 0, 0 );
  // !VA Trying to manipulate, the original is commented
  // mesh.scale.set( 0.5, 0.5, 0.5 );
  // mesh.scale.set( 0.25, 0.25, 0.25 );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add( mesh );
  buildScene();
  console.log('STL file loaded!');
}).catch(failureCallback);

function failureCallback(){
  console.log('Could not load STL file!');
}

function buildScene() {
  console.log('STL file is loaded, so now build the scene');
  // !VA bounding box of the STL mesh accessible now
  console.log(bbox);
  // !VA Camera. See the Lights chapter.
  const fov = 45;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  // !VA Changing 5 to 100. Nothing happens until you change camera.position
  // const far = 5;
  // const far = 100;
  const far = 1000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  // !VA Changing camera.position to camera.position.set(0, 10, 20), as set in the Lights chapter.
  // !VA Original is commented below
  // camera.position.set(0, 10, 20);
  // !VA Moving camera up and back
  camera.position.set(12.5 * 3, 12.5 * 3, 45 * 3);
  // camera.position.z = 2;
  // !VA Note that you have to prefix all the new objects with the THREE keyword unless you import them as ES6 modules and include the object name in the import, as Greggman does. This is described in the OrbitControls section of the Lights chapter.
  // !VA IMPORTING AS ES6 MODULE - NOT A CHILD OF THE THREE OBJECT!
  // const controls = new THREE.OrbitControls(camera, canvas);
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 5, 0);
  controls.update();
  // !VA light - light depends on material, the basic material doesn't refract light. See below under material
  scene.background = new THREE.Color('black');
  {
    const gridHelper = new THREE.GridHelper( 400, 40, 0x0000ff, 0x808080 );
    gridHelper.position.y = 0;
    gridHelper.position.x = 0;
    scene.add( gridHelper );
  }

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
  }

  // !VA This centers the scene within the camera view: https://stackoverflow.com/questions/33700856/how-to-center-objects-in-the-browser-in-three-js
  // camera.lookAt(scene.position);

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
  // !VA Log camera position on button click
  document.getElementById('button').onclick = function() {
    // console.clear();
    console.log('Camera Position X :>> ' + camera.position.x);
    console.log('Camera Position Y :>> ' + camera.position.y);
    console.log('Camera Position Z :>> ' + camera.position.z);
    console.log('Camera Rotation X :>> ' + camera.rotation.x);
    console.log('Camera Rotation Y :>> ' + camera.rotation.y);
    console.log('Camera Rotation Z :>> ' + camera.rotation.z);
    //controls.target.set(-0.041, 1.9, -1.21);
    // camera.position.set(-0.041, 1.9, -1.21);
    // controls.update();
  };
}


