// =========================================
// PHASE 5 & 7: PROCEDURAL 3D ENVIRONMENTS
// =========================================

document.addEventListener('DOMContentLoaded', () => {

    // Pre-load Engine Start Audio
    const carStartAudio = new Audio("../assets/audio/car-start.mp3");
    carStartAudio.volume = 0.6;

// =========================================
    // PHASE 7: 3D SPORTS CAR (CINEMATIC BOSS ENTRANCE)
    // =========================================
    const carContainer = document.getElementById('car-canvas-container');
    if (carContainer && typeof THREE !== 'undefined') {
        const carScene = new THREE.Scene();
        carScene.fog = new THREE.FogExp2(0x030712, 0.012);

        const carRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        carRenderer.setSize(window.innerWidth, window.innerHeight);
        carRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        carContainer.appendChild(carRenderer.domElement);

        // Cameras
        const carCams = [];
        const followCam = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
        followCam.position.set(0, 6, 22);
        carCams.push(followCam);

        const sideCam = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        sideCam.position.set(25, 5, 10);
        carCams.push(sideCam);

        let activeCarCamIndex = 0;
        let activeCarCam = carCams[activeCarCamIndex];

        // Lights
        const carAmbient = new THREE.AmbientLight(0xffffff, 0.8);
        carScene.add(carAmbient);

        const carSun = new THREE.DirectionalLight(0x00E5FF, 1.5);
        carSun.position.set(20, 40, 20);
        carScene.add(carSun);

        // Highway Infrastructure
        const roadGeo = new THREE.PlaneGeometry(30, 2000);
        const roadMat = new THREE.MeshPhongMaterial({ color: 0x080e18, shininess: 80 });
        const road = new THREE.Mesh(roadGeo, roadMat);
        road.rotation.x = -Math.PI / 2;
        carScene.add(road);

        const roadGroup = new THREE.Group();
        carScene.add(roadGroup);

        const stripeGeo = new THREE.BoxGeometry(0.6, 0.1, 6);
        const stripeMat = new THREE.MeshBasicMaterial({ color: 0x00E5FF });
        const lightPostMat = new THREE.MeshBasicMaterial({ color: 0x8B5CF6 });

        const roadItems = [];
        for (let i = -50; i < 50; i++) {
            const stripe = new THREE.Mesh(stripeGeo, stripeMat);
            stripe.position.set(0, 0.05, i * 15);
            roadGroup.add(stripe);
            roadItems.push(stripe);

            if (i % 2 === 0) {
                const post = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 12), lightPostMat);
                post.position.set(16, 6, i * 15);
                roadGroup.add(post);
                roadItems.push(post);
            }
        }

        // Procedural Sports Car Model
        const sportsCar = new THREE.Group();
        carScene.add(sportsCar);

        const carBodyMat = new THREE.MeshPhongMaterial({ color: 0x07111F, specular: 0x00E5FF, shininess: 120 });
        const carGlowMat = new THREE.MeshBasicMaterial({ color: 0x00E5FF });
        const wheelMat = new THREE.MeshPhongMaterial({ color: 0x111111 });

        const chassis = new THREE.Mesh(new THREE.BoxGeometry(5.5, 1.8, 12), carBodyMat);
        chassis.position.set(0, 1.5, 0);
        sportsCar.add(chassis);

        const cabin = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.4, 6), carBodyMat);
        cabin.position.set(0, 3, -1);
        sportsCar.add(cabin);

        const headlightL = new THREE.Mesh(new THREE.BoxGeometry(1, 0.4, 0.2), carGlowMat);
        headlightL.position.set(-1.8, 1.6, 6);
        sportsCar.add(headlightL);

        const headlightR = headlightL.clone();
        headlightR.position.x = 1.8;
        sportsCar.add(headlightR);

        const wheelGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.8, 16);
        wheelGeo.rotateZ(Math.PI / 2);
        const carWheels = [];
        const wheelPositions = [[-2.8, 1.2, 3.5], [2.8, 1.2, 3.5], [-2.8, 1.2, -3.5], [2.8, 1.2, -3.5]];
        
        wheelPositions.forEach(pos => {
            const w = new THREE.Mesh(wheelGeo, wheelMat);
            w.position.set(...pos);
            sportsCar.add(w);
            carWheels.push(w);
        });

        // =========================================
        // CINEMATIC VARIABLES & PHYSICS
        // =========================================
        let carSpeedObj = { speed: 0 }; 
        let isCarRunning = false;
        let isCinematicSequenceActive = false;
        let shakeIntensity = 0;
        let explosionParticles = [];

        const impactFlash = document.createElement('div');
        impactFlash.style.cssText = "position:absolute; inset:0; background:white; opacity:0; pointer-events:none; z-index:9999;";
        carContainer.appendChild(impactFlash);

        const cinematicSubtitle = document.createElement('div');
        cinematicSubtitle.style.cssText = "position:absolute; bottom:38%; left:50%; transform:translateX(-50%); text-align:center; font-family:var(--font-heading, sans-serif); font-size:1.8rem; color:#fff; text-shadow:0 0 20px rgba(0,229,255,0.8); opacity:0; pointer-events:none; z-index:9999; letter-spacing:2px; width:80%;";
        carContainer.appendChild(cinematicSubtitle);

        function showSubtitle(text, duration = 3) {
            gsap.killTweensOf(cinematicSubtitle);
            cinematicSubtitle.innerHTML = text;
            gsap.fromTo(cinematicSubtitle, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: "power2.out" });
            gsap.to(cinematicSubtitle, { opacity: 0, y: -20, duration: 1, delay: duration, ease: "power2.in" });
        }

        // CAR DOOR
        const doorGroup = new THREE.Group();
        doorGroup.position.set(-2.25, 2.3, 2); 
        sportsCar.add(doorGroup);
        const doorGeo = new THREE.BoxGeometry(0.2, 1.4, 3);
        const carDoor = new THREE.Mesh(doorGeo, carBodyMat);
        carDoor.position.set(0, 0, -1.5); 
        doorGroup.add(carDoor);

        // =========================================
        // THE BOSS CHARACTER (TOP HAT & MONOCLE)
        // =========================================
        const heroGroup = new THREE.Group();
        heroGroup.position.set(-4, 0, 1); 
        heroGroup.rotation.y = Math.PI / 2; // Face forward initially
        heroGroup.visible = false; 
        carScene.add(heroGroup);

        const blackMat = new THREE.MeshPhongMaterial({ color: 0x111111 });
        const whiteMat = new THREE.MeshPhongMaterial({ color: 0xeeeeee });
        const redMat = new THREE.MeshPhongMaterial({ color: 0xcc0000 });
        const goldMat = new THREE.MeshPhongMaterial({ color: 0xffd700 });
        const glassMat = new THREE.MeshPhongMaterial({ color: 0x88ccff, transparent: true, opacity: 0.6 });
        const cigarMat = new THREE.MeshPhongMaterial({ color: 0x5c4033 });
        const cherryMat = new THREE.MeshBasicMaterial({ color: 0xff4400 });

        // Stick Body
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 2.5), blackMat);
        body.position.y = 1.25;
        heroGroup.add(body);

        // Head
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.7, 32, 32), whiteMat);
        head.position.y = 3.2;
        heroGroup.add(head);

        // Top Hat
        const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.1, 32), blackMat);
        hatBrim.position.set(0, 3.8, 0);
        hatBrim.rotation.x = -0.1; // Slightly tipped
        const hatTop = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 1.2, 32), blackMat);
        hatTop.position.set(0, 4.4, 0.05);
        hatTop.rotation.x = -0.1;
        const hatBand = new THREE.Mesh(new THREE.CylinderGeometry(0.81, 0.81, 0.2, 32), redMat);
        hatBand.position.set(0, 3.9, 0.01);
        hatBand.rotation.x = -0.1;
        heroGroup.add(hatBrim, hatTop, hatBand);

        // Monocle
        const monocleRim = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.04, 16, 32), goldMat);
        monocleRim.position.set(0.3, 3.3, 0.65);
        const monocleGlass = new THREE.Mesh(new THREE.CircleGeometry(0.2, 32), glassMat);
        monocleGlass.position.set(0.3, 3.3, 0.65);
        heroGroup.add(monocleRim, monocleGlass);

        // Mustache
        const stacheGeo = new THREE.BoxGeometry(1.0, 0.2, 0.1);
        const stache = new THREE.Mesh(stacheGeo, blackMat);
        stache.position.set(0, 2.9, 0.65);
        heroGroup.add(stache);

        // Cigar
        const cigar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.8), cigarMat);
        cigar.rotation.z = Math.PI / 2;
        cigar.position.set(-0.4, 2.75, 0.7);
        const cherry = new THREE.Mesh(new THREE.SphereGeometry(0.08), cherryMat);
        cherry.position.set(-0.8, 2.75, 0.7);
        heroGroup.add(cigar, cherry);

        let camTarget = { x: 0, y: 1, z: 0 };

        function triggerExplosion() {
            const colors = [0xff4400, 0xff8800, 0xff2200, 0x333333, 0x111111, 0xaaaaaa];
            for (let i = 0; i < 150; i++) {
                const isSmoke = i > 80;
                const pMat = new THREE.MeshBasicMaterial({ color: colors[Math.floor(Math.random() * colors.length)], transparent: true, opacity: isSmoke ? 0.6 : 1 });
                const size = isSmoke ? Math.random() * 2 + 1 : Math.random() * 0.8 + 0.2;
                const pMesh = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), pMat);
                pMesh.position.set(sportsCar.position.x + (Math.random() - 0.5) * 4, sportsCar.position.y + Math.random() * 3, sportsCar.position.z + (Math.random() - 0.5) * 6);
                pMesh.userData = { vx: (Math.random() - 0.5) * 1.5, vy: Math.random() * 2 + 0.5, vz: (Math.random() - 0.5) * 1.5 + (carSpeedObj.speed * 0.005), life: 1.0, decay: isSmoke ? 0.005 : 0.02, isSmoke: isSmoke };
                carScene.add(pMesh);
                explosionParticles.push(pMesh);
            }
        }

        const renderCar = () => {
            requestAnimationFrame(renderCar);
            
            if (carSpeedObj.speed > 5 && !isCinematicSequenceActive) {
                sportsCar.position.y = Math.sin(Date.now() * 0.015) * 0.08; 
            }

            if (carSpeedObj.speed > 0.1 || isCinematicSequenceActive) {
                roadItems.forEach(item => {
                    item.position.z += carSpeedObj.speed * 0.4;
                    if (item.position.z > 100) item.position.z -= 400;
                });
                carWheels.forEach(w => w.rotation.x += carSpeedObj.speed * 0.08);
            }

            for (let i = explosionParticles.length - 1; i >= 0; i--) {
                let p = explosionParticles[i];
                p.position.x += p.userData.vx;
                p.position.y += p.userData.vy;
                p.position.z += p.userData.vz;
                
                p.userData.vy -= 0.08; 
                p.userData.life -= p.userData.decay;
                
                if (p.userData.isSmoke) {
                    p.scale.setScalar(p.scale.x + 0.02);
                } else {
                    p.scale.setScalar(Math.max(0, p.scale.x - 0.05));
                }
                p.material.opacity = p.userData.life;

                if (p.position.y <= 0.5) {
                    p.position.y = 0.5;
                    p.userData.vy *= -0.3; 
                    p.userData.vx *= 0.8; 
                    p.userData.vz *= 0.8;
                }
                if (p.userData.life <= 0) {
                    carScene.remove(p);
                    explosionParticles.splice(i, 1);
                }
            }

            if (!isCinematicSequenceActive) {
                camTarget.x = sportsCar.position.x;
                camTarget.y = sportsCar.position.y + 1;
                camTarget.z = sportsCar.position.z;
            }

            if (shakeIntensity > 0) {
                activeCarCam.position.x += (Math.random() - 0.5) * shakeIntensity;
                activeCarCam.position.y += (Math.random() - 0.5) * shakeIntensity;
                activeCarCam.position.z += (Math.random() - 0.5) * shakeIntensity;
                shakeIntensity *= 0.9;
                if (shakeIntensity < 0.01) shakeIntensity = 0;
            }

            activeCarCam.lookAt(camTarget.x, camTarget.y, camTarget.z);
            carRenderer.render(carScene, activeCarCam);
        };
        renderCar();

        // =========================================
        // THE FULL DIRECTOR'S TIMELINE
        // =========================================
        function triggerCinematicSequence() {
            if (isCinematicSequenceActive) return;
            isCinematicSequenceActive = true;
            activeCarCamIndex = 0;
            activeCarCam = carCams[activeCarCamIndex];

            if(document.querySelector('.game-controls')) {
                gsap.to('.game-controls', {opacity: 0, duration: 1, pointerEvents: 'none'});
            }

            const tl = gsap.timeline();

            tl.to(carSpeedObj, { speed: 280, duration: 3.5, ease: "power2.in" })
              .to(followCam.position, { y: 2, z: 12, duration: 3.5, ease: "power1.inOut" }, "<")
              
              .to(sportsCar.rotation, { y: Math.PI / 5, duration: 0.7, ease: "power2.out" }, "+=0.2")
              .to(carSpeedObj, { speed: 50, duration: 0.8, ease: "power3.out" }, "<")
              .to(followCam.position, { x: 12, y: 3, z: 15, duration: 1, ease: "power2.out" }, "<")
            .add(() => {
                  carSpeedObj.speed = 0;
                  shakeIntensity = 1.5;
                  triggerExplosion();
                  if(typeof carStartAudio !== 'undefined') carStartAudio.pause();
                  
                  // HIDE ALL HUD & CONTROL BUTTONS INSTANTLY ON IMPACT
                  const gameControls = document.querySelector('.game-controls');
                  if (gameControls) {
                      gsap.to(gameControls, { opacity: 0, duration: 0.4, pointerEvents: 'none' });
                  }
                  const speedBox = document.getElementById('car-speedometer')?.closest('.holo-card');
                  if (speedBox) {
                      gsap.to(speedBox, { opacity: 0, duration: 0.4, pointerEvents: 'none' });
                  }

                  gsap.fromTo(impactFlash, { opacity: 1 }, { opacity: 0, duration: 1.5, ease: "power2.out" });
                  gsap.to(sportsCar.rotation, { z: -Math.PI / 12, duration: 0.5, ease: "bounce.out" });
                  gsap.to(sportsCar.position, { y: 0.5, duration: 0.2 });
              }, "+=0.6")
              .to(camTarget, { x: sportsCar.position.x - 2, y: 1.5, z: sportsCar.position.z, duration: 4, ease: "power1.inOut" }, "+=1.5")
              .to(followCam.position, { x: -8, y: 1.5, z: 4, duration: 5, ease: "power1.inOut" }, "<")
              
              .add(() => {
                  const interiorLight = new THREE.PointLight(0x00E5FF, 2, 8);
                  interiorLight.position.set(0, 3, -1);
                  sportsCar.add(interiorLight);
              }, "+=1")
              .to(doorGroup.rotation, { y: Math.PI / 2.2, duration: 1.5, ease: "power2.inOut" }, "+=0.5") 

              // Boss Character Appears
              .add(() => { heroGroup.visible = true; }, "+=0.5")
              .fromTo(heroGroup.position, { y: -1 }, { y: 0, duration: 1, ease: "power2.out" })
              
              // Character turns to face camera
              .to(heroGroup.rotation, { y: -Math.PI / 8, duration: 1, ease: "power1.inOut" }, "+=0.5")
              
              // Low Angle Hero Shot
              .add(() => {
                  followCam.position.set(-6.5, 0.5, 4.5); 
                  shakeIntensity = 0.05; 
              }, "+=0.2")
              .to(camTarget, { x: -4, y: 3.2, z: 1, duration: 0.5, ease: "power2.out" }) 

              .add(() => showSubtitle("Life doesn't always go the way we planned."), "+=1")
              .add(() => showSubtitle("Sometimes, everything we've built comes crashing down."), "+=4")
              .add(() => {
                  gsap.to(carSun.position, { x: -20, y: 10, z: -20, duration: 5 });
                  gsap.to(carSun, { intensity: 0.3, duration: 5 });
              }, "<")
              .add(() => showSubtitle("But an accident can only damage the car."), "+=4.5")
              .add(() => showSubtitle("It can never destroy the promise you made to yourself."), "+=4")
              
              .to(followCam.position, { x: -5.5, y: 1.5, z: 3, duration: 6, ease: "power1.inOut" }, "<")
              
              .add(() => showSubtitle("You rebuild. You rise.", 2.5), "+=4")
              .add(() => showSubtitle("Because my story doesn't end with a crash...", 3.5), "+=3.5")
              
              .add(() => {
                  cinematicSubtitle.style.fontSize = "clamp(2rem, 5vw, 3.5rem)";
                  cinematicSubtitle.style.color = "#00E5FF";
                  cinematicSubtitle.style.fontWeight = "900";
                  cinematicSubtitle.style.textTransform = "uppercase";
                  showSubtitle("IT STARTS WITH THE COMEBACK.", 6);
              }, "+=4")
              
              .to(impactFlash, { opacity: 1, background: "black", duration: 3, ease: "power1.inOut" }, "+=5");
        }

        const btnCarStart = document.getElementById('btn-car-start');
        const btnCarBoost = document.getElementById('btn-car-boost');
        const btnCarCam = document.getElementById('btn-car-cam');
        const speedometer = document.getElementById('car-speedometer');
        const gearText = document.getElementById('car-gear');
        let cinematicTimer;

        if (btnCarStart) {
            btnCarStart.addEventListener('click', () => {
                if (isCinematicSequenceActive) return; 
                isCarRunning = !isCarRunning;
                
                if (isCarRunning) {
                    gsap.to(carSpeedObj, { speed: 120, duration: 2 });
                    if(typeof carStartAudio !== 'undefined') {
                        carStartAudio.currentTime = 0;
                        carStartAudio.play().catch(err => console.warn(err));
                    }
                    btnCarStart.innerHTML = '<i data-lucide="square"></i> Engine Stop';
                    btnCarStart.style.borderColor = '#ff4d4d';
                    btnCarStart.style.color = '#ff4d4d';
                    
                    cinematicTimer = setTimeout(triggerCinematicSequence, 4000);
                } else {
                    gsap.to(carSpeedObj, { speed: 0, duration: 1 });
                    clearTimeout(cinematicTimer);
                    if(typeof carStartAudio !== 'undefined') carStartAudio.pause();
                    btnCarStart.innerHTML = '<i data-lucide="power"></i> Engine Ignition';
                    btnCarStart.style.borderColor = 'var(--primary-cyan)';
                    btnCarStart.style.color = 'var(--primary-cyan)';
                }
                if (typeof lucide !== 'undefined') lucide.createIcons();
            });
        }

        if (btnCarBoost) {
            btnCarBoost.addEventListener('click', () => {
                if (!isCarRunning || isCinematicSequenceActive) return;
                gsap.to(carSpeedObj, { speed: 240, duration: 1 });
                setTimeout(() => { if (isCarRunning && !isCinematicSequenceActive) gsap.to(carSpeedObj, { speed: 120, duration: 2 }); }, 3000);
            });
        }

        if (btnCarCam) {
            btnCarCam.addEventListener('click', () => {
                if (isCinematicSequenceActive) return; 
                activeCarCamIndex = (activeCarCamIndex + 1) % carCams.length;
                activeCarCam = carCams[activeCarCamIndex];
            });
        }

        setInterval(() => {
            if (speedometer) speedometer.innerHTML = `${Math.round(carSpeedObj.speed)} <span style="font-size: 0.9rem; color: var(--text-muted);">KM/H</span>`;
            if (gearText) {
                const rpm = Math.round(carSpeedObj.speed * 45);
                const gear = carSpeedObj.speed < 5 ? 'N' : carSpeedObj.speed < 40 ? 'D1' : carSpeedObj.speed < 90 ? 'D2' : carSpeedObj.speed < 180 ? 'D3' : 'D4 BOOST';
                gearText.innerText = `${gear} | ${rpm} RPM`;
            }
        }, 100);
    }
    // =========================================
    // PHASE 5: PROCEDURAL 3D TRAIN & CINEMATIC LANDSCAPE
    // =========================================
    const container = document.getElementById('canvas-container');
    if (!container) return;

    // --- 1. SCENE SETUP (Cinematic Daylight/Mountains) ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x87CEEB, 0.004); 
    scene.background = new THREE.Color(0x87CEEB); 

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true; 
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // --- 2. CAMERAS ---
    const cameras = [];
    const sideCam = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    sideCam.position.set(60, 20, 20);
    cameras.push(sideCam);

    const frontCam = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
    frontCam.position.set(0, 5, 40);
    cameras.push(frontCam);

    const wideCam = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    wideCam.position.set(-50, 40, 60);
    cameras.push(wideCam);

    let activeCameraIndex = 0;
    let camera = cameras[activeCameraIndex];

    // --- 3. CINEMATIC LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5b6, 1.2); 
    sunLight.position.set(-100, 100, -50);
    sunLight.castShadow = true;
    sunLight.shadow.camera.left = -100;
    sunLight.shadow.camera.right = 100;
    sunLight.shadow.camera.top = 100;
    sunLight.shadow.camera.bottom = -100;
    scene.add(sunLight);

    // --- 4. PROCEDURAL ENVIRONMENT ---
    const envGroup = new THREE.Group();
    scene.add(envGroup);
    
    const sceneryObjects = []; 

    const groundGeo = new THREE.PlaneGeometry(500, 1000);
    const groundMat = new THREE.MeshPhongMaterial({ color: 0x2d4c1e, flatShading: true }); 
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    scene.add(ground);

    const riverGeo = new THREE.PlaneGeometry(100, 1000);
    const riverMat = new THREE.MeshPhongMaterial({ color: 0x1a4359, transparent: true, opacity: 0.8, shininess: 100 });
    const river = new THREE.Mesh(riverGeo, riverMat);
    river.rotation.x = -Math.PI / 2;
    river.position.set(-80, -0.4, 0); 
    scene.add(river);

    const trackMat = new THREE.MeshPhongMaterial({ color: 0x555555 });
    const trackGeo = new THREE.BoxGeometry(0.5, 0.5, 1000);
    const track1 = new THREE.Mesh(trackGeo, trackMat); track1.position.set(-4, 0, 0); scene.add(track1);
    const track2 = new THREE.Mesh(trackGeo, trackMat); track2.position.set(4, 0, 0); scene.add(track2);

    const sleeperGeo = new THREE.BoxGeometry(10, 0.4, 1);
    const sleeperMat = new THREE.MeshPhongMaterial({ color: 0x3d2314 });
    const sleepers = [];
    for (let i = -100; i < 50; i++) {
        const s = new THREE.Mesh(sleeperGeo, sleeperMat);
        s.position.set(0, -0.2, i * 4);
        s.receiveShadow = true;
        envGroup.add(s);
        sleepers.push(s);
    }

    const mountGeo = new THREE.ConeGeometry(30, 50, 5); 
    const mountMat = new THREE.MeshPhongMaterial({ color: 0xdddddd, flatShading: true }); 
    const treeGeo = new THREE.ConeGeometry(3, 10, 4);
    const treeMat = new THREE.MeshPhongMaterial({ color: 0x183310, flatShading: true }); 

    for(let i=0; i<30; i++) {
        const mountain = new THREE.Mesh(mountGeo, mountMat);
        mountain.position.set(Math.random() * 100 + 40, 20, Math.random() * -600 + 100);
        mountain.rotation.y = Math.random() * Math.PI;
        mountain.castShadow = true;
        envGroup.add(mountain);
        sceneryObjects.push(mountain);

        const tree1 = new THREE.Mesh(treeGeo, treeMat);
        tree1.position.set(Math.random() * -30 - 15, 5, Math.random() * -600 + 100);
        tree1.castShadow = true;
        envGroup.add(tree1);
        sceneryObjects.push(tree1);

        const tree2 = new THREE.Mesh(treeGeo, treeMat);
        tree2.position.set(Math.random() * 20 + 15, 5, Math.random() * -600 + 100);
        tree2.castShadow = true;
        envGroup.add(tree2);
        sceneryObjects.push(tree2);
    }

    // --- 5. PROCEDURAL TRAIN (Engine + Coaches) ---
    const train = new THREE.Group();
    scene.add(train);
    const allWheels = []; 

    const engineMat = new THREE.MeshPhongMaterial({ color: 0xb30000, shininess: 80 }); 
    const stripeMat = new THREE.MeshPhongMaterial({ color: 0xffd700 }); 
    const coachMat = new THREE.MeshPhongMaterial({ color: 0xd9d9d9, shininess: 50 }); 
    const coachStripeMat = new THREE.MeshPhongMaterial({ color: 0xb30000 }); 
    const windowMat = new THREE.MeshPhongMaterial({ color: 0x111111, shininess: 100 }); 
    const wheelMat = new THREE.MeshPhongMaterial({ color: 0x222222 });

    const wheelGeo = new THREE.CylinderGeometry(1.5, 1.5, 1, 16);
    wheelGeo.rotateZ(Math.PI / 2);

    function addWheelsToGroup(group) {
        const positions = [
            [-4, 1.5, 7], [4, 1.5, 7], 
            [-4, 1.5, 0], [4, 1.5, 0], 
            [-4, 1.5, -7], [4, 1.5, -7]
        ];
        positions.forEach(pos => {
            const w = new THREE.Mesh(wheelGeo, wheelMat);
            w.position.set(...pos);
            w.castShadow = true;
            group.add(w);
            allWheels.push(w);
        });
    }

    const engineGroup = new THREE.Group();
    engineGroup.position.set(0, 0, 0); 
    train.add(engineGroup);

    const engineBody = new THREE.Mesh(new THREE.BoxGeometry(6, 8, 20), engineMat);
    engineBody.position.set(0, 5, 0);
    engineBody.castShadow = true;
    engineGroup.add(engineBody);

    const engineCabin = new THREE.Mesh(new THREE.BoxGeometry(6.2, 4, 8), engineMat);
    engineCabin.position.set(0, 11, -4);
    engineCabin.castShadow = true;
    engineGroup.add(engineCabin);

    const engineStripe = new THREE.Mesh(new THREE.BoxGeometry(6.3, 0.8, 20), stripeMat);
    engineStripe.position.set(0, 3, 0);
    engineGroup.add(engineStripe);

    const engineGlass = new THREE.Mesh(new THREE.BoxGeometry(6.4, 2.5, 7.8), windowMat);
    engineGlass.position.set(0, 11, -4);
    engineGroup.add(engineGlass);
    
    addWheelsToGroup(engineGroup);

    const coachCount = 4;
    const coachLength = 20;
    const spacing = 2.5;

    for (let i = 0; i < coachCount; i++) {
        const coachGroup = new THREE.Group();
        const zPos = -(coachLength / 2) - 10 - i * (coachLength + spacing); 
        coachGroup.position.set(0, 0, zPos);
        train.add(coachGroup);

        const coachBody = new THREE.Mesh(new THREE.BoxGeometry(6, 8, coachLength), coachMat);
        coachBody.position.set(0, 5, 0);
        coachBody.castShadow = true;
        coachGroup.add(coachBody);

        const coachStripe = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.8, coachLength), coachStripeMat);
        coachStripe.position.set(0, 3, 0);
        coachGroup.add(coachStripe);

        const coachWindows = new THREE.Mesh(new THREE.BoxGeometry(6.3, 2, coachLength * 0.8), windowMat);
        coachWindows.position.set(0, 6.5, 0);
        coachGroup.add(coachWindows);

        const connector = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, spacing), wheelMat);
        connector.rotation.x = Math.PI / 2;
        connector.position.set(0, 4, coachLength / 2 + spacing / 2);
        coachGroup.add(connector);

        addWheelsToGroup(coachGroup);
    }

    // --- 6. PHYSICS & ANIMATION LOGIC ---
    let speed = 0;
    let targetSpeed = 0;
    let isMoving = false;

    const animate = () => {
        requestAnimationFrame(animate);

        speed += (targetSpeed - speed) * 0.015;

        if (speed > 0.1) {
            sleepers.forEach(s => {
                s.position.z += speed * 0.5;
                if (s.position.z > 100) s.position.z -= 400; 
            });

            sceneryObjects.forEach(obj => {
                obj.position.z += speed * 0.5;
                if (obj.position.z > 150) {
                    obj.position.z -= 700; 
                    if (obj.geometry.type === "ConeGeometry" && obj.position.x > 0) {
                        obj.position.x = Math.random() * 100 + 40; 
                    }
                }
            });

            allWheels.forEach(w => w.rotation.x += speed * 0.1);
        }

        if (activeCameraIndex === 0) { 
            camera.lookAt(train.position.x, train.position.y, train.position.z - 40); 
        } else if (activeCameraIndex === 1) { 
            camera.lookAt(train.position.x, train.position.y + 5, train.position.z - 20);
        } else if (activeCameraIndex === 2) { 
            camera.lookAt(train.position.x, train.position.y, train.position.z - 40);
        }

        renderer.render(scene, camera);
    };
    animate();

    // --- 7. UI CONTROLS, STORYTELLING & INTERACTION ---
    const btnStart = document.getElementById('btn-train-start');
    const btnCam = document.getElementById('btn-cam');
    const speedText = document.getElementById('speedometer');
    const uiLayer = document.querySelector('.game-ui-layer');
    const storyElement = document.getElementById('train-story-text');

    // Cinematic Story Script
    let storyIndex = 0;
    let storyTimeout;
    const storyLines = [
        "Every journey begins with a spark of curiosity...",
        "Laying the foundations at Jalpaiguri Government Engineering College.",
        "Engineering robust data systems for the Government of India (VECC).",
        "Exploring Neural Networks, Algorithms, and Deep Tech.",
        "Because the journey of a true engineer never stops."
    ];

    const playCinematicStory = () => {
        if (!storyElement) return;
        storyIndex = 0;
        clearTimeout(storyTimeout);

        const showNextLine = () => {
            if (storyIndex >= storyLines.length || !isMoving) {
                storyElement.classList.remove('story-visible');
                return;
            }
            
            storyElement.innerText = storyLines[storyIndex];
            storyElement.classList.add('story-visible');
            
            storyTimeout = setTimeout(() => {
                storyElement.classList.remove('story-visible');
                storyIndex++;
                if (isMoving && storyIndex < storyLines.length) {
                    storyTimeout = setTimeout(showNextLine, 1500); 
                }
            }, 4000); 
        };
        
        showNextLine();
    };

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.create({
            trigger: '#scene-3d-environments',
            start: "top 40%", 
            onEnter: () => {
                uiLayer.classList.add('is-visible');
                if (!isMoving && btnStart) btnStart.click(); 
            },
            onLeaveBack: () => {
                uiLayer.classList.remove('is-visible');
                if (isMoving && btnStart) btnStart.click();
            }
        });
    } else {
        uiLayer.classList.add('is-visible');
    }

    if (btnStart) {
        btnStart.addEventListener('click', () => {
            isMoving = !isMoving;
            if (isMoving) {
                targetSpeed = 120; 
                btnStart.innerHTML = '<i data-lucide="square"></i> Stop Engine';
                btnStart.style.borderColor = '#ff4d4d';
                btnStart.style.color = '#ff4d4d';
                playCinematicStory();
            } else {
                targetSpeed = 0;
                btnStart.innerHTML = '<i data-lucide="play"></i> Start Engine';
                btnStart.style.borderColor = 'var(--primary-cyan)';
                btnStart.style.color = 'var(--primary-cyan)';
                clearTimeout(storyTimeout);
                if (storyElement) storyElement.classList.remove('story-visible');
            }
            if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
                lucide.createIcons();
            }
        });
    }

    if (btnCam) {
        btnCam.addEventListener('click', () => {
            activeCameraIndex = (activeCameraIndex + 1) % cameras.length;
            camera = cameras[activeCameraIndex];
        });
    }

    setInterval(() => {
        if (speedText) speedText.innerHTML = `${Math.round(speed)} <span style="font-size: 1rem; color: var(--text-muted);">km/h</span>`;
    }, 100);

    window.addEventListener('resize', () => {
        cameras.forEach(cam => {
            cam.aspect = window.innerWidth / window.innerHeight;
            cam.updateProjectionMatrix();
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});