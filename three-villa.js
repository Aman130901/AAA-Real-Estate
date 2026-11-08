/**
 * AAA Real Estate — Interactive 3D Architectural Villa Model
 * Powered by Three.js & OrbitControls
 * Fully responsive for Desktop & Mobile with smooth idle rotation & touch gestures.
 */
(function () {
  'use strict';

  function initHero3D() {
    const container = document.getElementById('hero3dContainer');
    const canvas = document.getElementById('hero3dCanvas');
    if (!container || !canvas || typeof THREE === 'undefined') return;

    // Check WebGL support
    try {
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) throw new Error('WebGL not supported');
    } catch (e) {
      console.warn('3D disabled: WebGL not available');
      container.classList.add('no-webgl');
      return;
    }

    // SCENE, CAMERA, RENDERER
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x162E50, 0.018);

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 520;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    const isMobile = window.innerWidth <= 768;
    camera.position.set(isMobile ? 15 : 13, isMobile ? 11 : 9.5, isMobile ? 17 : 14);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    // ORBIT CONTROLS
    let controls = null;
    if (typeof THREE.OrbitControls !== 'undefined') {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.enableZoom = true;
      controls.minDistance = 9;
      controls.maxDistance = 26;
      controls.maxPolarAngle = Math.PI / 2.08; // No below-ground view
      controls.autoRotate = true;
      controls.autoRotateSpeed = 1.1;
      controls.target.set(0, 1.8, 0);

      // Pause auto-rotation during user interaction
      let idleTimer = null;
      const onUserInteract = () => {
        controls.autoRotate = false;
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
          controls.autoRotate = true;
        }, 3500);
      };
      renderer.domElement.addEventListener('pointerdown', onUserInteract);
      renderer.domElement.addEventListener('wheel', onUserInteract, { passive: true });
      renderer.domElement.addEventListener('touchstart', onUserInteract, { passive: true });
    }

    // LIGHTING
    const ambientLight = new THREE.AmbientLight(0xE2E8F0, 0.7);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xFFFBEB, 1.35);
    sunLight.position.set(16, 24, 18);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 60;
    sunLight.shadow.camera.left = -12;
    sunLight.shadow.camera.right = 12;
    sunLight.shadow.camera.top = 12;
    sunLight.shadow.camera.bottom = -12;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Blue architectural fill light from opposite angle
    const fillLight = new THREE.DirectionalLight(0x38BDF8, 0.45);
    fillLight.position.set(-16, 12, -14);
    scene.add(fillLight);

    // Warm Interior Point Light (living room glow)
    const interiorLight = new THREE.PointLight(0xF59E0B, 1.5, 9);
    interiorLight.position.set(0.5, 1.8, 0.5);
    scene.add(interiorLight);

    // Underwater Pool Light
    const poolLight = new THREE.PointLight(0x38BDF8, 1.2, 6);
    poolLight.position.set(3.2, 0.2, 2.5);
    scene.add(poolLight);

    // MATERIALS
    const mats = {
      pedestal: new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.85, metalness: 0.1 }),
      grass: new THREE.MeshStandardMaterial({ color: 0x22C55E, roughness: 0.9 }),
      deck: new THREE.MeshStandardMaterial({ color: 0xC28854, roughness: 0.65 }),
      poolBasin: new THREE.MeshStandardMaterial({ color: 0x0284C7, roughness: 0.3 }),
      water: new THREE.MeshStandardMaterial({
        color: 0x38BDF8,
        roughness: 0.08,
        metalness: 0.2,
        transparent: true,
        opacity: 0.82
      }),
      concreteWhite: new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.45 }),
      concreteCharcoal: new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 }),
      woodTrim: new THREE.MeshStandardMaterial({ color: 0x9A5B2C, roughness: 0.6 }),
      glass: new THREE.MeshStandardMaterial({
        color: 0xBAE6FD,
        roughness: 0.1,
        metalness: 0.8,
        transparent: true,
        opacity: 0.42
      }),
      mullion: new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.4 }),
      gold: new THREE.MeshStandardMaterial({ color: 0xE5A835, metalness: 0.85, roughness: 0.2 }),
      treeFoliage: new THREE.MeshStandardMaterial({ color: 0x15803D, roughness: 0.8 }),
      treeTrunk: new THREE.MeshStandardMaterial({ color: 0x78350F, roughness: 0.9 }),
      pathway: new THREE.MeshStandardMaterial({ color: 0xE2E8F0, roughness: 0.8 })
    };

    // VILLA GROUP
    const villa = new THREE.Group();
    scene.add(villa);

    // 1. Pedestal Base
    const baseGeo = new THREE.BoxGeometry(16, 0.5, 14);
    const baseMesh = new THREE.Mesh(baseGeo, mats.pedestal);
    baseMesh.position.y = -0.25;
    baseMesh.receiveShadow = true;
    villa.add(baseMesh);

    // 2. Lawn
    const lawnGeo = new THREE.BoxGeometry(6.5, 0.1, 7.5);
    const lawnMesh = new THREE.Mesh(lawnGeo, mats.grass);
    lawnMesh.position.set(-4, 0.05, 2.2);
    lawnMesh.receiveShadow = true;
    villa.add(lawnMesh);

    // 3. Pool Deck & Water
    const deckGeo = new THREE.BoxGeometry(6.5, 0.12, 5);
    const deckMesh = new THREE.Mesh(deckGeo, mats.deck);
    deckMesh.position.set(3.8, 0.06, 2.2);
    deckMesh.receiveShadow = true;
    villa.add(deckMesh);

    const poolBasinGeo = new THREE.BoxGeometry(5.2, 0.18, 3.6);
    const poolBasin = new THREE.Mesh(poolBasinGeo, mats.poolBasin);
    poolBasin.position.set(3.8, 0.02, 2.2);
    villa.add(poolBasin);

    const waterGeo = new THREE.PlaneGeometry(5.0, 3.4);
    const water = new THREE.Mesh(waterGeo, mats.water);
    water.rotation.x = -Math.PI / 2;
    water.position.set(3.8, 0.12, 2.2);
    villa.add(water);

    // Stepping stones across garden
    for (let i = 0; i < 4; i++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.06, 0.6), mats.pathway);
      step.position.set(-0.8, 0.04, 1.2 + i * 1.0);
      step.receiveShadow = true;
      villa.add(step);
    }

    // 4. Ground Floor Structure (Living Room / Foyer)
    const gfWalls = new THREE.Mesh(new THREE.BoxGeometry(7.5, 2.6, 6.5), mats.concreteWhite);
    gfWalls.position.set(-0.5, 1.3, -1.2);
    gfWalls.castShadow = true;
    gfWalls.receiveShadow = true;
    villa.add(gfWalls);

    // Floor-to-ceiling glass corner
    const glassCorner1 = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.3, 0.08), mats.glass);
    glassCorner1.position.set(1.1, 1.25, 2.06);
    villa.add(glassCorner1);

    const glassCorner2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.3, 3.2), mats.glass);
    glassCorner2.position.set(3.26, 1.25, 0.5);
    villa.add(glassCorner2);

    // Dark sleek mullions
    const mullionH = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.06, 0.1), mats.mullion);
    mullionH.position.set(1.1, 1.8, 2.07);
    villa.add(mullionH);

    // 5. Cantilevered Upper Level (Master Suite)
    const ufWalls = new THREE.Mesh(new THREE.BoxGeometry(6.8, 2.4, 5.8), mats.concreteCharcoal);
    ufWalls.position.set(1.2, 3.7, -0.6); // projecting forward and right
    ufWalls.castShadow = true;
    ufWalls.receiveShadow = true;
    villa.add(ufWalls);

    // Upper level glass balcony & bedroom wall
    const ufGlass = new THREE.Mesh(new THREE.BoxGeometry(4.6, 2.1, 0.08), mats.glass);
    ufGlass.position.set(2.0, 3.65, 2.32);
    villa.add(ufGlass);

    // Balcony glass railing
    const railGeo = new THREE.BoxGeometry(4.6, 0.7, 0.04);
    const rail = new THREE.Mesh(railGeo, mats.glass);
    rail.position.set(2.0, 2.85, 2.5);
    villa.add(rail);

    const railTop = new THREE.Mesh(new THREE.BoxGeometry(4.65, 0.05, 0.06), mats.mullion);
    railTop.position.set(2.0, 3.2, 2.5);
    villa.add(railTop);

    // 6. Flat Roof & Architectural Pergola
    const roof = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.25, 6.4), mats.concreteWhite);
    roof.position.set(1.2, 4.95, -0.6);
    roof.castShadow = true;
    roof.receiveShadow = true;
    villa.add(roof);

    // Wooden pergola slats over patio
    for (let i = 0; i < 6; i++) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.08, 0.12), mats.woodTrim);
      slat.position.set(2.5, 2.65, -0.8 + i * 0.45);
      slat.castShadow = true;
      villa.add(slat);
    }

    // 7. Landscaping Trees & Planters
    const createTree = (x, z, h = 2.4) => {
      const g = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, h * 0.4, 8), mats.treeTrunk);
      trunk.position.y = h * 0.2;
      trunk.castShadow = true;
      g.add(trunk);

      const foliage = new THREE.Mesh(new THREE.ConeGeometry(h * 0.45, h * 0.85, 8), mats.treeFoliage);
      foliage.position.y = h * 0.65;
      foliage.castShadow = true;
      g.add(foliage);

      g.position.set(x, 0, z);
      return g;
    };

    villa.add(createTree(-5.5, -4.5, 3.2));
    villa.add(createTree(-6.2, -2.5, 2.8));
    villa.add(createTree(-5.8, 3.5, 2.5));
    villa.add(createTree(6.2, -4.8, 3.0));

    // Garden bollard lights
    const bollardGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.4, 8);
    const bollardCapGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.08, 8);
    const bollardMat = new THREE.MeshBasicMaterial({ color: 0xFDE047 });
    [
      [-1.4, 1.2],
      [-1.4, 2.6],
      [-1.4, 4.0],
      [1.0, 4.4]
    ].forEach(([bx, bz]) => {
      const bTrunk = new THREE.Mesh(bollardGeo, mats.mullion);
      bTrunk.position.set(bx, 0.2, bz);
      const bCap = new THREE.Mesh(bollardCapGeo, bollardMat);
      bCap.position.set(bx, 0.42, bz);
      villa.add(bTrunk);
      villa.add(bCap);
    });

    // 8. Floating 3D Golden Property Pin / Key
    const pinGroup = new THREE.Group();
    const pinHead = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 16), mats.gold);
    pinHead.position.y = 0.5;
    pinGroup.add(pinHead);

    const pinCone = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.0, 16), mats.gold);
    pinCone.rotation.x = Math.PI;
    pinCone.position.y = 0;
    pinGroup.add(pinCone);

    const pinHole = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.6, 16), mats.pedestal);
    pinHole.rotation.z = Math.PI / 2;
    pinHole.position.y = 0.5;
    pinGroup.add(pinHole);

    pinGroup.position.set(1.2, 6.2, -0.6);
    pinGroup.scale.set(0.85, 0.85, 0.85);
    villa.add(pinGroup);

    // Center scene
    villa.position.set(0, -1.2, 0);

    // CONTROLS / BUTTON INTERACTIONS
    const btnReset = document.getElementById('hero3dReset');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (controls) {
          controls.reset();
          camera.position.set(isMobile ? 15 : 13, isMobile ? 11 : 9.5, isMobile ? 17 : 14);
          controls.target.set(0, 1.8, 0);
          controls.autoRotate = true;
        }
      });
    }

    let isNight = false;
    const btnTheme = document.getElementById('hero3dTheme');
    if (btnTheme) {
      btnTheme.addEventListener('click', () => {
        isNight = !isNight;
        if (isNight) {
          btnTheme.innerHTML = '☀️ Daylight';
          sunLight.intensity = 0.35;
          sunLight.color.setHex(0x38BDF8);
          ambientLight.intensity = 0.35;
          interiorLight.intensity = 2.8;
          poolLight.intensity = 2.4;
        } else {
          btnTheme.innerHTML = '🌙 Sunset Glow';
          sunLight.intensity = 1.35;
          sunLight.color.setHex(0xFFFBEB);
          ambientLight.intensity = 0.7;
          interiorLight.intensity = 1.5;
          poolLight.intensity = 1.2;
        }
      });
    }

    // Toggle 3D vs Photo
    const btn3d = document.getElementById('viewToggle3d');
    const btnPhoto = document.getElementById('viewTogglePhoto');
    const photoImg = document.getElementById('heroPhotoImg');

    if (btn3d && btnPhoto && photoImg) {
      btn3d.addEventListener('click', () => {
        btn3d.classList.add('active');
        btnPhoto.classList.remove('active');
        canvas.style.display = 'block';
        photoImg.style.display = 'none';
        const hint = document.getElementById('hero3dHint');
        if (hint) hint.style.display = 'flex';
      });

      btnPhoto.addEventListener('click', () => {
        btnPhoto.classList.add('active');
        btn3d.classList.remove('active');
        canvas.style.display = 'none';
        photoImg.style.display = 'block';
        const hint = document.getElementById('hero3dHint');
        if (hint) hint.style.display = 'none';
      });
    }

    // RESIZE LISTENER
    function onResize() {
      if (!container) return;
      const w = container.clientWidth || 400;
      const h = container.clientHeight || 400;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);

    // INTERSECTION OBSERVER (Pause rendering when off-screen)
    let isVisible = true;
    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver((entries) => {
        isVisible = entries[0].isIntersecting;
      }, { threshold: 0.05 });
      obs.observe(container);
    }

    // ANIMATION LOOP
    let clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);

      if (!isVisible) return;

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Floating golden pin oscillation & spin
      pinGroup.position.y = 6.2 + Math.sin(time * 2.2) * 0.18;
      pinGroup.rotation.y += 0.015;

      // Subtle water shimmer
      water.position.y = 0.12 + Math.sin(time * 3.0) * 0.01;

      if (controls) controls.update();

      renderer.render(scene, camera);
    }
    animate();
  }

  // Auto init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHero3D);
  } else {
    initHero3D();
  }
})();

