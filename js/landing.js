// ============================================
// ÉLITE MOTORS — LANDING PAGE JS
// ============================================

(function () {
  "use strict";

  // ===== PRELOADER =====
  window.addEventListener("load", () => {
    setTimeout(() => {
      const preloader = document.getElementById("preloader");
      if (preloader) {
        preloader.classList.add("hidden");
        setTimeout(() => preloader.remove(), 800);
      }
    }, 2200);
  });

  // ===== NAV SCROLL EFFECT =====
  const navHeader = document.getElementById("nav-header");
  let lastScroll = 0;

  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    if (scrollY > 60) {
      navHeader?.classList.add("scrolled");
    } else {
      navHeader?.classList.remove("scrolled");
    }
    lastScroll = scrollY;
  });

  // ===== MOBILE NAV TOGGLE =====
  const navToggle = document.getElementById("nav-toggle");
  const navLinks = document.getElementById("nav-links");

  navToggle?.addEventListener("click", () => {
    navToggle.classList.toggle("open");
    navLinks?.classList.toggle("open");
  });

  // Close on link click
  navLinks?.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      navToggle?.classList.remove("open");
      navLinks?.classList.remove("open");
    });
  });

  // ===== ACTIVE NAV ON SCROLL =====
  const sections = document.querySelectorAll("section[id]");
  const allNavLinks = document.querySelectorAll(".nav-link");

  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 200;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute("id");
      }
    });

    allNavLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
      }
    });
  });

  // ===== SCROLL REVEAL ANIMATIONS =====
  const animElements = document.querySelectorAll("[data-animate]");

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.getAttribute("data-delay") || 0;
          setTimeout(
            () => {
              entry.target.classList.add("visible");
            },
            parseFloat(delay) * 1000,
          );
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
  );

  animElements.forEach((el) => revealObserver.observe(el));

  // ===== SPEED SECTION — 3D SCROLL-DRIVEN CAR =====
  const speedCanvas = document.getElementById("speed-car-canvas");
  if (speedCanvas && typeof THREE !== "undefined") {
    const speedScene = new THREE.Scene();
    const speedCamera = new THREE.PerspectiveCamera(
      35,
      speedCanvas.clientWidth / speedCanvas.clientHeight,
      0.1,
      500,
    );
    const speedRenderer = new THREE.WebGLRenderer({
      canvas: speedCanvas,
      alpha: true,
      antialias: true,
    });

    speedRenderer.setSize(speedCanvas.clientWidth, speedCanvas.clientHeight);
    speedRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    speedRenderer.outputEncoding = THREE.sRGBEncoding;
    speedRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    speedRenderer.toneMappingExposure = 1.6;

    speedCamera.position.set(0, 2, 8);
    speedCamera.lookAt(0, 0.5, 0);

    // Lighting — dramatic red
    speedScene.add(new THREE.AmbientLight(0xffffff, 0.3));

    const sKey = new THREE.SpotLight(0xffffff, 4);
    sKey.position.set(-5, 8, 5);
    sKey.angle = Math.PI / 4;
    sKey.penumbra = 0.6;
    speedScene.add(sKey);

    const sRim = new THREE.SpotLight(0xff2222, 5);
    sRim.position.set(5, 2, -3);
    sRim.angle = Math.PI / 3;
    sRim.penumbra = 0.8;
    speedScene.add(sRim);

    const sBottom = new THREE.PointLight(0xc41e3a, 3, 15);
    sBottom.position.set(0, -1, 2);
    speedScene.add(sBottom);

    speedScene.add(new THREE.DirectionalLight(0xffffff, 0.8).translateY(10));

    let speedCar = null;
    const startX = -12;
    const endX = 12;

    let speedCarGroup = new THREE.Group();
    speedScene.add(speedCarGroup);

    // Load model
    const speedLoader = new THREE.GLTFLoader();
    speedLoader.load("models/2021_lamborghini_sian_roadster.glb", (gltf) => {
      speedCar = gltf.scene;

      // Scale
      const box = new THREE.Box3().setFromObject(speedCar);
      const size = box.getSize(new THREE.Vector3());
      const s = 4 / Math.max(size.x, size.y, size.z);
      speedCar.scale.setScalar(s);

      // Center it
      const center = box.getCenter(new THREE.Vector3());
      speedCar.position.set(-center.x * s, -center.y * s, -center.z * s);

      // Car faces right originally? Default usually faces Z. Let's make it face right on its local Y axis
      speedCar.rotation.y = Math.PI / 2;

      speedCarGroup.add(speedCar);

      // Now we rotate the entire group so the wheels are against the wall (Z=0) 
      // and the roof points towards the camera (+Z).
      speedCarGroup.rotation.x = Math.PI / 2;
    });

    // Scroll tracking
    function getSpeedProgress() {
      const section = document.getElementById("speed-cta");
      if (!section) return -1;
      const rect = section.getBoundingClientRect();
      const windowH = window.innerHeight;
      // Progress: 0 when section top enters viewport, 1 when section bottom leaves
      const progress = (windowH - rect.top) / (windowH + rect.height);
      return Math.max(0, Math.min(1, progress));
    }

    // Resize
    window.addEventListener("resize", () => {
      const w = speedCanvas.clientWidth;
      const h = speedCanvas.clientHeight;
      speedRenderer.setSize(w, h);
      speedCamera.aspect = w / h;
      speedCamera.updateProjectionMatrix();
    });

    // Render loop
    function speedAnimate() {
      requestAnimationFrame(speedAnimate);

      if (speedCar) {
        const progress = getSpeedProgress();
        // Map 0–1 progress to a faster sweep: it starts moving later and finishes earlier
        let p = Math.max(0, Math.min(1, progress * 4 - 1.5));
        speedCarGroup.position.x = startX + (endX - startX) * p;

        // Subtle wobble for realism
        speedCarGroup.rotation.z = Math.sin(performance.now() * 0.002) * 0.02;
      }

      speedRenderer.render(speedScene, speedCamera);
    }

    speedAnimate();
  }

  // ===== COUNT-UP ANIMATION =====
  function animateCounter(el) {
    const target = parseInt(el.getAttribute("data-count"));
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out expo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(eased * target);
      el.textContent = current.toLocaleString("pt-BR");

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  const counterElements = document.querySelectorAll("[data-count]");
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 },
  );

  counterElements.forEach((el) => counterObserver.observe(el));

  // ===== 3D VAULT SHOWCASE =====
  const vaultCanvas = document.getElementById("vault-canvas");
  const vaultSection = document.getElementById("vault-section");
  
  if (vaultCanvas && vaultSection && typeof THREE !== "undefined") {
    const vScene = new THREE.Scene();
    // Add fog to fade the background into pitch black, giving depth
    vScene.fog = new THREE.Fog(0x000000, 20, 60);
    
    const vCamera = new THREE.PerspectiveCamera(40, vaultCanvas.clientWidth / vaultCanvas.clientHeight, 0.1, 1000);
    // Moved camera further back to accommodate the massive pedestal
    vCamera.position.set(0, 5.0, 24);
    
    const vRenderer = new THREE.WebGLRenderer({ canvas: vaultCanvas, alpha: true, antialias: true });
    vRenderer.setSize(vaultCanvas.clientWidth, vaultCanvas.clientHeight);
    vRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Lighting
    const vAmbient = new THREE.AmbientLight(0xffffff, 0.8);
    vScene.add(vAmbient);
    
    const vSpotlight = new THREE.SpotLight(0xffffff, 3);
    // Expand spotlight to cover giant pedestal
    vSpotlight.position.set(0, 15, 10);
    vSpotlight.angle = Math.PI / 2.5;
    vSpotlight.penumbra = 0.5;
    vScene.add(vSpotlight);
    
    // Pedestal
    // Massive size and height
    const pedGeo = new THREE.CylinderGeometry(8.5, 9.5, 5.0, 64);
    const pedMat = new THREE.MeshStandardMaterial({ 
      color: 0x181818, 
      metalness: 0.2, 
      roughness: 0.8 
    });
    const pedestal = new THREE.Mesh(pedGeo, pedMat);
    // Positioned so the top stays exactly at 0.15 (0.15 - 2.50 = -2.35)
    pedestal.position.y = -2.35;
    vScene.add(pedestal);
    
    // Silver 3D Rim (using Torus for realistic light reflections instead of flat Ring)
    const rimGeo = new THREE.TorusGeometry(8.5, 0.15, 16, 100);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.5, roughness: 0.2 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = -Math.PI / 2;
    rim.position.y = 0.15; // exactly at the top edge of the pedestal
    vScene.add(rim);

    // Floor Grid to give a "Studio/Vault" environment feel
    const grid = new THREE.GridHelper(150, 60, 0x333333, 0x1a1a1a);
    grid.position.y = -4.86; // Lowered very slightly to prevent Z-fighting/clipping with the pedestal base
    vScene.add(grid);

    // Models Data
    const vaultData = [
      {
          name: "SIAN ROADSTER",
          brand: "LAMBORGHINI",
          power: "819 cv",
          engine: "V12 Híbrido",
          price: "R$ 18.000.000",
          file: "models/2021_lamborghini_sian_roadster.glb"
      },
      {
          name: "INVENCIBLE 2023",
          brand: "LAMBORGHINI",
          power: "780 cv",
          engine: "V12",
          price: "R$ 16.500.000",
          file: "models/2023_lamborghini_invencible.glb"
      },
      {
          name: "VENENO",
          brand: "LAMBORGHINI",
          power: "750 cv",
          engine: "V12",
          price: "R$ 22.000.000",
          file: "models/lamborghini_venevo.glb"
      },
      {
          name: "EGOISTA CONCEPT",
          brand: "LAMBORGHINI",
          power: "600 cv",
          engine: "V10",
          price: "Exclusivo",
          file: "models/2013_lamborghini_egoista_concept.glb"
      },
      {
          name: "HURACÁN STERRATO",
          brand: "LAMBORGHINI",
          power: "610 cv",
          engine: "V10",
          price: "R$ 4.500.000",
          file: "models/lamborghini.glb"
      }
    ];

    let currentVIndex = 0;
    const loadedVModels = {};
    const loadingVModels = {};
    let activeVModel = null;
    const vLoader = new THREE.GLTFLoader();
    
    const domBrand = document.getElementById("vault-brand");
    const domName = document.getElementById("vault-name");
    const domPower = document.getElementById("vault-power");
    const domEngine = document.getElementById("vault-engine");
    const domPrice = document.getElementById("vault-price-val");
    const domLoading = document.getElementById("vault-loading");

    function loadModelFromData(index, isPreload = false) {
      if (loadedVModels[index] || loadingVModels[index]) return;
      loadingVModels[index] = true;
      
      if (!isPreload) domLoading.classList.add("active");

      vLoader.load(vaultData[index].file, (gltf) => {
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const s = 12 / Math.max(size.x, size.y, size.z);
        model.scale.setScalar(s);
        model.position.set(-center.x * s, (-box.min.y * s) + 0.15, -center.z * s);
        
        const group = new THREE.Group();
        group.add(model);
        
        loadedVModels[index] = group;
        loadingVModels[index] = false;
        
        if (currentVIndex === index) {
           activeVModel = group;
           vScene.add(activeVModel);
           domLoading.classList.remove("active");
        }
      });
    }

    function loadVaultModel(index) {
      if (activeVModel) {
        vScene.remove(activeVModel);
        activeVModel = null;
      }
      
      const data = vaultData[index];
      
      // Update DOM
      domBrand.textContent = data.brand;
      domName.textContent = data.name;
      domPower.innerHTML = `<i class="fas fa-tachometer-alt"></i> ${data.power}`;
      domEngine.innerHTML = `<i class="fas fa-gas-pump"></i> ${data.engine}`;
      domPrice.textContent = data.price;
      
      if (loadedVModels[index]) {
        activeVModel = loadedVModels[index];
        vScene.add(activeVModel);
        domLoading.classList.remove("active");
      } else {
        domLoading.classList.add("active");
        loadModelFromData(index, false);
      }
    }

    // Controls
    document.getElementById("vault-prev").addEventListener("click", () => {
      currentVIndex = (currentVIndex - 1 + vaultData.length) % vaultData.length;
      loadVaultModel(currentVIndex);
    });
    document.getElementById("vault-next").addEventListener("click", () => {
      currentVIndex = (currentVIndex + 1) % vaultData.length;
      loadVaultModel(currentVIndex);
    });

    // Initial load
    loadVaultModel(0);
    
    // Preload remaining models silently in the background immediately
    for (let i = 1; i < vaultData.length; i++) {
      loadModelFromData(i, true);
    }
    
    // Observer for Vault Open
    const vaultObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Snap the vault to the center of the screen smoothly
          vaultSection.scrollIntoView({ behavior: "smooth", block: "center" });
          
          vaultSection.classList.add("is-open");
          
          // Block scroll for 2 seconds so they watch the doors open
          // Needs both body and documentElement to guarantee lock on all browsers
          document.body.style.overflow = "hidden";
          document.documentElement.style.overflow = "hidden";
          setTimeout(() => {
            document.body.style.overflow = "";
            document.documentElement.style.overflow = "";
          }, 2000);
          
          vaultObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.65 });
    
    vaultObserver.observe(vaultSection);

    // Resize
    window.addEventListener("resize", () => {
      const w = vaultSection.clientWidth;
      const h = vaultSection.clientHeight;
      vRenderer.setSize(w, h);
      vCamera.aspect = w / h;
      vCamera.updateProjectionMatrix();
    });

    // Animate
    function vAnimate() {
      requestAnimationFrame(vAnimate);
      
      if (activeVModel) {
        activeVModel.rotation.y += 0.005; // Spin slowly
      }
      
      vRenderer.render(vScene, vCamera);
    }
    vAnimate();
  }

  // ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  // ===== 3D CAR MODEL (THREE.JS) =====
  if (typeof THREE !== "undefined") {
    class DealershipCarModel {
      constructor() {
        this.container = document.getElementById("hero-3d-car");
        if (!this.container) return;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
          40,
          this.container.clientWidth / this.container.clientHeight,
          0.1,
          1000,
        );
        this.renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
        });

        this.model = null;
        this.mouseX = 0;
        this.mouseY = 0;
        this.floatTime = 0;
        this.autoRotate = true;

        this.init();
      }

      init() {
        this.renderer.setSize(
          this.container.clientWidth,
          this.container.clientHeight,
        );
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.4;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.container.appendChild(this.renderer.domElement);

        // Camera position — elegant 3/4 view
        this.camera.position.set(3, 1.5, 5);
        this.camera.lookAt(0, 0.3, 0);

        this.setupLighting();
        this.loadModel();

        window.addEventListener("resize", () => this.onResize());
        window.addEventListener("mousemove", (e) => {
          this.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
          this.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });

        this.animate();
      }

      onResize() {
        if (!this.container) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
      }

      setupLighting() {
        // Cool white ambient
        const ambient = new THREE.AmbientLight(0xffffff, 0.25);
        this.scene.add(ambient);

        // Key light — bright white
        const keyLight = new THREE.SpotLight(0xffffff, 3);
        keyLight.position.set(-4, 8, 5);
        keyLight.angle = Math.PI / 4;
        keyLight.penumbra = 0.5;
        keyLight.castShadow = true;
        this.scene.add(keyLight);

        // Rim light — red accent glow
        const rimLight = new THREE.SpotLight(0xff2222, 4);
        rimLight.position.set(6, 3, -4);
        rimLight.angle = Math.PI / 3;
        rimLight.penumbra = 0.8;
        this.scene.add(rimLight);

        // Fill — deep red from below
        const fillLight = new THREE.PointLight(0xc41e3a, 2, 12);
        fillLight.position.set(0, -1, 3);
        this.scene.add(fillLight);

        // Top accent
        const topLight = new THREE.DirectionalLight(0xffffff, 1.0);
        topLight.position.set(0, 10, 0);
        this.scene.add(topLight);
      }

      loadModel() {
        const loader = new THREE.GLTFLoader();
        loader.load(
          "models/lamborghini.glb",
          (gltf) => {
            this.model = gltf.scene;

            // Blood Red Lamborghini metallic paint
            const luxuryPaint = new THREE.MeshPhysicalMaterial({
              color: 0x8b0000,
              metalness: 0.85,
              roughness: 0.15,
              clearcoat: 1.0,
              clearcoatRoughness: 0.03,
              envMapIntensity: 2.5,
              reflectivity: 0.95,
            });

            this.model.traverse((child) => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                const mName = child.material.name
                  ? child.material.name.toLowerCase()
                  : "";
                if (
                  mName.includes("body") ||
                  mName.includes("paint") ||
                  (child.material.color && child.material.color.r > 0.5)
                ) {
                  child.material = luxuryPaint;
                }
              }
            });

            // Scale and position
            const box = new THREE.Box3().setFromObject(this.model);
            const size = box.getSize(new THREE.Vector3());
            const scale = 3.5 / Math.max(size.x, size.y, size.z);
            this.model.scale.setScalar(scale);
            this.model.position.y = -0.5;
            this.model.rotation.y = Math.PI / 6; // Slight angle

            this.scene.add(this.model);

            // Hide loading
            const loading = this.container.querySelector(".car-loading");
            if (loading) loading.style.display = "none";
          },
          undefined,
          (error) => {
            console.warn("3D model failed to load:", error);
            const loading = this.container.querySelector(".car-loading");
            if (loading)
              loading.innerHTML =
                '<span style="color: #555;">Modelo 3D indisponível</span>';
          },
        );
      }

      animate() {
        requestAnimationFrame(() => this.animate());

        if (this.model) {
          this.floatTime += 0.008;

          // Gentle floating
          this.model.position.y = -0.5 + Math.sin(this.floatTime) * 0.03;

          // Auto-rotate + mouse influence
          if (this.autoRotate) {
            this.model.rotation.y += 0.003;
          }
          this.model.rotation.y +=
            (this.mouseX * 0.05 - (this.model.rotation.y % (Math.PI * 2)) * 0) *
            0.02;

          // Subtle camera sway
          this.camera.position.y = 1.5 + this.mouseY * -0.2;
          this.camera.lookAt(0, 0.3, 0);
        }

        this.renderer.render(this.scene, this.camera);
      }
    }

    window.addEventListener("load", () => {
      new DealershipCarModel();
    });
  }

  // ===== CARD TILT EFFECT =====
  document.addEventListener("mousemove", (e) => {
    const card = e.target.closest(".car-card");
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const rotateX = (y - 0.5) * -6;
    const rotateY = (x - 0.5) * 6;

    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
  });

  document.addEventListener(
    "mouseleave",
    (e) => {
      const card = e.target.closest?.(".car-card");
      if (card) {
        card.style.transform = "";
      }
    },
    true,
  );

  document.querySelectorAll(".car-card").forEach((card) => {
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
})();
