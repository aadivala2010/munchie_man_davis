/* CircularGallery — the React Bits component, running without React.
 *
 * The original ships as a React component, but only its ~30-line useEffect
 * wrapper was React; the App/Media/Title classes below are the upstream source
 * essentially verbatim. This file drops the wrapper and instantiates App
 * directly, so the site stays plain HTML with no build step.
 *
 * Deliberate changes from upstream, all marked CHANGED below:
 *   1. Pointer/wheel listeners are scoped to the container, not window.
 *   2. Images are desaturated in the fragment shader (brand is black & white).
 *   3. The render loop pauses when the gallery is off-screen.
 *   4. There are exactly 4 posters, not an endless stream: no duplicated
 *      list, no infinite wraparound, no per-vertex ripple. Scroll is clamped
 *      to the 4 items and starts centred on them, on the curve.
 * Everything else — the bend maths, the shaders — is theirs.
 *
 * ogl is vendored at vendor/ogl.js (Unlicense). Regenerate with:
 *   npx esbuild --bundle --format=esm --minify --outfile=vendor/ogl.js entry.js
 */

import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from './vendor/ogl.js';

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function lerp(p1, p2, t) {
  return p1 + (p2 - p1) * t;
}

function getFontSize(font) {
  const match = font.match(/(\d+)px/);
  return match ? parseInt(match[1], 10) : 30;
}

function createTextTexture(gl, text, font = 'bold 30px monospace', color = 'black') {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = font;
  const metrics = context.measureText(text);
  const textWidth = Math.ceil(metrics.width);
  const textHeight = Math.ceil(getFontSize(font) * 1.2);
  canvas.width = textWidth + 20;
  canvas.height = textHeight + 20;
  context.font = font;
  context.fillStyle = color;
  context.textBaseline = 'middle';
  context.textAlign = 'center';
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new Texture(gl, { generateMipmaps: false });
  texture.image = canvas;
  return { texture, width: canvas.width, height: canvas.height };
}

class Title {
  constructor({ gl, plane, renderer, text, textColor = '#545050', font = '30px sans-serif' }) {
    this.gl = gl;
    this.plane = plane;
    this.renderer = renderer;
    this.text = text;
    this.textColor = textColor;
    this.font = font;
    this.createMesh();
  }
  createMesh() {
    const { texture, width, height } = createTextTexture(this.gl, this.text, this.font, this.textColor);
    const geometry = new Plane(this.gl);
    const program = new Program(this.gl, {
      vertex: `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform sampler2D tMap;
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D(tMap, vUv);
          if (color.a < 0.1) discard;
          gl_FragColor = color;
        }
      `,
      uniforms: { tMap: { value: texture } },
      transparent: true
    });
    this.mesh = new Mesh(this.gl, { geometry, program });
    const aspect = width / height;
    const textHeight = this.plane.scale.y * 0.15;
    const textWidth = textHeight * aspect;
    this.mesh.scale.set(textWidth, textHeight, 1);
    this.mesh.position.y = -this.plane.scale.y * 0.5 - textHeight * 0.5 - 0.05;
    this.mesh.setParent(this.plane);
  }
}

class Media {
  constructor({ geometry, gl, image, index, length, renderer, scene, screen, text,
                viewport, bend, textColor, borderRadius = 0, font }) {
    this.geometry = geometry;
    this.gl = gl;
    this.image = image;
    this.index = index;
    this.length = length;
    this.renderer = renderer;
    this.scene = scene;
    this.screen = screen;
    this.text = text;
    this.viewport = viewport;
    this.bend = bend;
    this.textColor = textColor;
    this.borderRadius = borderRadius;
    this.font = font;
    this.createShader();
    this.createMesh();
    this.createTitle();
    this.onResize();
  }
  createShader() {
    const texture = new Texture(this.gl, { generateMipmaps: true });
    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        varying vec2 vUv;

        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }

        void main() {
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );
          vec4 color = texture2D(tMap, uv);

