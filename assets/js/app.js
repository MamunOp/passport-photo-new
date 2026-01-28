(function(){
  const $ = (id) => document.getElementById(id);

  function getParam(name){
    const u = new URL(location.href);
    return u.searchParams.get(name);
  }

  function mmToPx(mm, dpi=300){
    // 1 inch = 25.4 mm
    const inches = mm / 25.4;
    return Math.round(inches * dpi);
  }

  async function blobToKb(blob){
    return Math.round(blob.size / 1024);
  }

  async function canvasToJpegBlob(canvas, quality){
    return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  }

  async function compressToMaxKb(canvas, maxKb){
    // Binary-ish search on jpeg quality
    let lo = 0.35, hi = 0.95;
    let bestBlob = await canvasToJpegBlob(canvas, hi);
    if (!bestBlob) return null;

    for (let i=0; i<10; i++){
      const mid = (lo + hi) / 2;
      const blob = await canvasToJpegBlob(canvas, mid);
      if (!blob) break;
      const kb = await blobToKb(blob);
      if (kb > maxKb){
        hi = mid;
      } else {
        bestBlob = blob;
        lo = mid;
      }
    }
    // If still above maxKb, step down a bit
    let kb = await blobToKb(bestBlob);
    while (kb > maxKb && lo > 0.15){
      lo -= 0.07;
      const b = await canvasToJpegBlob(canvas, Math.max(lo, 0.15));
      if (!b) break;
      bestBlob = b;
      kb = await blobToKb(bestBlob);
    }
    return bestBlob;
  }

  // Only run on tool page
  if (!document.body.dataset.page || document.body.dataset.page !== "tool") return;

  const presetId = getParam("id") || "neet";
  const preset = (window.PRESETS && window.PRESETS[presetId]) ? window.PRESETS[presetId] : window.PRESETS.neet;

  // UI refs
  const title = $("toolTitle");
  const sub = $("toolSub");
  const rules = $("rulesList");
  const file = $("file");
  const canvas = $("canvas");
  const ctx = canvas.getContext("2d");
  const zoom = $("zoom");
  const kbLimit = $("kbLimit");
  const kbValue = $("kbValue");
  const sizeValue = $("sizeValue");
  const statusValue = $("statusValue");
  const downloadBtn = $("downloadBtn");

  title.textContent = `${preset.name} Photo Resizer`;
  sub.textContent = `Preset applied: ${preset.widthMm}×${preset.heightMm} mm • Max ${preset.maxKb} KB • JPG`;

  rules.innerHTML = "";
  preset.guidelines.forEach(g=>{
    const li = document.createElement("li");
    li.textContent = g;
    rules.appendChild(li);
  });

  // Output size (px) at 300 DPI
  const outW = mmToPx(preset.widthMm, 300);
  const outH = mmToPx(preset.heightMm, 300);
  sizeValue.textContent = `${outW} × ${outH} px (300 DPI approx)`;

  kbLimit.value = preset.maxKb;
  kbValue.textContent = `${preset.maxKb} KB`;

  kbLimit.addEventListener("input", ()=>{
    kbValue.textContent = `${kbLimit.value} KB`;
    statusValue.textContent = "Adjust KB limit then click Download.";
  });

  // Canvas display size (preview)
  const previewW = 860;
  const previewH = 520;

  // Crop frame based on aspect ratio
  const aspect = preset.widthMm / preset.heightMm;
  let frame = { x:0, y:0, w:0, h:0 };

  function computeFrame(){
    // Fit frame nicely inside preview canvas
    const pad = 30;
    const W = previewW - pad*2;
    const H = previewH - pad*2;

    let fw = W, fh = Math.round(W / aspect);
    if (fh > H){
      fh = H;
      fw = Math.round(H * aspect);
    }
    frame.w = fw; frame.h = fh;
    frame.x = Math.round((previewW - fw)/2);
    frame.y = Math.round((previewH - fh)/2);
  }

  canvas.width = previewW;
  canvas.height = previewH;
  computeFrame();

  // Image state
  let img = null;
  let imgW=0, imgH=0;
  let offsetX=0, offsetY=0;
  let scale=1;

  // Drag state
  let dragging=false;
  let lastX=0, lastY=0;

  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Background
    ctx.fillStyle = "#070c16";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    if (img){
      // draw image
      const drawW = imgW * scale;
      const drawH = imgH * scale;
      const x = offsetX;
      const y = offsetY;

      ctx.drawImage(img, x, y, drawW, drawH);
    } else {
      ctx.fillStyle = "rgba(255,255,255,.6)";
      ctx.font = "16px system-ui";
      ctx.fillText("Upload a photo to start", 20, 30);
    }

    // dark overlay outside frame
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,.55)";
    ctx.beginPath();
    ctx.rect(0,0,canvas.width,canvas.height);
    ctx.rect(frame.x, frame.y, frame.w, frame.h);
    ctx.fill("evenodd");
    ctx.restore();

    // frame border
    ctx.strokeStyle = "rgba(79,140,255,.9)";
    ctx.lineWidth = 2;
    ctx.strokeRect(frame.x, frame.y, frame.w, frame.h);

    // helper text
    ctx.fillStyle = "rgba(255,255,255,.75)";
    ctx.font = "13px system-ui";
    ctx.fillText("Drag photo to position • Use zoom slider", frame.x, frame.y - 10);
  }

  function centerImage(){
    if (!img) return;
    // Scale image so it covers frame
    const scaleX = frame.w / imgW;
    const scaleY = frame.h / imgH;
    scale = Math.max(scaleX, scaleY);
    zoom.value = 100;

    const drawW = imgW * scale;
    const drawH = imgH * scale;
    offsetX = frame.x + (frame.w - drawW)/2;
    offsetY = frame.y + (frame.h - drawH)/2;
  }

  zoom.addEventListener("input", ()=>{
    if (!img) return;
    const z = Number(zoom.value); // 100..200
    const factor = z / 100;
    // keep center of frame stable
    const cx = frame.x + frame.w/2;
    const cy = frame.y + frame.h/2;

    const prevScale = scale;
    // base scale = cover scale
    const cover = Math.max(frame.w / imgW, frame.h / imgH);
    scale = cover * factor;

    // adjust offsets to keep image relative
    const relX = (cx - offsetX) / (imgW * prevScale);
    const relY = (cy - offsetY) / (imgH * prevScale);
    offsetX = cx - relX * (imgW * scale);
    offsetY = cy - relY * (imgH * scale);

    draw();
  });

  canvas.addEventListener("pointerdown", (e)=>{
    if (!img) return;
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });

  canvas.addEventListener("pointermove", (e)=>{
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    offsetX += dx;
    offsetY += dy;
    lastX = e.clientX;
    lastY = e.clientY;
    draw();
  });

  canvas.addEventListener("pointerup", (e)=>{
    dragging = false;
    try{ canvas.releasePointerCapture(e.pointerId); }catch{}
  });

  file.addEventListener("change", async ()=>{
    const f = file.files && file.files[0];
    if (!f) return;

    const url = URL.createObjectURL(f);
    const image = new Image();
    image.onload = ()=>{
      img = image;
      imgW = image.naturalWidth;
      imgH = image.naturalHeight;
      centerImage();
      draw();
      statusValue.textContent = "Photo loaded. Adjust crop and zoom, then click Download.";
      URL.revokeObjectURL(url);
    };
    image.onerror = ()=>{
      statusValue.textContent = "Could not load image. Try another file.";
    };
    image.src = url;
  });

  downloadBtn.addEventListener("click", async ()=>{
    if (!img){
      statusValue.textContent = "Please upload a photo first.";
      return;
    }

    statusValue.textContent = "Preparing final photo…";

    // Render cropped area into output canvas
    const out = document.createElement("canvas");
    out.width = outW;
    out.height = outH;
    const octx = out.getContext("2d");

    // Map frame area back to source image coords
    // frame in preview canvas corresponds to a rectangle in the drawn image.
    const drawW = imgW * scale;
    const drawH = imgH * scale;

    // frame top-left relative to drawn image
    const fx = frame.x - offsetX;
    const fy = frame.y - offsetY;

    // source coords in original image:
    const sx = fx / scale;
    const sy = fy / scale;
    const sw = frame.w / scale;
    const sh = frame.h / scale;

    // Draw to output
    octx.fillStyle = "#ffffff";
    octx.fillRect(0,0,outW,outH);
    octx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);

    const maxKb = Number(kbLimit.value) || preset.maxKb;
    const blob = await compressToMaxKb(out, maxKb);

    if (!blob){
      statusValue.textContent = "Failed to export image. Try again.";
      return;
    }

    const kb = await blobToKb(blob);
    statusValue.textContent = (kb <= maxKb)
      ? `✅ Ready: ${kb} KB (under ${maxKb} KB). Downloading…`
      : `⚠️ Output is ${kb} KB (above ${maxKb} KB). Try lowering KB.`;

    // download
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${preset.id}-photo.jpg`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(()=> URL.revokeObjectURL(a.href), 1500);
  });

  // initial draw
  draw();
})();