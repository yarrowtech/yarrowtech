import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Home2HeroParticles() {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x863f15, 0.0026);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      3000
    );
    camera.position.z = 700;

    // No EffectComposer — direct render so background stays #863f15
    const renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true });
    renderer.setClearColor(0x863f15, 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const laptopCenter = new THREE.Vector3(220, -40, 0);

    function createParticles(count, sizeMin, sizeMax, spread, opacity) {
      const pos = new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() ** 0.35 * spread;

        pos[i * 3]     = laptopCenter.x + Math.cos(a) * r;
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
            // warm amber-gold particles matching #863f15 theme
            vec3 col = mix(vec3(1.0,0.72,0.25), vec3(1.0,0.90,0.60), vRand);
            gl_FragColor = vec4(col, alpha * ${opacity});
          }
        `,
      });

      return new THREE.Points(geo, mat);
    }

    const bgDust     = createParticles(2200, 0.6, 1.2, 1600, 0.18);
    const halo       = createParticles(3200, 1.2, 3.8,  520, 0.65);
    const foreground = createParticles( 900, 2.5, 6.0,  260, 0.80);

    scene.add(bgDust, halo, foreground);

    let animId;
    let t = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.0015;

      halo.rotation.z   += 0.0004;
      bgDust.rotation.z -= 0.0002;

      camera.position.x = Math.sin(t) * 10;
      camera.position.y = Math.cos(t * 0.8) * 6;

      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
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
