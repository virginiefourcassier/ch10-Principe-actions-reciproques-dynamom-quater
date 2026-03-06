(() => {
  "use strict";

  const canvas = document.getElementById("c");
  const ctx = canvas.getContext("2d");

  const handL = document.getElementById("handL");
  const handR = document.getElementById("handR");

  const W = canvas.width;
  const H = canvas.height;

  // Contraintes reprises du HTML original Vascak
  const minVzdalenost = 308;
  const maxVzdalenost = minVzdalenost + 200;
  const vlevo = 20;
  const vpravo = W - 40;
  const nahore = 20;
  const dole = H - 40;

  // Images
  const scaleImg = new Image();
  scaleImg.src = "scale_center.png";

  // Poignées (centres des pastilles)
  const p1 = { x: 110, y: 200 }; // gauche
  const p2 = { x: 530, y: 200 }; // droite

  // Décalages visuels entre centre de la pastille et point d'accroche main
  // Ajustés pour vos PNG actuels
  const leftAnchor = { x: 173, y: 156 };
  const rightAnchor = { x: 48, y: 148 };

  let drag = null;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  function dist(ax, ay, bx, by) {
    return Math.hypot(ax - bx, ay - by);
  }

  function angleBetween(a, b) {
    return Math.atan2(b.y - a.y, b.x - a.x);
  }

  function setCursor(hitLeft, hitRight) {
    canvas.style.cursor = (hitLeft || hitRight) ? "pointer" : "default";
  }

  function hitHandle(mx, my, p, r = 22) {
    return dist(mx, my, p.x, p.y) <= r;
  }

  function getMouse(evt) {
    const r = canvas.getBoundingClientRect();
    return {
      x: (evt.clientX - r.left) * (canvas.width / r.width),
      y: (evt.clientY - r.top) * (canvas.height / r.height),
    };
  }

  function enforceByDraggingLeft() {
    const d = dist(p1.x, p1.y, p2.x, p2.y);

    if (d < minVzdalenost) {
      const a = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      p1.x = p2.x - Math.cos(a) * minVzdalenost;
      p1.y = p2.y - Math.sin(a) * minVzdalenost;
    } else if (d > maxVzdalenost) {
      const a = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      p1.x = p2.x - Math.cos(a) * maxVzdalenost;
      p1.y = p2.y - Math.sin(a) * maxVzdalenost;
    }

    p1.x = clamp(p1.x, vlevo, vpravo);
    p1.y = clamp(p1.y, nahore, dole);
  }

  function enforceByDraggingRight() {
    const d = dist(p1.x, p1.y, p2.x, p2.y);

    if (d < minVzdalenost) {
      const a = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      p2.x = p1.x + Math.cos(a) * minVzdalenost;
      p2.y = p1.y + Math.sin(a) * minVzdalenost;
    } else if (d > maxVzdalenost) {
      const a = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      p2.x = p1.x + Math.cos(a) * maxVzdalenost;
      p2.y = p1.y + Math.sin(a) * maxVzdalenost;
    }

    p2.x = clamp(p2.x, vlevo, vpravo);
    p2.y = clamp(p2.y, nahore, dole);
  }

  function enforceGlobalAfterClamp() {
    const d = dist(p1.x, p1.y, p2.x, p2.y);
    const a = angleBetween(p1, p2);

    if (d < minVzdalenost) {
      p2.x = p1.x + Math.cos(a) * minVzdalenost;
      p2.y = p1.y + Math.sin(a) * minVzdalenost;
    } else if (d > maxVzdalenost) {
      p2.x = p1.x + Math.cos(a) * maxVzdalenost;
      p2.y = p1.y + Math.sin(a) * maxVzdalenost;
    }
  }

  canvas.addEventListener("mousemove", (evt) => {
    const m = getMouse(evt);

    if (!drag) {
      setCursor(hitHandle(m.x, m.y, p1), hitHandle(m.x, m.y, p2));
      return;
    }

    if (drag === "left") {
      p1.x = clamp(m.x - dragOffsetX, vlevo, vpravo);
      p1.y = clamp(m.y - dragOffsetY, nahore, dole);
      enforceByDraggingLeft();
      enforceGlobalAfterClamp();
    }

    if (drag === "right") {
      p2.x = clamp(m.x - dragOffsetX, vlevo, vpravo);
      p2.y = clamp(m.y - dragOffsetY, nahore, dole);
      enforceByDraggingRight();
      enforceGlobalAfterClamp();
    }
  });

  canvas.addEventListener("mousedown", (evt) => {
    const m = getMouse(evt);

    if (hitHandle(m.x, m.y, p1)) {
      drag = "left";
      dragOffsetX = m.x - p1.x;
      dragOffsetY = m.y - p1.y;
      return;
    }

    if (hitHandle(m.x, m.y, p2)) {
      drag = "right";
      dragOffsetX = m.x - p2.x;
      dragOffsetY = m.y - p2.y;
    }
  });

  window.addEventListener("mouseup", () => {
    drag = null;
  });

  // ---------- Dessin ----------
  function drawPastille(x, y, colorA, colorB, outerStroke) {
    const g = ctx.createRadialGradient(x - 5, y - 5, 3, x, y, 24);
    g.addColorStop(0, colorA);
    g.addColorStop(1, colorB);

    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();

    ctx.lineWidth = 4;
    ctx.strokeStyle = outerStroke;
    ctx.stroke();
  }

  function drawRing(x, y, angle, side) {
    const offset = side === "left" ? 18 : -18;
    const rx = x + Math.cos(angle) * offset;
    const ry = y + Math.sin(angle) * offset;

    ctx.save();
    ctx.translate(rx, ry);
    ctx.rotate(angle);

    // anneau métal
    const grad = ctx.createLinearGradient(-14, 0, 14, 0);
    grad.addColorStop(0, "#666");
    grad.addColorStop(0.2, "#dedede");
    grad.addColorStop(0.5, "#ffffff");
    grad.addColorStop(0.8, "#a7a7a7");
    grad.addColorStop(1, "#555");

    ctx.beginPath();
    ctx.ellipse(0, 0, 12, 16, 0, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#444";
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 12, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#efefef";
    ctx.fill();
    ctx.strokeStyle = "#7a7a7a";
    ctx.stroke();

    ctx.restore();
  }

  function drawHook(x, y, angle, side) {
    const dir = side === "left" ? 1 : -1;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.strokeStyle = "#4b4b4b";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(16 * dir, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(21 * dir, 0, 9, Math.PI * 0.2 * dir, Math.PI * 1.5 * dir, dir < 0);
    ctx.stroke();

    ctx.restore();
  }

  function drawBody(cx, cy, angle, lengthPx, label) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    const w = lengthPx;
    const h = 28;

    const bodyGrad = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
    bodyGrad.addColorStop(0, "#141414");
    bodyGrad.addColorStop(0.25, "#7c7c7c");
    bodyGrad.addColorStop(0.5, "#3b3b3b");
    bodyGrad.addColorStop(0.75, "#1d1d1d");
    bodyGrad.addColorStop(1, "#060606");

    ctx.fillStyle = bodyGrad;
    ctx.fillRect(-w / 2, -h / 2, w, h);

    // petites butées
    ctx.fillStyle = "#515151";
    ctx.fillRect(-w / 2 - 4, -17, 8, 34);
    ctx.fillRect(w / 2 - 4, -17, 8, 34);

    ctx.strokeStyle = "#1e1e1e";
    ctx.lineWidth = 1;
    ctx.strokeRect(-w / 2, -h / 2, w, h);

    ctx.fillStyle = "#f1f1f1";
    ctx.font = "bold 15px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, 0, 0);

    ctx.restore();
  }

  function drawCenterScale(x1, y1, x2, y2, angle) {
    if (!scaleImg.complete || !scaleImg.naturalWidth) return;

    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;

    const d = dist(x1, y1, x2, y2);

    // largeur des deux corps noirs + anneaux/hameçons ≈ 244 px
    // on garde seulement l’espace central
    const targetWidth = Math.max(90, d - 244);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    const drawW = targetWidth;
    const drawH = Math.round(scaleImg.naturalHeight * (drawW / scaleImg.naturalWidth));

    ctx.drawImage(scaleImg, -drawW / 2, -drawH / 2, drawW, drawH);

    ctx.restore();
  }

  function updateHands(angle) {
    // main gauche
    const leftX = p1.x - leftAnchor.x;
    const leftY = p1.y - leftAnchor.y;
    handL.style.left = `${leftX}px`;
    handL.style.top = `${leftY}px`;
    handL.style.transform = `rotate(${angle}rad)`;

    // main droite
    const rightX = p2.x - rightAnchor.x;
    const rightY = p2.y - rightAnchor.y;
    handR.style.left = `${rightX}px`;
    handR.style.top = `${rightY}px`;
    handR.style.transform = `rotate(${angle}rad)`;
  }

  function drawScene() {
    ctx.clearRect(0, 0, W, H);

    const a = angleBetween(p1, p2);

    // positions utiles
    const leftRingX = p1.x + Math.cos(a) * 18;
    const leftRingY = p1.y + Math.sin(a) * 18;

    const rightRingX = p2.x - Math.cos(a) * 18;
    const rightRingY = p2.y - Math.sin(a) * 18;

    // corps gauche et droit
    const leftBodyCenter = {
      x: leftRingX + Math.cos(a) * 75,
      y: leftRingY + Math.sin(a) * 75
    };

    const rightBodyCenter = {
      x: rightRingX - Math.cos(a) * 75,
      y: rightRingY - Math.sin(a) * 75
    };

    const leftHookBase = {
      x: leftBodyCenter.x + Math.cos(a) * 64,
      y: leftBodyCenter.y + Math.sin(a) * 64
    };

    const rightHookBase = {
      x: rightBodyCenter.x - Math.cos(a) * 64,
      y: rightBodyCenter.y - Math.sin(a) * 64
    };

    // centre
    drawCenterScale(leftHookBase.x, leftHookBase.y, rightHookBase.x, rightHookBase.y, a);

    // crochets centraux
    drawHook(leftHookBase.x, leftHookBase.y, a, "left");
    drawHook(rightHookBase.x, rightHookBase.y, a, "right");

    // corps noirs
    drawBody(leftBodyCenter.x, leftBodyCenter.y, a, 120, "10 N");
    drawBody(rightBodyCenter.x, rightBodyCenter.y, a, 120, "10 N");

    // anneaux latéraux
    drawRing(p1.x, p1.y, a, "left");
    drawRing(p2.x, p2.y, a, "right");

    // poignées
    drawPastille(p1.x, p1.y, "#ffdede", "#ff1f1f", "#ff2b2b");
    drawPastille(p2.x, p2.y, "#dff5ff", "#112dff", "#1186ff");

    updateHands(a);

    requestAnimationFrame(drawScene);
  }

  function startWhenReady() {
    drawScene();
  }

  if (scaleImg.complete) {
    startWhenReady();
  } else {
    scaleImg.onload = startWhenReady;
    scaleImg.onerror = startWhenReady;
  }
})();
