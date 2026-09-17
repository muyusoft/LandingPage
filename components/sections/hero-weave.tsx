"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const THREAD_COLORS = [0xdce4f0, 0xafc0da, 0x7fa6ff];
const MOBILE_BREAKPOINT = 760;

function buildThread(
  axis: "x" | "y",
  offset: number,
  phase: number,
  color: number,
  opacity: number,
  segments: number,
) {
  const points: THREE.Vector3[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = (i / segments - 0.5) * 44;
    const wave = Math.sin(t * 0.38 + phase) * 1.5;
    points.push(
      axis === "x"
        ? new THREE.Vector3(t, offset + wave * 0.5, wave)
        : new THREE.Vector3(offset + wave * 0.5, t, wave),
    );
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
  return new THREE.Line(geometry, material);
}

export default function HeroWeave() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    const maxPixelRatio = host.clientWidth < MOBILE_BREAKPOINT ? 1.5 : 2;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x08090b, 0.05);

    const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 120);
    camera.position.set(0, 0, 14);

    const group = new THREE.Group();
    scene.add(group);

    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];

    // Menos hilos y menos segmentos por hilo en móvil: mismo efecto, menos GPU.
    const isMobile = host.clientWidth < MOBILE_BREAKPOINT;
    const threadStep = isMobile ? 2 : 1;
    const segments = isMobile ? 54 : 90;

    for (let i = -9; i <= 9; i += threadStep) {
      const xThread = buildThread("x", i * 1.5, i * 0.5, THREAD_COLORS[(i + 9) % 3], 0.42, segments);
      const yThread = buildThread("y", i * 1.5, i * 0.7 + 1.2, THREAD_COLORS[(i + 10) % 3], 0.3, segments);
      group.add(xThread, yThread);
      geometries.push(xThread.geometry, yThread.geometry);
      materials.push(xThread.material as THREE.Material, yThread.material as THREE.Material);
    }

    const knotPositions: number[] = [];
    for (let a = -9; a <= 9; a += 2) {
      for (let b = -9; b <= 9; b += 2) {
        knotPositions.push(a * 1.5, b * 1.5, 0);
      }
    }
    const knotGeometry = new THREE.BufferGeometry();
    knotGeometry.setAttribute("position", new THREE.Float32BufferAttribute(knotPositions, 3));
    const knotMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.085,
      transparent: true,
      opacity: 0.75,
    });
    group.add(new THREE.Points(knotGeometry, knotMaterial));
    geometries.push(knotGeometry);
    materials.push(knotMaterial);

    group.rotation.x = -0.62;
    group.rotation.z = 0.2;

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let time = 0;
    let scrollProgress = 0;

    const getCameraZ = () => (host.clientWidth < MOBILE_BREAKPOINT ? 18 : 14);

    const handlePointerMove = (event: MouseEvent) => {
      targetX = event.clientX / window.innerWidth - 0.5;
      targetY = event.clientY / window.innerHeight - 0.5;
    };

    const handleScroll = () => {
      scrollProgress = Math.min(window.scrollY / window.innerHeight, 1);
    };

    const handleResize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.z = getCameraZ();
      camera.updateProjectionMatrix();
    };

    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(host);

    handleResize();

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Deja de renderizar por completo cuando el Hero sale del viewport
    // (scroll largo en el resto del sitio no debe seguir usando la GPU).
    let rafId = 0;
    let isVisible = true;

    function loop() {
      rafId = requestAnimationFrame(loop);

      if (!prefersReducedMotion) time += 0.0055;
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      group.rotation.z = 0.2 + Math.sin(time) * 0.06 + mouseX * 0.28;
      group.rotation.x = -0.62 + mouseY * 0.18 - scrollProgress * 0.35;
      group.position.y = scrollProgress * 5;
      camera.position.z = getCameraZ() - scrollProgress * 5;

      renderer.render(scene, camera);
    }

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        const nowVisible = entry.isIntersecting;
        if (nowVisible === isVisible) return;
        isVisible = nowVisible;
        if (isVisible) {
          loop();
        } else {
          cancelAnimationFrame(rafId);
        }
      },
      { threshold: 0 },
    );
    visibilityObserver.observe(host);

    loop();

    return () => {
      cancelAnimationFrame(rafId);
      visibilityObserver.disconnect();
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();

      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
