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
import { NOISE_PNG } from './noise.png'

class AshfallBackground {
  public container: HTMLElement
  private camera: any
  private scene: any
  private renderer: any
  private uniforms: any
  
  constructor(container: HTMLElement) {
    this.container = container
    const loader = new window.THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    const that = this
    loader.load(NOISE_PNG, // Embbed noise.png to avoid CORS in Entropia Flow Client
      function do_something_with_texture(texture: any) {
        that.init(texture);
        animate(0);
      }
    )
  }

  private init(texture: any) {
    this.camera = new window.THREE.Camera();
    this.camera.position.z = 1;

    this.scene = new window.THREE.Scene();

    const geometry = new window.THREE.PlaneBufferGeometry( 2, 2 );

    texture.wrapS = window.THREE.RepeatWrapping;
    texture.wrapT = window.THREE.RepeatWrapping;
    texture.minFilter = window.THREE.LinearFilter;

    this.uniforms = {
      u_time: { type: "f", value: 1.0 },
      u_resolution: { type: "v2", value: new window.THREE.Vector2() },
      u_noise: { type: "t", value: texture },
      u_mouse: { type: "v2", value: new window.THREE.Vector2() }
    };

    var material = new window.THREE.ShaderMaterial( {
      uniforms: this.uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader
    } )
    material.extensions.derivatives = true;

    var mesh = new window.THREE.Mesh( geometry, material );
    this.scene.add( mesh );

    this.renderer = new window.THREE.WebGLRenderer();
    this.renderer.setPixelRatio( window.devicePixelRatio );

    this.container.appendChild( this.renderer.domElement );

    this.onContainerResize();
    this.container.addEventListener( 'resize', onContainerResize, false );
  }

  public onContainerResize() {
    this.renderer.setSize( this.container.offsetWidth, this.container.offsetHeight );
    this.uniforms.u_resolution.value.x = this.renderer.domElement.width;
    this.uniforms.u_resolution.value.y = this.renderer.domElement.height;
  }

  public render(delta: number) {
    this.uniforms.u_time.value = -10000 + delta * 0.0005;
    this.renderer.render(this.scene, this.camera);
  }
}

let instance: AshfallBackground

function onContainerResize( event: any ) {
  instance.onContainerResize()
}

function animate(delta: number) {
  window.requestAnimationFrame( animate );
  instance.render( delta );
}

function load(container: HTMLElement) {
  if (instance && instance.container == container)
    return

  instance = new AshfallBackground(container)
  container.style['color'] = 'white'
}

export default load