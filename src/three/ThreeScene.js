import * as THREE from 'three';

const AVATAR_COLORS = [
  '#E07A5F', '#81B29A', '#F2CC8F', '#D4726A',
  '#7EB5D6', '#C49BBB', '#E8A87C', '#85C1E9',
];

class PlayerCharacter {
  constructor(color, index) {
    this.group = new THREE.Group();
    this.index = index;
    this.color = color;
    this.alive = true;
    this.speaking = false;
    this.eliminated = false;
    this._baseY = 0;
    this._time = Math.random() * Math.PI * 2;

    const mat = new THREE.MeshStandardMaterial({ color });
    const matLight = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.25),
    });

    // Chair
    const chairSeat = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.08, 0.45),
      new THREE.MeshStandardMaterial({ color: '#B8ADA3' }),
    );
    chairSeat.position.y = 0.35;
    chairSeat.castShadow = true;
    this.group.add(chairSeat);

    const chairBack = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.4, 0.08),
      new THREE.MeshStandardMaterial({ color: '#B8ADA3' }),
    );
    chairBack.position.set(0, 0.55, -0.19);
    chairBack.castShadow = true;
    this.group.add(chairBack);

    for (let lx = -1; lx <= 1; lx += 2) {
      for (let lz = -1; lz <= 1; lz += 2) {
        const leg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.025, 0.025, 0.35, 6),
          new THREE.MeshStandardMaterial({ color: '#8B7E74' }),
        );
        leg.position.set(lx * 0.17, 0.175, lz * 0.17);
        this.group.add(leg);
      }
    }

    // Body
    this.bodyGroup = new THREE.Group();
    const bodyH = 0.4;
    const bodyR = 0.2;
    const bodyCyl = new THREE.Mesh(
      new THREE.CylinderGeometry(bodyR, bodyR * 0.9, bodyH, 12),
      mat,
    );
    bodyCyl.position.y = 0;
    bodyCyl.castShadow = true;
    this.bodyGroup.add(bodyCyl);

    const bodyTop = new THREE.Mesh(
      new THREE.SphereGeometry(bodyR, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      mat,
    );
    bodyTop.position.y = bodyH / 2;
    this.bodyGroup.add(bodyTop);

    const bodyBot = new THREE.Mesh(
      new THREE.SphereGeometry(bodyR * 0.9, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
      mat,
    );
    bodyBot.position.y = -bodyH / 2;
    this.bodyGroup.add(bodyBot);
    this.bodyGroup.position.y = 0.6;
    this.group.add(this.bodyGroup);

    // Head
    this.head = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 12),
      matLight,
    );
    this.head.position.y = 1.02;
    this.head.castShadow = true;
    this.group.add(this.head);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.04, 8, 6);
    const eyeWhite = new THREE.MeshStandardMaterial({ color: '#ffffff' });
    const eyeBlack = new THREE.MeshStandardMaterial({ color: '#2d2520' });
    const pupilGeo = new THREE.SphereGeometry(0.022, 6, 4);
    for (let side = -1; side <= 1; side += 2) {
      const eye = new THREE.Mesh(eyeGeo, eyeWhite);
      eye.position.set(side * 0.07, 1.05, 0.15);
      this.group.add(eye);
      const pupil = new THREE.Mesh(pupilGeo, eyeBlack);
      pupil.position.set(side * 0.07, 1.05, 0.18);
      this.group.add(pupil);
    }

    // Speaking indicator
    this.speakBubble = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 12, 8),
      new THREE.MeshStandardMaterial({
        color: '#F2CC8F',
        emissive: '#F2CC8F',
        emissiveIntensity: 0.5,
      }),
    );
    this.speakBubble.position.y = 1.35;
    this.speakBubble.visible = false;
    this.group.add(this.speakBubble);

    // Vote hand
    this.voteHand = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 8, 6),
      mat,
    );
    this.voteHand.position.set(0.3, 1.05, 0);
    this.voteHand.visible = false;
    this.group.add(this.voteHand);
  }

  setPosition(x, z, angle) {
    this.group.position.set(x, 0, z);
    this.group.rotation.y = angle + Math.PI;
    this._baseY = 0;
  }

  setSpeaking(val) {
    this.speaking = val;
    this.speakBubble.visible = val;
  }

  setVoted(val) {
    this.voteHand.visible = val;
  }

  setEliminated(val) {
    this.eliminated = val;
    this.alive = !val;
    this.group.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.transparent = true;
        child.material.opacity = val ? 0.3 : 1.0;
      }
    });
    this.group.rotation.x = val ? 0.25 : 0;
  }

  update(dt) {
    this._time += dt;
    if (this.alive) {
      const bobAmp = this.speaking ? 0.08 : 0.03;
      const bobSpeed = this.speaking ? 4.0 : 1.5;
      this.group.position.y = this._baseY + Math.sin(this._time * bobSpeed) * bobAmp;
      if (this.speaking) {
        const s = 1.0 + Math.sin(this._time * 5) * 0.3;
        this.speakBubble.scale.set(s, s, s);
      }
    }
    if (this.voteHand.visible) {
      this.voteHand.position.y = 1.05 + Math.sin(this._time * 2) * 0.05;
    }
  }

  dispose() {
    this.group.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
        else child.material.dispose();
      }
    });
  }
}

