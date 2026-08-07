(function(){
  const canvas = document.createElement('canvas');
  canvas.id = 'ginkgo-canvas';
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.zIndex = '4';
  canvas.style.pointerEvents = 'none';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // A ginkgo leaf: an angle-swept fan that widens toward the top, tapers
  // A ginkgo leaf, matched to a real reference: a broad, nearly flat-topped
  // fan (not sharply pointed), a shallow center dip, a scalloped rippled
  // rim, many fine radiating veins, and a visible curved stem below.
  function drawGinkgo(size, rot, alpha, hueTop, hueBase){
    ctx.rotate(rot);

    const SPAN = 152 * Math.PI / 180;  // half-angle the fan sweeps from top-center
    const SEGS = 40;
    const pts = [];

    for (let i = 0; i <= SEGS; i++){
      const a = -SPAN + (i / SEGS) * SPAN * 2; // sweep left -> right across the top

      // flatter fan taper -- broad and wide near the top, not a sharp point
      let r = Math.pow(Math.cos(a / 2), 0.55);

      // shallow center dip splitting the fan into two lobes (subtle, not a deep V)
      r -= 0.10 * Math.exp(-Math.pow(a / 0.18, 2));

      // small repeated scallops around the rim
      r += 0.045 * Math.sin(a * 15);

      r = Math.max(r, 0.05) * size;
      pts.push([Math.sin(a) * r, -Math.cos(a) * r * 0.72]); // flattened vertically, wide fan
    }

    const baseY = size * 0.55; // where the fan meets the stem

    ctx.beginPath();
    ctx.moveTo(0, baseY);
    ctx.lineTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++){
      ctx.lineTo(pts[i][0], pts[i][1]);
    }
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, -size * 0.75, 0, baseY);
    grad.addColorStop(0, `rgba(${hueTop},${alpha})`);
    grad.addColorStop(1, `rgba(${hueBase},${alpha})`);
    ctx.fillStyle = grad;
    ctx.fill();

    // many fine veins radiating from the base -- ginkgo's signature pattern
    ctx.strokeStyle = `rgba(${hueBase},${alpha * 0.55})`;
    ctx.lineWidth = 0.4;
    ctx.beginPath();
    const veinCount = 17;
    for (let v = 0; v <= veinCount; v++){
      const idx = Math.round((v / veinCount) * SEGS);
      const p = pts[Math.min(SEGS, Math.max(0, idx))];
      ctx.moveTo(0, baseY * 0.96);
      ctx.lineTo(p[0] * 0.95, p[1] * 0.95);
    }
    ctx.stroke();

    // curved stem hanging below the fan
    ctx.beginPath();
    ctx.moveTo(0, baseY * 0.9);
    ctx.quadraticCurveTo(size * 0.08, size * 0.95, -size * 0.02, size * 1.5);
    ctx.strokeStyle = `rgba(${hueBase},${alpha})`;
    ctx.lineWidth = size * 0.08;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  const HUE_PAIRS = [
    ['255,221,110', '196,150,42'],
    ['255,229,130', '205,160,50'],
    ['250,208,90', '188,140,36'],
    ['255,224,115', '199,152,44']
  ];

  const LEAF_COUNT = 14;
  const leaves = [];
  for (let i = 0; i < LEAF_COUNT; i++){
    const pair = HUE_PAIRS[Math.floor(Math.random() * HUE_PAIRS.length)];
    leaves.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * -window.innerHeight,
      size: 20 + Math.random() * 18,
      speedY: 0.28 + Math.random() * 0.35,      // gentle fall
      swayAmp: 18 + Math.random() * 26,
      swaySpeed: 0.006 + Math.random() * 0.006,
      swayPhase: Math.random() * Math.PI * 2,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.01,
      alpha: 0.4 + Math.random() * 0.3,
      hueTop: pair[0],
      hueBase: pair[1]
    });
  }

  let frame = 0;
  function draw(){
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    leaves.forEach(l => {
      l.y += l.speedY;
      l.rot += l.rotSpeed;
      const sway = Math.sin(frame * l.swaySpeed + l.swayPhase) * l.swayAmp;

      if (l.y - l.size > canvas.height){
        l.y = -20;
        l.x = Math.random() * canvas.width;
      }

      ctx.save();
      ctx.translate(l.x + sway, l.y);
      drawGinkgo(l.size, l.rot, l.alpha, l.hueTop, l.hueBase);
      ctx.restore();
    });

    requestAnimationFrame(draw);
  }
  draw();
})();
