import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import coffeeSmokVertexShader from './shaders/coffeeSmoke/vertex.glsl'
import coffeeSmokFragmentShader from './shaders/coffeeSmoke/fragment.glsl'

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
const textureLoader = new THREE.TextureLoader()
const gltfLoader = new GLTFLoader()

/**
 * Sizes
 */
const tweaks = {
    speed: 1,
    color: {
        value: { r: 0.6, g: 0.3, b: 0.2 },
    },
    raw: false
}

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 6
camera.position.z = 22
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.y = 3
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Model
 */
gltfLoader.load(
    './bakedModel.glb',
    (gltf) =>
    {
        gltf.scene.getObjectByName('baked').material.map.anisotropy = 8
        scene.add(gltf.scene)
    }
)

/**
 * Smoke
 */
// Geometry
const smokeGeometry = new THREE.PlaneGeometry(1, 1, 16, 64);
smokeGeometry.translate(0, 0.5, 0)
smokeGeometry.scale(1.5, 6, 1.5)

// Perlin texture
const perlinTexture = textureLoader.load('./perlin.png')
perlinTexture.wrapS = THREE.RepeatWrapping
perlinTexture.wrapT = THREE.RepeatWrapping

// Material
const smokeMaterial = new THREE.ShaderMaterial({
    vertexShader: coffeeSmokVertexShader,
    fragmentShader: coffeeSmokFragmentShader,
    side: THREE.DoubleSide,
    uniforms: {
        uTime: new THREE.Uniform(0),
        uPerlinTexture: new THREE.Uniform(perlinTexture), 
        uColor: new THREE.Uniform(tweaks.color.value),
        uOpacity: new THREE.Uniform(1),
        uRaw: new THREE.Uniform(tweaks.raw)
    },    
    transparent: true,
    depthWrite: false,
})

const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial)
smoke.position.y = 1.83

scene.add(smoke)

/**
 * GUI
 */
gui.add(tweaks, 'raw').name('raw material').onChange((value) => {
    smokeMaterial.uniforms.uRaw.value = value;
});
gui.add(tweaks, 'speed').name('speed').step(0.01).min(0).max(10)
gui.add(smokeMaterial, 'wireframe').name('wireframe').enable(true)
gui.add(smokeMaterial.uniforms.uOpacity, 'value').name('opacity').step(0.01).min(0).max(1)
gui.addColor(tweaks.color, 'value');

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{    
    const elapsedTime = clock.getElapsedTime()

    // Update smoke
    smoke.material.uniforms.uTime.value = elapsedTime * tweaks.speed

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()