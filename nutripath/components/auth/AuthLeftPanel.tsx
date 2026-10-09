"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

/**
 * AuthLeftPanel — Shared visual panel for Login and Register pages.
 * Contains Three.js holographic botanical animation + editorial copy.
 * Sits on the left (lg:w-[52%]) of the split-screen auth layout.
 */
export function AuthLeftPanel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const threeInitedRef = useRef(false);

  function initThree() {
    if (threeInitedRef.current) return;
    const container = containerRef.current;
    if (!container) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const THREE = (window as unknown as { THREE: any }).THREE;
    if (!THREE) return;
    threeInitedRef.current = true;

    const scene = new THREE.Scene();
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 40;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const holoGroup = new THREE.Group();
    scene.add(holoGroup);

    function createLeafShape(scaleX: number, scaleY: number) {
      const shape = new THREE.Shape();
      shape.moveTo(0, -12 * scaleY);
      shape.bezierCurveTo(7 * scaleX, -7 * scaleY, 11 * scaleX, 3 * scaleY, 0, 14 * scaleY);
      shape.bezierCurveTo(-11 * scaleX, 3 * scaleY, -7 * scaleX, -7 * scaleY, 0, -12 * scaleY);
      return shape;
    }

    // Center leaf wireframe
    const leafMatWire = new THREE.MeshBasicMaterial({ color: 0x34d399, wireframe: true, transparent: true, opacity: 0.55 });
    const leafCenter = new THREE.Mesh(new THREE.ShapeGeometry(createLeafShape(1.0, 1.0), 32), leafMatWire);
    holoGroup.add(leafCenter);

    // Leaf veins
    const veinsGroup = new THREE.Group();
    const veinMat = new THREE.LineBasicMaterial({ color: 0x6ee7b7, transparent: true, opacity: 0.8 });
    const stemGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -12, 0.2), new THREE.Vector3(0, 0, 0.3), new THREE.Vector3(0, 13.5, 0.2),
    ]);
    veinsGroup.add(new THREE.Line(stemGeom, veinMat));
    for (let i = -7; i <= 9; i += 3.2) {
      const t = (i + 7) / 16;
      const spread = Math.sin(t * Math.PI) * 7.5;
      veinsGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, i, 0.2), new THREE.Vector3(spread * 0.5, i + 2, 0.4), new THREE.Vector3(spread, i + 3.5, 0.2)]), veinMat));
      veinsGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, i, 0.2), new THREE.Vector3(-spread * 0.5, i + 2, 0.4), new THREE.Vector3(-spread, i + 3.5, 0.2)]), veinMat));
    }
    holoGroup.add(veinsGroup);

    // Side leaves
    const leafLeft = new THREE.Mesh(new THREE.ShapeGeometry(createLeafShape(0.75, 0.8), 24), new THREE.MeshBasicMaterial({ color: 0x06b6d4, wireframe: true, transparent: true, opacity: 0.4 }));
    leafLeft.position.set(-9.5, -2.5, -2); leafLeft.rotation.z = 0.55;
    holoGroup.add(leafLeft);

    const leafRight = new THREE.Mesh(new THREE.ShapeGeometry(createLeafShape(0.75, 0.8), 24), new THREE.MeshBasicMaterial({ color: 0x10b981, wireframe: true, transparent: true, opacity: 0.4 }));
    leafRight.position.set(9.5, -2.5, -2); leafRight.rotation.z = -0.55;
    holoGroup.add(leafRight);

    // Orbit rings
    const orbitRing = new THREE.Mesh(new THREE.RingGeometry(17, 17.4, 64), new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.35 }));
    orbitRing.rotation.x = Math.PI * 0.35;
    holoGroup.add(orbitRing);
    const orbitRing2 = new THREE.Mesh(new THREE.RingGeometry(19.5, 19.8, 48), new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide, wireframe: true, transparent: true, opacity: 0.25 }));
    orbitRing2.rotation.x = -Math.PI * 0.25;
    holoGroup.add(orbitRing2);

    // Particles
    const particleCount = 140;
    const particleGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 36;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 38;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 16;
      speeds[i] = Math.random() * 0.03 + 0.01;
    }
    particleGeom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleSystem = new THREE.Points(particleGeom, new THREE.PointsMaterial({ color: 0xa7f3d0, size: 0.9, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending }));
    holoGroup.add(particleSystem);

    let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = -(((e.clientY - rect.top) / rect.height) - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouseMove);

    const onResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;
      const breath = Math.sin(t * 1.8) * 0.06;
      holoGroup.scale.set(1 + breath, 1 + breath, 1 + breath);
      holoGroup.rotation.y = targetX * 0.4 + Math.sin(t * 0.6) * 0.12;
      holoGroup.rotation.x = -targetY * 0.3 + Math.cos(t * 0.8) * 0.08;
      leafLeft.rotation.z = 0.55 + Math.sin(t * 2.1) * 0.08;
      leafRight.rotation.z = -0.55 - Math.sin(t * 2.1 + 0.5) * 0.08;
      orbitRing.rotation.z = t * 0.45;
      orbitRing2.rotation.z = -t * 0.35;
      const pos = particleGeom.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3 + 1] += speeds[i];
        pos[i * 3] += Math.sin(t + i) * 0.015;
        if (pos[i * 3 + 1] > 20) { pos[i * 3 + 1] = -20; pos[i * 3] = (Math.random() - 0.5) * 36; }
      }
      particleGeom.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }

  useEffect(() => {
    // If Three.js already loaded, init immediately
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as unknown as { THREE: any }).THREE) {
      initThree();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Load Three.js from CDN — only once */}
      <Script
        src="https://ajax.googleapis.com/ajax/libs/threejs/r125/three.min.js"
        strategy="afterInteractive"
        onLoad={initThree}
      />

      <div className="relative w-full lg:w-[52%] bg-[#0d1f35] flex flex-col justify-between overflow-hidden shrink-0 min-h-[420px] lg:min-h-screen">

        {/* Three.js canvas container */}
        <div ref={containerRef} className="absolute inset-0 w-full h-full z-10 pointer-events-none" />

        {/* Ambient gradient blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#006c49] opacity-20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 right-0 w-[28rem] h-[28rem] rounded-full bg-[#4cd7f6] opacity-8 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-24 w-72 h-72 rounded-full border border-emerald-400/15 opacity-25 pointer-events-none"
          style={{ animation: "pulse 4s ease-in-out infinite" }} />

        {/* Content layer — above Three.js canvas */}
        <div className="relative z-20 flex flex-col justify-between h-full p-7 sm:p-10 lg:p-12 gap-8">

          {/* Top: Brand + live indicator */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#131b2e] border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-md">
                <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">S</div>
              </div>
              <div>
                <p className="text-white text-[15px] font-bold leading-tight tracking-tight">SMANU</p>
                <p className="text-[#7c839b] text-[10px] font-semibold tracking-[0.12em] uppercase">SmartNutrition System</p>
              </div>
            </div>
            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/25 backdrop-blur-md text-emerald-300 text-[11px] font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              Bio-Sensor Aktif
            </div>
          </div>

          {/* Middle: Photo card + editorial */}
          <div className="flex-1 flex flex-col justify-center gap-6 py-4">
            {/* Hero photo card */}
            <div className="relative w-full max-w-sm mx-auto rounded-2xl overflow-hidden shadow-2xl border border-emerald-500/20 bg-[#131b2e] group">
              {/* Hologram overlay pills */}
              <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/60 border border-emerald-400/30 backdrop-blur-md text-emerald-300 text-[10px] font-medium">
                  <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21a48.25 48.25 0 01-8.135-.687c-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
                  </svg>
                  AI Botany Sync
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/60 border border-cyan-400/30 backdrop-blur-md text-cyan-300 text-[10px] font-medium">
                  <svg className="w-3 h-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
                  </svg>
                  Kalori 98.4%
                </div>
              </div>

              {/* Image — ganti src dengan "/images/login-hero.jpg" setelah upload ke public/images/ */}
              <div className="aspect-[4/3] w-full overflow-hidden relative bg-gradient-to-br from-[#0d2b1e] via-[#0f2d2b] to-[#0b1c30]">
                {/* Placeholder SVG — hapus elemen ini setelah upload gambar asli */}
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 400 300"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  {/* Background grid */}
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1a3a2a" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="400" height="300" fill="url(#grid)" />

                  {/* Glow circles */}
                  <circle cx="200" cy="150" r="90" fill="#006c49" fillOpacity="0.12" />
                  <circle cx="200" cy="150" r="60" fill="#006c49" fillOpacity="0.10" />
                  <circle cx="200" cy="150" r="30" fill="#34d399" fillOpacity="0.15" />

                  {/* Orbit rings */}
                  <ellipse cx="200" cy="150" rx="85" ry="30" stroke="#34d399" strokeWidth="0.8" strokeOpacity="0.4" strokeDasharray="4 3" fill="none" />
                  <ellipse cx="200" cy="150" rx="110" ry="42" stroke="#06b6d4" strokeWidth="0.6" strokeOpacity="0.3" strokeDasharray="6 4" fill="none" />

                  {/* Central leaf icon */}
                  <path d="M200 90 C220 105 225 130 200 155 C175 130 180 105 200 90Z"
                    fill="none" stroke="#34d399" strokeWidth="1.5" strokeOpacity="0.9" />
                  <path d="M200 90 L200 155" stroke="#6ee7b7" strokeWidth="1" strokeOpacity="0.7" />
                  <path d="M200 115 C210 118 215 122 218 128" stroke="#6ee7b7" strokeWidth="0.8" strokeOpacity="0.6" strokeLinecap="round" />
                  <path d="M200 115 C190 118 185 122 182 128" stroke="#6ee7b7" strokeWidth="0.8" strokeOpacity="0.6" strokeLinecap="round" />
                  <path d="M200 128 C212 131 217 135 219 141" stroke="#6ee7b7" strokeWidth="0.8" strokeOpacity="0.6" strokeLinecap="round" />
                  <path d="M200 128 C188 131 183 135 181 141" stroke="#6ee7b7" strokeWidth="0.8" strokeOpacity="0.6" strokeLinecap="round" />

                  {/* Particles */}
                  {[
                    [120,80],[160,65],[240,70],[290,85],[310,130],[290,190],[240,220],[160,225],[115,185],[90,140],
                    [150,100],[250,95],[270,155],[145,195],[175,55],[225,50],[320,110],[80,160],
                  ].map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r="1.5" fill="#a7f3d0" fillOpacity={0.4 + (i % 4) * 0.12} />
                  ))}

                  {/* HUD scan lines */}
                  <line x1="130" y1="90" x2="165" y2="90" stroke="#34d399" strokeWidth="1" strokeOpacity="0.5" />
                  <line x1="130" y1="90" x2="130" y2="125" stroke="#34d399" strokeWidth="1" strokeOpacity="0.5" />
                  <line x1="235" y1="90" x2="270" y2="90" stroke="#34d399" strokeWidth="1" strokeOpacity="0.5" />
                  <line x1="270" y1="90" x2="270" y2="125" stroke="#34d399" strokeWidth="1" strokeOpacity="0.5" />
                  <line x1="130" y1="210" x2="165" y2="210" stroke="#34d399" strokeWidth="1" strokeOpacity="0.5" />
                  <line x1="130" y1="175" x2="130" y2="210" stroke="#34d399" strokeWidth="1" strokeOpacity="0.5" />
                  <line x1="235" y1="210" x2="270" y2="210" stroke="#34d399" strokeWidth="1" strokeOpacity="0.5" />
                  <line x1="270" y1="175" x2="270" y2="210" stroke="#34d399" strokeWidth="1" strokeOpacity="0.5" />

                  {/* Status text */}
                  <text x="200" y="174" textAnchor="middle" fill="#6ee7b7" fontSize="9" fontFamily="monospace" letterSpacing="2" opacity="0.7">SMANU · SCAN AKTIF</text>
                  <text x="200" y="186" textAnchor="middle" fill="#7c839b" fontSize="7.5" fontFamily="monospace" letterSpacing="1" opacity="0.6">Upload gambar ke /public/images/login-hero.jpg</text>
                </svg>

                {/* Uncomment baris di bawah ini setelah upload gambar ke public/images/login-hero.jpg */}
                <img
                  src="/images/login-hero.jpg"
                  alt="Siswa SMANU menggunakan asisten nutrisi AI"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>

              {/* Bottom caption */}
              <div className="absolute bottom-3 left-3 right-3 bg-[#131b2e]/85 backdrop-blur-md px-3 py-2.5 rounded-xl border border-emerald-500/25 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#6cf8bb] shrink-0" style={{ boxShadow: "0 0 8px #34d399" }} />
                  <span className="text-white text-[12px] font-medium">Bio-Metrik &amp; Kalori Presisi</span>
                </div>
                <span className="text-[#6cf8bb] text-[11px] font-semibold tracking-wide">AI-Powered</span>
              </div>
            </div>

            {/* Editorial copy */}
            <div className="max-w-sm mx-auto w-full">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/8 border border-emerald-500/20 text-[#6cf8bb] text-[11px] font-semibold mb-3">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
                </svg>
                Platform Edukasi Gizi Pelajar #1
              </div>
              <h1 className="text-white text-[22px] sm:text-[26px] font-bold tracking-tight leading-snug mb-2">
                Mulai Kebiasaan Makan Sehat dari Hari Ini.
              </h1>
              <p className="text-[#7c839b] text-[13px] leading-relaxed">
                Bergabung bersama ribuan pelajar yang telah mengoptimalkan energi belajar &amp; fokus lewat gizi terukur berbasis riset ilmiah.
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2 mt-4">
                {[
                  { icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z", label: "Rekomendasi Warteg Rp 15k" },
                  { icon: "M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5", label: "Analisis Makronutrien AI" },
                  { icon: "M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.25 9.71 2 12 2c2.291 0 4.545.25 6.75.721v1.515M5.25 4.236a48.3 48.3 0 016.75-.736m9 0c-.982.143-1.954.317-2.916.52a6.003 6.003 0 01-5.395 4.972M18.75 4.236V4.5a6.75 6.75 0 01-2.48 5.228m2.48-5.228V2.72", label: "NutriQuest Bersertifikat" },
                ].map((f) => (
                  <div key={f.label} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/6 border border-emerald-500/15 text-white text-[11px] font-medium">
                    <svg className="w-3.5 h-3.5 text-[#6cf8bb] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d={f.icon} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
                    </svg>
                    {f.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom: trust metrics */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {["AP", "SN", "KD"].map((initials, i) => (
                  <div key={i} className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-[#0d1f35]"
                    style={{ background: i === 0 ? "#006c49" : i === 1 ? "#1e3a5f" : "#1a2f4a" }}>
                    {initials}
                  </div>
                ))}
              </div>
              <span className="text-[#7c839b] text-[11px]">Aktif di 12+ Sekolah Terakreditasi</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#7c839b] text-[11px]">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
              </svg>
              Program Kemendikbud
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
