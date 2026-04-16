import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

export default function HeroParticles() {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    /* ================= SCENE ================= */
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x061421, 0.0026);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      3000
    );
    camera.position.z = 700;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    /* ================= POST ================= */
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.7,
      0.7,
      0.08
    );
    composer.addPass(bloom);

    /* ================= HELPERS ================= */
    const laptopCenter = new THREE.Vector3(220, -40, 0);

    function createParticles(count, sizeMin, sizeMax, spread, opacity) {
      const pos = new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() ** 0.35 * spread;

        pos[i * 3] = laptopCenter.x + Math.cos(a) * r;
        pos[i * 3 + 1] = laptopCenter.y + Math.sin(a) * r;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 600;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));

      const mat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {},
        vertexShader: `
          varying float vRand;
          void main(){
            vRand = fract(sin(dot(position.xy, vec2(12.9898,78.233))) * 43758.5453);
            vec4 mv = modelViewMatrix * vec4(position,1.0);
            gl_PointSize = mix(${sizeMin.toFixed(1)}, ${sizeMax.toFixed(1)}, vRand);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          varying float vRand;
          void main(){
            float d = length(gl_PointCoord - 0.5);
            float alpha = smoothstep(0.55, 0.1, d);
            vec3 col = mix(vec3(0.25,0.55,0.9), vec3(0.6,0.85,1.0), vRand);
            gl_FragColor = vec4(col, alpha * ${opacity});
          }
        `,
      });

      return new THREE.Points(geo, mat);
    }

    /* ================= LAYERS ================= */
    const bgDust = createParticles(2200, 0.6, 1.2, 1600, 0.25);
    const halo = createParticles(3200, 1.2, 3.8, 520, 0.85);
    const foreground = createParticles(900, 2.5, 6.0, 260, 0.95);

    scene.add(bgDust, halo, foreground);

    /* ================= ANIMATE ================= */
    let t = 0;

    const animate = () => {
      t += 0.0015;

      halo.rotation.z += 0.0004;
      bgDust.rotation.z -= 0.0002;

      camera.position.x = Math.sin(t) * 10;
      camera.position.y = Math.cos(t * 0.8) * 6;

      composer.render();
      requestAnimationFrame(animate);
    };

    animate();

    /* ================= RESIZE ================= */
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    /* ================= CLEANUP ================= */
    return () => {
      window.removeEventListener("resize", onResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
