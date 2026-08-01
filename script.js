/* typewriter */
  const lines = ["One ride. Many stations. Zero exits. 💛", "Boarding now → destination: forever :)"];
  const typedEl = document.getElementById('typedText');
  let li = 0, ci = 0, deleting = false;
  function type(){
    const cur = lines[li];
    typedEl.textContent = deleting ? cur.slice(0, --ci) : cur.slice(0, ++ci);
    if(!deleting && ci === cur.length){ deleting = true; return setTimeout(type, 2200); }
    if(deleting && ci === 0){ deleting = false; li = (li+1) % lines.length; }
    setTimeout(type, deleting ? 28 : 55);
  }
  type();

  /* reveal + train + top bar */
  const stations = document.querySelectorAll('.station');
  const io = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); }), { threshold:0.25 });
  stations.forEach(s => io.observe(s));

  const trackWrap = document.getElementById('trackWrap');
  const trainMarker = document.getElementById('trainMarker');
  const lineFill = document.getElementById('lineFill');
  const topBar = document.getElementById('topBar');

  function onScroll(){
    const rect = trackWrap.getBoundingClientRect();
    const total = trackWrap.offsetHeight;
    let p = Math.max(0, Math.min(total, window.innerHeight * 0.5 - rect.top));
    trainMarker.style.top = p + 'px';
    lineFill.style.height = p + 'px';
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    topBar.style.width = (docH > 0 ? (window.scrollY / docH) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive:true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* photo slot */
  const photoFrame = document.getElementById('photoFrame');
  const photoInput = document.getElementById('photoInput');
  photoFrame.addEventListener('click', () => photoInput.click());
  photoInput.addEventListener('change', e => {
    const f = e.target.files[0];
    if(!f) return;
    const r = new FileReader();
    r.onload = ev => { photoFrame.innerHTML = '<img src="' + ev.target.result + '" alt="Priti">'; };
    r.readAsDataURL(f);
  });

  /* bucket list */
  const items = document.querySelectorAll('#bucketList li');
  const bp = document.getElementById('bucketProgress');
  items.forEach(li => li.addEventListener('click', () => {
    li.classList.toggle('done');
    const n = document.querySelectorAll('#bucketList li.done').length;
    bp.textContent = n + ' / 6 DONE — ' + (n === 6 ? 'ALL DONE! TIME TO MAKE A NEW LIST 🥳' : 'SO MUCH LEFT TO DO TOGETHER');
  }));

  /* song */
  const songBtn = document.getElementById('songBtn');
  const ytWrap = document.getElementById('ytWrap');
  const ytFrame = document.getElementById('ytFrame');
  const ytFallback = document.getElementById('ytFallback');
  let loaded = false;
  songBtn.addEventListener('click', () => {
    if(!loaded){
      ytFrame.src = "https://www.youtube-nocookie.com/embed/XLJCtZK0x5M?autoplay=1&playsinline=1&rel=0";
      ytWrap.classList.add('show');
      songBtn.textContent = "⏸ Hide player";
      loaded = true;
      setTimeout(() => { ytFallback.style.display = 'block'; }, 1500);
    } else {
      const showing = ytWrap.classList.toggle('show');
      songBtn.textContent = showing ? "⏸ Hide player" : "▶ Show player";
      if(!showing) ytFrame.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}','*');
    }
  });

  /* camera */
  const camBtn = document.getElementById('camBtn'), camWrap = document.getElementById('camWrap');
  const camVideo = document.getElementById('camVideo'), camCanvas = document.getElementById('camCanvas');
  const camHint = document.getElementById('camHint'), snapBtn = document.getElementById('snapBtn');
  const camStopBtn = document.getElementById('camStopBtn'), snapPreview = document.getElementById('snapPreview');
  const snapImg = document.getElementById('snapImg'), downloadBtn = document.getElementById('downloadBtn');
  let camStream = null;

  camBtn.addEventListener('click', async () => {
    camWrap.classList.add('show');
    snapPreview.classList.remove('show');
    if(!navigator.mediaDevices?.getUserMedia){
      camHint.textContent = "Camera isn't available here — just record on your phone and send it over!";
      return;
    }
    try{
      camStream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:'user' } });
      camVideo.srcObject = camStream;
    } catch {
      camHint.textContent = "Camera access was blocked — just record on your phone and send it over!";
    }
  });

  snapBtn.addEventListener('click', () => {
    if(!camStream) return;
    const w = camVideo.videoWidth, h = camVideo.videoHeight;
    if(!w) return;
    camCanvas.width = w; camCanvas.height = h;
    camCanvas.getContext('2d').drawImage(camVideo, 0, 0, w, h);
    const url = camCanvas.toDataURL('image/png');
    snapImg.src = url; downloadBtn.href = url;
    snapPreview.classList.add('show');
  });

  function stopCam(){ camStream?.getTracks().forEach(t => t.stop()); camStream = null; camWrap.classList.remove('show'); }
  camStopBtn.addEventListener('click', stopCam);
  window.addEventListener('beforeunload', stopCam);

  /* confetti + hearts */
  const colors = ['#0C6E6E','#F2A65A','#FF6F91','#1B2A41'];
  function confetti(n = 60){
    for(let i = 0; i < n; i++){
      const el = document.createElement('div');
      el.className = 'confetti';
      const s = 6 + Math.random()*6;
      el.style.cssText = `width:${s}px;height:${s*0.4}px;left:${Math.random()*100}vw;background:${colors[i%colors.length]}`;
      document.body.appendChild(el);
      const d = 2200 + Math.random()*1800;
      el.animate([{ top:'-10px', transform:'rotate(0)' },
                  { top:'105vh', transform:`translateX(${(Math.random()-.5)*200}px) rotate(${Math.random()*720}deg)` }],
                 { duration:d, easing:'ease-in', fill:'forwards' });
      setTimeout(() => el.remove(), d + 50);
    }
  }
  let fired = false;
  new IntersectionObserver(es => es.forEach(e => {
    if(e.isIntersecting && !fired){ fired = true; confetti(); }
  }), { threshold:0.4 }).observe(document.querySelector('.final'));

  document.getElementById('heartBtn').addEventListener('click', () => {
    const emojis = ['💛','✨','🚇','☕','💃','🥹'];
    for(let i = 0; i < 22; i++){
      const el = document.createElement('div');
      el.className = 'float-heart';
      el.textContent = emojis[i % emojis.length];
      el.style.left = (10 + Math.random()*80) + 'vw';
      el.style.top = '100vh';
      document.body.appendChild(el);
      const d = 2400 + Math.random()*1200;
      el.animate([{ top:'100vh', opacity:1 }, { top:'-10vh', opacity:0 }], { duration:d, easing:'ease-out', fill:'forwards' });
      setTimeout(() => el.remove(), d + 50);
    }
    confetti(30);
  });
