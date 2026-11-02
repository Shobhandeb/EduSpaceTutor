// =========================================
// PHASE 5 & 7: PROCEDURAL 3D ENVIRONMENTS
// =========================================

document.addEventListener('DOMContentLoaded', () => {

    // =========================================
    // PHASE 7: 3D SPORTS CAR (HIGHWAY OF AMBITION)
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

        // Road Markings & Light Posts
        const roadGroup = new THREE.Group();
        carScene.add(roadGroup);

        const stripeGeo = new THREE.BoxGeometry(0.6, 0.1, 6);
        const stripeMat = new THREE.MeshBasicMaterial({ color: 0x00E5FF });
        const lightPostMat = new THREE.MeshBasicMaterial({ color: 0x8B5CF6 });

        const roadItems = [];
        for (let i = -50; i < 50; i++) {
            // Lane stripes (MATH OPERATOR FIXED)
            const stripe = new THREE.Mesh(stripeGeo, stripeMat);
            stripe.position.set(0, 0.05, i * 15);
            roadGroup.add(stripe);
            roadItems.push(stripe);

            // Side light posts (MATH OPERATOR FIXED)
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

        // Chassis
        const chassis = new THREE.Mesh(new THREE.BoxGeometry(5.5, 1.8, 12), carBodyMat);
        chassis.position.set(0, 1.5, 0);
        sportsCar.add(chassis);

        // Cabin
        const cabin = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.4, 6), carBodyMat);
        cabin.position.set(0, 3, -1);
        sportsCar.add(cabin);

        // Headlights
        const headlightL = new THREE.Mesh(new THREE.BoxGeometry(1, 0.4, 0.2), carGlowMat);
        headlightL.position.set(-1.8, 1.6, 6);
        sportsCar.add(headlightL);

        const headlightR = headlightL.clone();
        headlightR.position.x = 1.8;
        sportsCar.add(headlightR);

        // Wheels
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

        // Car Driving Physics & UI
        let carSpeed = 0;
        let carTargetSpeed = 0;
        let isCarRunning = false;

        const renderCar = () => {
            requestAnimationFrame(renderCar);
            
            // MATH OPERATORS FIXED (-) and (*)
            carSpeed += (carTargetSpeed - carSpeed) * 0.03;

            if (carSpeed > 0.1) {
                roadItems.forEach(item => {
                    // MATH OPERATOR FIXED (*)
                    item.position.z += carSpeed * 0.4;
                    if (item.position.z > 100) item.position.z -= 400;
                });
                // MATH OPERATOR FIXED (*)
                carWheels.forEach(w => w.rotation.x += carSpeed * 0.08);
            }

            activeCarCam.lookAt(sportsCar.position.x, sportsCar.position.y + 1, sportsCar.position.z);
            carRenderer.render(carScene, activeCarCam);
        };
        renderCar();

        // Control Bindings
        const btnCarStart = document.getElementById('btn-car-start');
        const btnCarBoost = document.getElementById('btn-car-boost');
        const btnCarCam = document.getElementById('btn-car-cam');
        const speedometer = document.getElementById('car-speedometer');
        const gearText = document.getElementById('car-gear');

        if (btnCarStart) {
            btnCarStart.addEventListener('click', () => {
                isCarRunning = !isCarRunning;
                carTargetSpeed = isCarRunning ? 140 : 0;
                btnCarStart.innerHTML = isCarRunning ? '<i data-lucide="square"></i> Engine Stop' : '<i data-lucide="power"></i> Engine Ignition';
                btnCarStart.style.borderColor = isCarRunning ? '#ff4d4d' : 'var(--primary-cyan)';
                btnCarStart.style.color = isCarRunning ? '#ff4d4d' : 'var(--primary-cyan)';
                lucide.createIcons();
            });
        }

        if (btnCarBoost) {
            btnCarBoost.addEventListener('click', () => {
                if (!isCarRunning) return;
                carTargetSpeed = 240;
                setTimeout(() => { if (isCarRunning) carTargetSpeed = 140; }, 3000);
            });
        }

        if (btnCarCam) {
            btnCarCam.addEventListener('click', () => {
                activeCarCamIndex = (activeCarCamIndex + 1) % carCams.length;
                activeCarCam = carCams[activeCarCamIndex];
            });
        }

        setInterval(() => {
            if (speedometer) speedometer.innerHTML = `${Math.round(carSpeed)} <span style="font-size: 0.9rem; color: var(--text-muted);">KM/H</span>`;
            if (gearText) {
                // MATH OPERATOR FIXED (*)
                const rpm = Math.round(carSpeed * 45);
                const gear = carSpeed < 5 ? 'N' : carSpeed < 40 ? 'D1' : carSpeed < 90 ? 'D2' : carSpeed < 180 ? 'D3' : 'D4 BOOST';
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
        // MATH OPERATOR FIXED (*)
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
        // MATH OPERATORS FIXED (-)
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
        // MATH OPERATORS FIXED (-) and (*)
        const zPos = - (coachLength/2) - 10 - (i * (coachLength + spacing)); 
        coachGroup.position.set(0, 0, zPos);
        train.add(coachGroup);

        const coachBody = new THREE.Mesh(new THREE.BoxGeometry(6, 8, coachLength), coachMat);
        coachBody.position.set(0, 5, 0);
        coachBody.castShadow = true;
        coachGroup.add(coachBody);

        const coachStripe = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.8, coachLength), coachStripeMat);
        coachStripe.position.set(0, 3, 0);
        coachGroup.add(coachStripe);

        // MATH OPERATOR FIXED (*)
        const coachWindows = new THREE.Mesh(new THREE.BoxGeometry(6.3, 2, coachLength * 0.8), windowMat);
        coachWindows.position.set(0, 6.5, 0);
        coachGroup.add(coachWindows);

        const connector = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, spacing), wheelMat);
        connector.rotation.x = Math.PI / 2;
        connector.position.set(0, 4, coachLength/2 + spacing/2);
        coachGroup.add(connector);

        addWheelsToGroup(coachGroup);
    }

    // --- 6. PHYSICS & ANIMATION LOGIC ---
    let speed = 0;
    let targetSpeed = 0;
    let isMoving = false;

    const animate = () => {
        requestAnimationFrame(animate);

        // MATH OPERATORS FIXED (-) and (*)
        speed += (targetSpeed - speed) * 0.015;

        if (speed > 0.1) {
            sleepers.forEach(s => {
                // MATH OPERATOR FIXED (*)
                s.position.z += speed * 0.5;
                if (s.position.z > 100) s.position.z -= 400; 
            });

            sceneryObjects.forEach(obj => {
                // MATH OPERATOR FIXED (*)
                obj.position.z += speed * 0.5;
                if (obj.position.z > 150) {
                    obj.position.z -= 700; 
                    if (obj.geometry.type === "ConeGeometry" && obj.position.x > 0) {
                        obj.position.x = Math.random() * 100 + 40; 
                    }
                }
            });

            // MATH OPERATOR FIXED (*)
            allWheels.forEach(w => w.rotation.x += speed * 0.1);
        }

        // MATH OPERATORS FIXED (-)
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
            lucide.createIcons();
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