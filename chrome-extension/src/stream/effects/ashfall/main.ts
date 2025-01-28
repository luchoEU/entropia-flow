/*
Most of the stuff in here is just bootstrapping. Essentially it's just
setting ThreeJS up so that it renders a flat surface upon which to draw 
the shader. The only thing to see here really is the uniforms sent to 
the shader. Apart from that all of the magic happens in the HTML view
under the fragment shader.
*/

declare const window: any
import vertexShader from './vertexShader'
import fragmentShader from './fragmentShader'
import * as THREE from 'three';
import { NOISE_PNG } from './noise.png'
import { AnimatedBackground } from "../baseBackground";

class AshfallBackground extends AnimatedBackground {
    private camera: any
    private scene: any
    private renderer: any
    private uniforms: any
    
    constructor(container: HTMLElement) {
        super(container)
        const loader = new THREE.TextureLoader();
        loader.setCrossOrigin("anonymous");
        loader.load(NOISE_PNG, // Embbed noise.png to avoid CORS in Entropia Flow Client
            function(texture: any) {
                this.init(texture)
                this.setReady()
            }.bind(this))
        }
        
        private init(texture: any) {
            this.camera = new THREE.Camera();
            this.camera.position.z = 1;
            
            this.scene = new THREE.Scene();
            
            const geometry = new THREE.PlaneGeometry( 2, 2 );
            
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.minFilter = THREE.LinearFilter;
            
            this.uniforms = {
                u_time: { type: "f", value: 1.0 },
                u_resolution: { type: "v2", value: new THREE.Vector2() },
                u_noise: { type: "t", value: texture },
                u_mouse: { type: "v2", value: new THREE.Vector2() }
            };
            
            var material = new THREE.ShaderMaterial( {
                uniforms: this.uniforms,
                vertexShader: vertexShader,
                fragmentShader: fragmentShader
            } )
            material.extensions.derivatives = true;
            
            var mesh = new THREE.Mesh( geometry, material );
            this.scene.add( mesh );
            
            this.renderer = new THREE.WebGLRenderer();
            this.renderer.setPixelRatio( window.devicePixelRatio );
            
            this.container.appendChild( this.renderer.domElement );
        }
        
        protected override onContainerResize(width: number, height: number) {
            this.renderer.setSize(width, height);
            this.uniforms.u_resolution.value.x = this.renderer.domElement.width;
            this.uniforms.u_resolution.value.y = this.renderer.domElement.height;
        }
        
        public override render(delta?: number) {
            if (this.uniforms) {
                if (delta !== undefined) {
                    this.uniforms.u_time.value = -10000 + delta * 0.0005;
                }
                this.renderer.render(this.scene, this.camera);
            }
        }
    }
    
    export default AshfallBackground