          /* CHANGED: desaturate. The posters were shot on wood and on paper
             under different light; grey unifies them and holds the palette. */
          float grey = dot(color.rgb, vec3(0.299, 0.587, 0.114));

          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);

          // Smooth antialiasing for edges
          float edgeSmooth = 0.002;
          float alpha = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, d);

          gl_FragColor = vec4(vec3(grey), alpha);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uBorderRadius: { value: this.borderRadius }
      },
      transparent: true
    });
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = this.image;
    img.onload = () => {
      texture.image = img;
      this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
    };
  }
  createMesh() {
    this.plane = new Mesh(this.gl, { geometry: this.geometry, program: this.program });
    this.plane.setParent(this.scene);
  }
  createTitle() {
    this.title = new Title({
      gl: this.gl,
      plane: this.plane,
      renderer: this.renderer,
      text: this.text,
      textColor: this.textColor,
      font: this.font
    });
  }
  update(scroll) {
    this.plane.position.x = this.x - scroll.current;

    const x = this.plane.position.x;
    const H = this.viewport.width / 2;

    if (this.bend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      const B_abs = Math.abs(this.bend);
      const R = (H * H + B_abs * B_abs) / (2 * B_abs);
      const effectiveX = Math.min(Math.abs(x), H);

      const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);
      if (this.bend > 0) {
        this.plane.position.y = -arc;
        this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R);
      } else {
        this.plane.position.y = arc;
        this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
      }
    }
  }
  onResize({ screen, viewport } = {}) {
    if (screen) this.screen = screen;
    if (viewport) {
      this.viewport = viewport;
      if (this.plane.program.uniforms.uViewportSizes) {
        this.plane.program.uniforms.uViewportSizes.value = [this.viewport.width, this.viewport.height];
      }
    }
    this.scale = this.screen.height / 1500;
    let scaleY = (this.viewport.height * (900 * this.scale)) / this.screen.height;
    let scaleX = (this.viewport.width * (700 * this.scale)) / this.screen.width;
    this.padding = 2;

    // CHANGED: the size above is height-only, which assumes there's always
    // plenty of width to spare. On a narrow/tall screen it isn't — cap width
    // so `length` posters plus padding always fit the viewport, uncropped.
    const maxScaleX = (this.viewport.width * 0.92) / this.length - this.padding;
    if (scaleX > maxScaleX) {
      const shrink = Math.max(maxScaleX, 0.01) / scaleX;
      scaleX *= shrink;
      scaleY *= shrink;
    }

    this.plane.scale.y = scaleY;
    this.plane.scale.x = scaleX;
    this.plane.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
    this.width = this.plane.scale.x + this.padding;
    this.x = this.width * this.index;
  }
}

class App {
  constructor(container, { items, bend = 3, textColor = '#ffffff', borderRadius = 0,
                           font = 'bold 30px sans-serif', scrollSpeed = 2, scrollEase = 0.05 } = {}) {
    this.container = container;
    this.scrollSpeed = scrollSpeed;
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
    this.onCheckDebounce = debounce(this.onCheck.bind(this), 200);
    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.onResize();
    this.createGeometry();
    this.createMedias(items, bend, textColor, borderRadius, font);
    // CHANGED: start centred on the 4 posters, not at the edge of the list —
    // this is a fixed set to look at, not a stream to scroll from the start of.
    this.scroll.current = this.scroll.target = this.maxScroll() / 2;
    this.update();
    this.addEventListeners();
  }
  // CHANGED: no infinite wrap, so scrolling has real ends — clamp to them so
  // a drag or arrow key can't push a poster half off the edge.
  maxScroll() {
    return this.medias && this.medias[0] ? this.medias[0].width * (this.medias.length - 1) : 0;
  }
  clampScroll(value) {
    return Math.max(0, Math.min(this.maxScroll(), value));
  }
  createRenderer() {
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2)
    });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.container.appendChild(this.gl.canvas);
  }
  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }
  createScene() {
    this.scene = new Transform();
  }
  createGeometry() {
    this.planeGeometry = new Plane(this.gl, { heightSegments: 50, widthSegments: 100 });
  }
  createMedias(items, bend = 1, textColor, borderRadius, font) {
    // CHANGED: no picsum placeholders, and no doubled list for an infinite
    // wrap. There are exactly 4 posters; show exactly 4.
    this.mediasImages = items;
    this.medias = this.mediasImages.map((data, index) => new Media({
      geometry: this.planeGeometry,
      gl: this.gl,
      image: data.image,
      index,
      length: this.mediasImages.length,
      renderer: this.renderer,
      scene: this.scene,
      screen: this.screen,
      text: data.text,
      viewport: this.viewport,
      bend,
      textColor,
      borderRadius,
      font
    }));
  }
  onTouchDown(e) {
    this.isDown = true;
    this.scroll.position = this.scroll.current;
    this.start = e.touches ? e.touches[0].clientX : e.clientX;
  }
  onTouchMove(e) {
    if (!this.isDown) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const distance = (this.start - x) * (this.scrollSpeed * 0.025);
    this.scroll.target = this.clampScroll(this.scroll.position + distance);
  }
  onTouchUp() {
    this.isDown = false;
    this.onCheck();
  }
  onWheel(e) {
    // CHANGED: only claim the wheel for horizontal intent. Upstream hijacks
    // every wheel event on window, which on a scrolling page means reading the
    // page spins the gallery.
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    this.scroll.target = this.clampScroll(this.scroll.target + (e.deltaX > 0 ? this.scrollSpeed : -this.scrollSpeed) * 0.2);
    this.onCheckDebounce();
  }
  onKeyDown(e) {
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        this.scroll.target = this.clampScroll(this.scroll.target + this.scrollSpeed * 5);
        this.onCheckDebounce();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        this.scroll.target = this.clampScroll(this.scroll.target - this.scrollSpeed * 5);
        this.onCheckDebounce();
        break;
      case 'Home':
        e.preventDefault();
        this.scroll.target = 0;
        this.onCheckDebounce();
        break;
      default:
        break;
    }
  }
  onCheck() {
    if (!this.medias || !this.medias[0]) return;
    const width = this.medias[0].width;
    const itemIndex = Math.round(Math.abs(this.scroll.target) / width);
    const item = width * itemIndex;
    this.scroll.target = this.scroll.target < 0 ? -item : item;
  }
  onResize() {
    this.screen = { width: this.container.clientWidth, height: this.container.clientHeight };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({ aspect: this.screen.width / this.screen.height });
    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.viewport = { width, height };
    if (this.medias) {
      this.medias.forEach(media => media.onResize({ screen: this.screen, viewport: this.viewport }));
    }
  }
  update() {
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    if (this.medias) this.medias.forEach(media => media.update(this.scroll));
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    this.raf = window.requestAnimationFrame(this.update.bind(this));
  }
  addEventListeners() {
    this.boundOnResize = this.onResize.bind(this);
    this.boundOnWheel = this.onWheel.bind(this);
    this.boundOnTouchDown = this.onTouchDown.bind(this);
    this.boundOnTouchMove = this.onTouchMove.bind(this);
    this.boundOnTouchUp = this.onTouchUp.bind(this);
    this.boundOnKeyDown = this.onKeyDown.bind(this);

    window.addEventListener('resize', this.boundOnResize);

    // CHANGED: press starts on the gallery, but move/release stay on window so
    // a drag that leaves the element still tracks and still ends.
    this.container.addEventListener('wheel', this.boundOnWheel, { passive: false });
    this.container.addEventListener('mousedown', this.boundOnTouchDown);
    this.container.addEventListener('touchstart', this.boundOnTouchDown, { passive: true });
    window.addEventListener('mousemove', this.boundOnTouchMove);
    window.addEventListener('mouseup', this.boundOnTouchUp);
    window.addEventListener('touchmove', this.boundOnTouchMove, { passive: true });
    window.addEventListener('touchend', this.boundOnTouchUp);

    this.container.addEventListener('keydown', this.boundOnKeyDown);
  }
  // CHANGED: upstream runs its RAF loop forever. This one idles when the
  // gallery is off-screen — it sits mid-page on a site people scroll past.
  pause() {
    if (this.raf) { window.cancelAnimationFrame(this.raf); this.raf = null; }
  }
  resume() {
    if (!this.raf) this.update();
  }
  destroy() {
    this.pause();
    window.removeEventListener('resize', this.boundOnResize);
    window.removeEventListener('mousemove', this.boundOnTouchMove);
    window.removeEventListener('mouseup', this.boundOnTouchUp);
    window.removeEventListener('touchmove', this.boundOnTouchMove);
    window.removeEventListener('touchend', this.boundOnTouchUp);
    this.container.removeEventListener('wheel', this.boundOnWheel);
    this.container.removeEventListener('mousedown', this.boundOnTouchDown);
    this.container.removeEventListener('touchstart', this.boundOnTouchDown);
    this.container.removeEventListener('keydown', this.boundOnKeyDown);
    if (this.renderer?.gl?.canvas.parentNode) {
      this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas);
    }
  }
}

