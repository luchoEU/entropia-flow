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
  public ready: boolean
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
      (texture: any) => {
        that.init(texture)
        that.ready = true
      })
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
    const that = this
    this.container.addEventListener('resize', () => that.onContainerResize, false);
  }

  public onContainerResize() {
    this.renderer.setSize( this.container.offsetWidth, this.container.offsetHeight );
    this.uniforms.u_resolution.value.x = this.renderer.domElement.width;
    this.uniforms.u_resolution.value.y = this.renderer.domElement.height;
  }

  public render(delta: number) {
    if (this.uniforms) {
      this.uniforms.u_time.value = -10000 + delta * 0.0005;
      this.renderer.render(this.scene, this.camera);
    }
  }
}

let instances: AshfallBackground[] = []
let animating: boolean

function animate(delta: number) {
  instances = instances.filter(i => i.container.parentElement)
  const actives = instances.filter(i => i.container.querySelector('canvas'))
  actives.forEach(i => i.render(delta));
  if (instances.length > 0)
    window.requestAnimationFrame(animate);
  else
    animating = false
}

function load(container: HTMLElement) {
  if (instances.some(i => i.container == container && !i.ready))
    return // loading
  
  if (container.querySelector('canvas'))
    return
  
  instances = instances.filter(i => i.container !== container)
  instances.push(new AshfallBackground(container))
  container.style['color'] = 'white'

  if (!animating) {
    animate(0);
    animating = true
  }
}

export default load