export class ThreeScene {
  constructor() {
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.characters = new Map();
    this._animId = null;
    this._clock = new THREE.Clock();
    this._orbitAngle = 0;
    this._cameraRadius = 8;
    this._cameraHeight = 6;
    this._phase = 'waiting';
    this._status = 'waiting';
    this._playerList = [];
    this._celebrating = false;
    this._particles = null;
  }

  init(container) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#FFF8F0');
    this.scene.fog = new THREE.FogExp2('#FFF8F0', 0.04);

    this.camera = new THREE.PerspectiveCamera(
      50, window.innerWidth / window.innerHeight, 0.1, 100,
    );
    this._updateCameraPosition();

    const ambient = new THREE.AmbientLight('#FFF8F0', 0.7);
    this.scene.add(ambient);

    const dirLight = new THREE.DirectionalLight('#ffffff', 0.8);
    dirLight.position.set(4, 8, 4);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 20;
    dirLight.shadow.camera.left = -6;
    dirLight.shadow.camera.right = 6;
    dirLight.shadow.camera.top = 6;
    dirLight.shadow.camera.bottom = -6;
    this.scene.add(dirLight);

    this._buildFloor();
    this._buildTable();
    this._buildLamp();
    this._buildParticles();

    this._onResize = () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', this._onResize);