/* ---------- wire it up ---------- */

const mount = document.querySelector('.gallery__gl');
const fallback = document.querySelector('.gallery__track');

function webglAvailable() {
  try {
    return !!document.createElement('canvas').getContext('webgl');
  } catch {
    return false;
  }
}

// The head script already decided, before first paint, whether the carousel or
// the plain list is in the layout — it ruled out no-JS and reduced-motion.
// All that's left is the rare machine with no WebGL: drop the class and the
// CSS puts the list back.
const root = document.documentElement;
if (root.classList.contains('gl') && !webglAvailable()) root.classList.remove('gl');

if (mount && fallback && root.classList.contains('gl')) {

  // Read the posters straight out of the fallback markup — one list to edit.
  // data-label is the short caption: the component sizes a label by its aspect
  // ratio, so a full sentence renders as an absurdly wide strip of text.
  const items = [...fallback.querySelectorAll('li')].map(li => ({
    image: li.querySelector('img').src,
    text: li.dataset.label || li.querySelector('p').textContent.trim()
  }));

  const FONT = "400 30px 'Instrument Serif'";

  // The label textures are drawn to a canvas once, at construction — start
  // before the webfont arrives and they are stuck in a fallback face forever.
  const ready = document.fonts
    ? document.fonts.load(FONT).then(() => document.fonts.ready).catch(() => {})
    : Promise.resolve();

  if (items.length) ready.then(() => {
    const app = new App(mount, {
      items,
      bend: 3,
      textColor: '#14110f',        // site ink, not white — the page is paper
      borderRadius: 0.01,
      font: FONT,
      scrollSpeed: 2,
      scrollEase: 0.04
    });

    new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? app.resume() : app.pause()),
      { rootMargin: '200px' }
    ).observe(mount);
  });
}