    this._animate();
  }

  _buildFloor() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const tileSize = 32;
    for (let x = 0; x < 512; x += tileSize) {
      for (let y = 0; y < 512; y += tileSize) {
        const ix = x / tileSize;
        const iy = y / tileSize;
        ctx.fillStyle = (ix + iy) % 2 === 0 ? '#E8DDD1' : '#DDD2C5';
        ctx.fillRect(x, y, tileSize, tileSize);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 3);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(8, 48),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, metalness: 0 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);
  }

  _buildTable() {
    const tableGroup = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: '#8B7E74', roughness: 0.7 });
    const topMat = new THREE.MeshStandardMaterial({ color: '#A09488', roughness: 0.5 });

    const top = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.12, 32), topMat);
    top.position.y = 0.85;
    top.castShadow = true;
    top.receiveShadow = true;
    tableGroup.add(top);

    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(2.2, 0.04, 8, 48),
      woodMat,
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.85;
    tableGroup.add(rim);

    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.08, 0.85, 8),
        woodMat,
      );
      leg.position.set(Math.cos(angle) * 1.5, 0.425, Math.sin(angle) * 1.5);
      leg.castShadow = true;
      tableGroup.add(leg);
    }

    this.scene.add(tableGroup);
    this._table = tableGroup;
  }

  _buildLamp() {
    const lampGroup = new THREE.Group();

    const cordGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 6, 0),
      new THREE.Vector3(0, 3.8, 0),
    ]);
    const cord = new THREE.Line(cordGeo, new THREE.LineBasicMaterial({ color: '#5C4F43' }));
    lampGroup.add(cord);

    const shade = new THREE.Mesh(
      new THREE.ConeGeometry(0.6, 0.4, 16, 1, true),
      new THREE.MeshStandardMaterial({ color: '#F2CC8F', side: THREE.DoubleSide, roughness: 0.6 }),
    );
    shade.position.y = 3.6;
    shade.castShadow = true;
    lampGroup.add(shade);

    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 8, 6),
      new THREE.MeshStandardMaterial({ color: '#FFF8F0', emissive: '#FFF8F0', emissiveIntensity: 1 }),
    );
    bulb.position.y = 3.45;
    lampGroup.add(bulb);

    const light = new THREE.PointLight('#F2CC8F', 1.2, 12, 1.5);
    light.position.y = 3.4;
    light.castShadow = true;
    light.shadow.mapSize.width = 512;
    light.shadow.mapSize.height = 512;
    lampGroup.add(light);

    this.scene.add(lampGroup);
  }

  _buildParticles() {
    const count = 40;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = Math.random() * 5 + 1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: '#F2CC8F',
      size: 0.06,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
    });
    this._particles = new THREE.Points(geo, mat);
    this.scene.add(this._particles);
  }

  _updateCameraPosition() {
    this.camera.position.set(
      Math.sin(this._orbitAngle) * this._cameraRadius,
      this._cameraHeight,
      Math.cos(this._orbitAngle) * this._cameraRadius,
    );
    this.camera.lookAt(0, 0.8, 0);
  }

  updatePlayers(players) {
    this._playerList = players || [];
    const currentIds = new Set(players.map((p) => p.id));

    for (const [id, char] of this.characters) {
      if (!currentIds.has(id)) {
        this.scene.remove(char.group);
        char.dispose();
        this.characters.delete(id);
      }
    }

    const count = players.length;
    players.forEach((p, i) => {
      let char = this.characters.get(p.id);
      if (!char) {
        const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
        char = new PlayerCharacter(color, i);
        this.characters.set(p.id, char);
        this.scene.add(char.group);
      }
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      const radius = 3.0;
      char.setPosition(Math.cos(angle) * radius, Math.sin(angle) * radius, angle);

      if (!p.alive && char.alive) char.setEliminated(true);
      else if (p.alive && !char.alive) char.setEliminated(false);
    });
  }

  setPhase(phase, status) {
    this._phase = phase;
    this._status = status;
    for (const char of this.characters.values()) {
      char.setSpeaking(false);
      char.setVoted(false);
    }
  }

  setSpeaker(playerId) {
    for (const [id, char] of this.characters) {
      char.setSpeaking(id === playerId);
    }
  }

  setVoted(playerIds) {
    const set = new Set(playerIds);
    for (const [id, char] of this.characters) {
      char.setVoted(set.has(id));
    }
  }

  showResult() {
    this._celebrating = true;
    setTimeout(() => { this._celebrating = false; }, 5000);
  }

  _animate() {
    this._animId = requestAnimationFrame(() => this._animate());
    const dt = this._clock.getDelta();
    const time = this._clock.getElapsedTime();

    this._orbitAngle += 0.0008;
    this._updateCameraPosition();

    for (const char of this.characters.values()) {
      char.update(dt);
    }

    if (this._celebrating) {
      for (const char of this.characters.values()) {
        if (char.alive) {
          char.group.position.y = Math.abs(Math.sin(time * 6 + char.index)) * 0.3;
        }
      }
    }

    if (this._particles) {
      const pos = this._particles.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        pos.array[i * 3 + 1] += dt * 0.15;
        if (pos.array[i * 3 + 1] > 6) pos.array[i * 3 + 1] = 0.5;
      }
      pos.needsUpdate = true;
    }

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    if (this._animId) cancelAnimationFrame(this._animId);
    window.removeEventListener('resize', this._onResize);
    this.characters.forEach((c) => c.dispose());
    this.characters.clear();
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement?.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
  }
}
