// ── DRAGON EGG ───────────────────────────────────────
(function() {
  const eggBtn    = document.getElementById('egg-btn');
  const eggLabel  = document.getElementById('egg-label');
  const eggHint   = document.getElementById('egg-hint');
  const canvas    = document.getElementById('dragon-canvas');
  if (!eggBtn || !canvas) return;
  const ctx = canvas.getContext('2d');

  const isMobile = window.innerWidth <= 900 || ('ontouchstart' in window);
  let active = false;

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  function killEgg() {
    active = false;
    cancelAnimationFrame(killEgg._animId);
    // Reset canvas to full-screen hidden state
    canvas.style.display = 'none';
    canvas.style.position = 'fixed';
    canvas.style.bottom = '';
    canvas.style.left = '';
    canvas.style.width = '';
    canvas.style.height = '';
    canvas.style.inset = '0';
    canvas.style.pointerEvents = 'none';
    canvas.onclick = null;
    eggBtn.style.display = '';
    eggBtn.style.transform = '';
    if (eggLabel) eggLabel.style.display = '';
    document.body.style.cursor = '';
  }

  function crackEgg(cb) {
    if (eggLabel) eggLabel.style.display = 'none';
    let s = 0;
    eggBtn.style.transition = 'transform .05s';
    const si = setInterval(() => {
      eggBtn.style.transform = `translate(${(Math.random()-.5)*10}px,${(Math.random()-.5)*10}px) rotate(${(Math.random()-.5)*15}deg)`;
      s++;
      if (s > 16) { clearInterval(si); eggBtn.style.display = 'none'; cb(); }
    }, 55);
  }

  // ── MOBILE: sleeping dragon in corner ─────────────────
  function startMobile() {
    const SIZE = 130;
    canvas.style.cssText = [
      'position:fixed','bottom:0.5rem','left:0.5rem',
      'width:'+SIZE+'px','height:'+SIZE+'px',
      'inset:auto','pointer-events:all','z-index:9999','display:block'
    ].join(';');
    canvas.width = SIZE;
    canvas.height = SIZE;
    canvas.onclick = killEgg;

    const c = canvas.getContext('2d');
    let smoke = [], smokeT = 0, alpha = 0;
    const S = SIZE;

    function spawnSmoke(x, y) {
      smoke.push({
        x: x+(Math.random()-.5)*3, y,
        vx:(Math.random()-.5)*.25, vy:-(0.3+Math.random()*.4),
        size:2.5+Math.random()*3, life:1,
        decay:0.012+Math.random()*.008,
        wb:Math.random()*Math.PI*2, ws:0.05+Math.random()*.03
      });
    }

    function draw(a) {
      c.clearRect(0,0,S,S);
      // Dark panel so dragon is visible against page background
      c.globalAlpha = a * 0.85;
      c.fillStyle = '#0e0404';
      c.strokeStyle = 'rgba(139,0,0,0.6)';
      c.lineWidth = 1.5;
      c.beginPath();
      c.roundRect(1,1,S-2,S-2,10);
      c.fill(); c.stroke();
      c.globalAlpha = 1;
      const sc = S*0.008;
      const cx = S*0.52, cy = S*0.58;
      c.save();
      c.globalAlpha = a;
      c.translate(cx, cy);

      // Tail
      c.beginPath();
      c.moveTo(55*sc,8*sc);
      c.bezierCurveTo(80*sc,28*sc,70*sc,60*sc,38*sc,65*sc);
      c.bezierCurveTo(8*sc,68*sc,-8*sc,55*sc,-2*sc,38*sc);
      c.strokeStyle='#8b0000'; c.lineWidth=5*sc; c.lineCap='round'; c.stroke();
      c.strokeStyle='#c01020'; c.lineWidth=3*sc; c.stroke();
      c.beginPath();
      c.moveTo(38*sc,65*sc); c.lineTo(28*sc,76*sc); c.lineTo(44*sc,72*sc);
      c.fillStyle='#8b0000'; c.fill();

      // Body
      const bg=c.createRadialGradient(0,9*sc,4*sc,0,9*sc,32*sc);
      bg.addColorStop(0,'#3a0a0a'); bg.addColorStop(1,'#1a0404');
      c.beginPath(); c.ellipse(0,9*sc,42*sc,25*sc,0.15,0,Math.PI*2);
      c.fillStyle=bg; c.fill();
      c.strokeStyle='#8b0000'; c.lineWidth=1.2*sc; c.stroke();

      // Wings folded
      c.beginPath();
      c.moveTo(-12*sc,-9*sc);
      c.bezierCurveTo(-37*sc,-42*sc,27*sc,-52*sc,37*sc,-19*sc);
      c.bezierCurveTo(32*sc,-4*sc,12*sc,1*sc,-12*sc,-9*sc);
      c.fillStyle='rgba(100,8,8,0.78)'; c.fill();
      c.strokeStyle='#8b0000'; c.lineWidth=sc; c.stroke();

      // Neck
      c.beginPath();
      c.moveTo(-22*sc,-2*sc);
      c.bezierCurveTo(-37*sc,-14*sc,-42*sc,-27*sc,-33*sc,-37*sc);
      c.strokeStyle='#1a0404'; c.lineWidth=9*sc; c.lineCap='round'; c.stroke();
      c.strokeStyle='#8b0000'; c.lineWidth=7.5*sc; c.stroke();

      // Head
      c.save(); c.translate(-33*sc,-41*sc);
      c.beginPath(); c.ellipse(0,0,10*sc,7*sc,-0.5,0,Math.PI*2);
      c.fillStyle='#250808'; c.fill();
      c.strokeStyle='#8b0000'; c.lineWidth=sc; c.stroke();
      // Snout
      c.beginPath();
      c.moveTo(-3*sc,2*sc);
      c.bezierCurveTo(0,4*sc,9*sc,5.5*sc,13*sc,3.5*sc);
      c.bezierCurveTo(9*sc,1.5*sc,2*sc,sc,-3*sc,2*sc);
      c.fillStyle='#1e0606'; c.fill();
      // Closed eye
      c.strokeStyle='#8b0000'; c.lineWidth=sc; c.lineCap='round';
      c.beginPath(); c.arc(-1.5*sc,-2*sc,2.5*sc,Math.PI*1.15,Math.PI*1.85); c.stroke();
      // Horns
      c.strokeStyle='#5a1010'; c.lineWidth=1.2*sc;
      c.beginPath();
      c.moveTo(-2*sc,-5*sc); c.lineTo(-8*sc,-10*sc);
      c.moveTo(2.5*sc,-5*sc); c.lineTo(-2*sc,-11*sc);
      c.stroke();
      // Nostril
      c.beginPath(); c.arc(8.5*sc,3.5*sc,sc,0,Math.PI*2);
      c.fillStyle='#5a1010'; c.fill();
      c.restore();

      // ZZZ
      const zt = Date.now()*.001;
      c.textAlign='center';
      [[7,-48,-58],[5,-55,-70],[4,-60,-80]].forEach(([sz,ox,oy],i)=>{
        c.font=`bold ${sz*sc}px serif`;
        c.fillStyle=`rgba(180,80,80,${0.55-i*.1+Math.sin(zt+i)*.15})`;
        c.fillText('z', ox*sc+Math.sin(zt*.5+i)*3*sc, oy*sc-(zt%(14+i*3))*sc*.9);
      });

      c.restore();

      // Return nostril in canvas coords
      return {
        x: cx + (-33*sc + 8.5*sc),
        y: cy + (-41*sc + 3.5*sc)
      };
    }

    function anim() {
      killEgg._animId = requestAnimationFrame(anim);
      alpha = Math.min(1, alpha+.025);
      const n = draw(alpha);
      if (++smokeT % 14 === 0) spawnSmoke(n.x, n.y);
      smoke = smoke.filter(s=>{
        s.wb+=s.ws; s.x+=s.vx+Math.sin(s.wb)*.2; s.y+=s.vy;
        s.size*=1.02; s.life-=s.decay;
        if(s.life>0){
          c.globalAlpha=s.life*.28;
          c.beginPath(); c.arc(s.x,s.y,s.size*s.life,0,Math.PI*2);
          c.fillStyle='rgba(190,130,90,1)'; c.fill();
          c.globalAlpha=1;
          return true;
        }
        return false;
      });
    }
    anim();
  }

    // ── DESKTOP: cursor-chasing dragon ─────────────────
  function startDesktop() {
    let phase='chase', mouse={x:window.innerWidth/2,y:window.innerHeight/2};
    let dr={x:-300,y:400,angle:0,vx:0,vy:0,flap:0};
    let stolenPos={x:0,y:0}, exitTarget={x:0,y:0};
    let flame=[], burst=[], textAlpha=0, stealT=0;
    canvas.style.display='block';

    document.addEventListener('mousemove', mm);
    function mm(e){mouse.x=e.clientX;mouse.y=e.clientY;}

    function kill(){
      active=false; phase='chase';
      cancelAnimationFrame(killEgg._animId);
      document.removeEventListener('mousemove',mm);
      canvas.style.display='none'; flame=[]; burst=[];
      eggBtn.style.display=''; eggBtn.style.transform='';
      if(eggLabel)eggLabel.style.display='';
      document.body.style.cursor='';
    }
    document.addEventListener('keydown', e=>{if(e.key==='Escape'&&active)kill();}, {once:true});

    // Spawn dragon from random edge
    const e=Math.floor(Math.random()*4);
    if(e===0){dr.x=Math.random()*window.innerWidth;dr.y=-150;}
    else if(e===1){dr.x=window.innerWidth+150;dr.y=Math.random()*window.innerHeight;}
    else if(e===2){dr.x=Math.random()*window.innerWidth;dr.y=window.innerHeight+150;}
    else{dr.x=-150;dr.y=Math.random()*window.innerHeight;}
    dr.angle=Math.atan2(mouse.y-dr.y,mouse.x-dr.x);

    function drawDragonD(x,y,angle,flap){
      ctx.save(); ctx.translate(x,y); ctx.rotate(angle);
      const sc=0.9,wfR=Math.sin(flap*.12)*22*Math.PI/180;
      // Tail
      ctx.beginPath(); ctx.moveTo(-60*sc,0);
      ctx.bezierCurveTo(-90*sc,10*sc,-110*sc,30*sc,-100*sc,55*sc);
      ctx.bezierCurveTo(-95*sc,70*sc,-80*sc,72*sc,-78*sc,65*sc);
      ctx.strokeStyle='#8b0000'; ctx.lineWidth=8*sc; ctx.lineCap='round'; ctx.stroke();
      ctx.strokeStyle='#c01020'; ctx.lineWidth=4*sc; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-100*sc,55*sc); ctx.lineTo(-115*sc,70*sc); ctx.lineTo(-95*sc,65*sc);
      ctx.fillStyle='#8b0000'; ctx.fill();
      // Top wing
      ctx.save(); ctx.rotate(-wfR);
      ctx.beginPath(); ctx.moveTo(-10*sc,-8*sc); ctx.lineTo(-20*sc,-55*sc); ctx.lineTo(20*sc,-85*sc);
      ctx.bezierCurveTo(40*sc,-80*sc,55*sc,-60*sc,45*sc,-35*sc);
      ctx.bezierCurveTo(55*sc,-25*sc,40*sc,-15*sc,20*sc,-12*sc);
      ctx.bezierCurveTo(10*sc,-8*sc,-5*sc,-10*sc,-10*sc,-8*sc);
      ctx.fillStyle='rgba(120,10,10,0.82)'; ctx.fill(); ctx.strokeStyle='#8b0000'; ctx.lineWidth=1.2*sc; ctx.stroke();
      ctx.restore();
      // Bottom wing
      ctx.save(); ctx.rotate(wfR);
      ctx.beginPath(); ctx.moveTo(-10*sc,8*sc); ctx.lineTo(-20*sc,55*sc); ctx.lineTo(20*sc,85*sc);
      ctx.bezierCurveTo(40*sc,80*sc,55*sc,60*sc,45*sc,35*sc);
      ctx.bezierCurveTo(55*sc,25*sc,40*sc,15*sc,20*sc,12*sc);
      ctx.bezierCurveTo(10*sc,8*sc,-5*sc,10*sc,-10*sc,8*sc);
      ctx.fillStyle='rgba(120,10,10,0.82)'; ctx.fill(); ctx.strokeStyle='#8b0000'; ctx.lineWidth=1.2*sc; ctx.stroke();
      ctx.restore();
      // Body
      const bg=ctx.createRadialGradient(0,0,5*sc,0,0,35*sc);
      bg.addColorStop(0,'#3a0a0a'); bg.addColorStop(1,'#1a0404');
      ctx.beginPath(); ctx.ellipse(0,0,50*sc,22*sc,0,0,Math.PI*2);
      ctx.fillStyle=bg; ctx.fill(); ctx.strokeStyle='#8b0000'; ctx.lineWidth=1.5*sc; ctx.stroke();
      // Neck
      ctx.beginPath(); ctx.moveTo(40*sc,-5*sc); ctx.bezierCurveTo(55*sc,-12*sc,62*sc,-18*sc,68*sc,-15*sc);
      ctx.strokeStyle='#1a0404'; ctx.lineWidth=16*sc; ctx.lineCap='round'; ctx.stroke();
      ctx.strokeStyle='#8b0000'; ctx.lineWidth=14*sc; ctx.stroke();
      // Head
      ctx.save(); ctx.translate(72*sc,-18*sc);
      ctx.beginPath(); ctx.ellipse(0,0,18*sc,12*sc,-.3,0,Math.PI*2);
      ctx.fillStyle='#250808'; ctx.fill(); ctx.strokeStyle='#8b0000'; ctx.lineWidth=1.2*sc; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-5*sc,-4*sc); ctx.bezierCurveTo(5*sc,-6*sc,22*sc,-5*sc,30*sc,-2*sc);
      ctx.bezierCurveTo(22*sc,0,10*sc,2*sc,-5*sc,0); ctx.fillStyle='#1e0606'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(-5*sc,3*sc); ctx.bezierCurveTo(5*sc,5*sc,20*sc,8*sc,28*sc,5*sc);
      ctx.bezierCurveTo(20*sc,3*sc,8*sc,2*sc,-5*sc,2*sc); ctx.fillStyle='#1e0606'; ctx.fill();
      ctx.fillStyle='#ffe0c0';
      for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo((8+i*5)*sc,-2*sc);ctx.lineTo((10+i*5)*sc,2*sc);ctx.lineTo((12+i*5)*sc,-2*sc);ctx.fill();}
      ctx.beginPath(); ctx.arc(2*sc,-5*sc,5*sc,0,Math.PI*2); ctx.fillStyle='#ff2200'; ctx.fill();
      ctx.beginPath(); ctx.arc(2*sc,-5*sc,2.5*sc,0,Math.PI*2); ctx.fillStyle='#000'; ctx.fill();
      ctx.beginPath(); ctx.arc(3*sc,-6*sc,sc,0,Math.PI*2); ctx.fillStyle='rgba(255,255,200,.9)'; ctx.fill();
      ctx.strokeStyle='#5a1010'; ctx.lineWidth=2.5*sc; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(0,-8*sc); ctx.lineTo(-4*sc,-22*sc); ctx.moveTo(6*sc,-8*sc); ctx.lineTo(3*sc,-22*sc); ctx.stroke();
      ctx.restore();
      // Legs
      ctx.strokeStyle='#8b0000'; ctx.lineWidth=4*sc; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(25*sc,18*sc); ctx.lineTo(30*sc,32*sc); ctx.lineTo(28*sc,42*sc); ctx.stroke();
      ctx.lineWidth=2*sc;
      [-1,0,1].forEach(c=>{ctx.beginPath();ctx.moveTo(28*sc,42*sc);ctx.lineTo((28+c*5)*sc,52*sc);ctx.stroke();});
      ctx.lineWidth=4*sc;
      ctx.beginPath(); ctx.moveTo(-20*sc,18*sc); ctx.lineTo(-18*sc,32*sc); ctx.lineTo(-20*sc,40*sc); ctx.stroke();
      ctx.lineWidth=2*sc;
      [-1,0,1].forEach(c=>{ctx.beginPath();ctx.moveTo(-20*sc,40*sc);ctx.lineTo((-20+c*5)*sc,50*sc);ctx.stroke();});
      ctx.restore();
    }

    function emitFlame(x,y,angle){
      const mx=x+Math.cos(angle)*65,my=y+Math.sin(angle)*65;
      for(let i=0;i<4;i++){
        const sp=(Math.random()-.5)*.5,speed=6+Math.random()*8;
        flame.push({x:mx,y:my,vx:Math.cos(angle+sp)*speed,vy:Math.sin(angle+sp)*speed,
          life:1,decay:.028+Math.random()*.02,size:8+Math.random()*14});
      }
    }
    function drawFlame(p){
      ctx.beginPath();ctx.arc(p.x,p.y,p.size*p.life*1.5,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,${Math.floor(100*p.life*p.life)},0,${p.life*.2})`;ctx.fill();
      ctx.beginPath();ctx.arc(p.x,p.y,p.size*p.life,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,${Math.floor(180*p.life*p.life)},0,${p.life*.9})`;ctx.fill();
      ctx.beginPath();ctx.arc(p.x,p.y,p.size*p.life*.35,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,255,220,${p.life*.85})`;ctx.fill();
    }
    function drawCursor(x,y){
      ctx.save();ctx.translate(x,y);
      ctx.beginPath();ctx.arc(5,8,14+Math.sin(Date.now()*.005)*4,0,Math.PI*2);
      ctx.fillStyle='rgba(255,80,0,.15)';ctx.fill();
      ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,18);ctx.lineTo(4,13);
      ctx.lineTo(7,20);ctx.lineTo(9,19);ctx.lineTo(6,12);ctx.lineTo(12,12);ctx.closePath();
      ctx.fillStyle='white';ctx.fill();ctx.strokeStyle='#333';ctx.lineWidth=1;ctx.stroke();
      ctx.restore();
    }

    function animDesktop(){
      killEgg._animId=requestAnimationFrame(animDesktop);
      ctx.clearRect(0,0,canvas.width,canvas.height);
      dr.flap++;

      if(phase==='chase'){
        const dist=Math.hypot(mouse.x-dr.x,mouse.y-dr.y);
        const ta=Math.atan2(mouse.y-dr.y,mouse.x-dr.x);
        let da=ta-dr.angle;
        while(da>Math.PI)da-=Math.PI*2;while(da<-Math.PI)da+=Math.PI*2;
        dr.angle+=da*.07;
        dr.vx+=Math.cos(dr.angle)*5*.13;dr.vy+=Math.sin(dr.angle)*5*.13;
        dr.vx*=.88;dr.vy*=.88;dr.x+=dr.vx;dr.y+=dr.vy;
        if(dist<140)emitFlame(dr.x,dr.y,dr.angle);
        if(dist<45){
          phase='steal';stealT=0;textAlpha=0;
          document.body.style.cursor='none';
          exitTarget={x:window.innerWidth-80,y:window.innerHeight-80};
          for(let i=0;i<70;i++){
            const a=Math.random()*Math.PI*2,sp=4+Math.random()*14;
            burst.push({x:mouse.x,y:mouse.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,
              life:1,decay:.013+Math.random()*.018,size:5+Math.random()*22,hue:Math.random()*50});
          }
        }
      } else if(phase==='steal'){
        stealT++;textAlpha=Math.min(1,stealT/25);
        const ta=Math.atan2(exitTarget.y-dr.y,exitTarget.x-dr.x);
        let da=ta-dr.angle;
        while(da>Math.PI)da-=Math.PI*2;while(da<-Math.PI)da+=Math.PI*2;
        dr.angle+=da*.1;dr.vx+=Math.cos(dr.angle)*7*.15;dr.vy+=Math.sin(dr.angle)*7*.15;
        dr.vx*=.86;dr.vy*=.86;dr.x+=dr.vx;dr.y+=dr.vy;
        if(dr.flap%8===0)emitFlame(dr.x,dr.y,dr.angle);
        stolenPos.x=dr.x+Math.cos(dr.angle)*20;stolenPos.y=dr.y+Math.sin(dr.angle)*20;
        if(Math.hypot(exitTarget.x-dr.x,exitTarget.y-dr.y)<30){
          phase='parked';stealT=0;stolenPos={...exitTarget};
          const oa=[0,Math.PI/2,Math.PI,-Math.PI/2][Math.floor(Math.random()*4)];
          exitTarget={x:dr.x+Math.cos(oa)*2000,y:dr.y+Math.sin(oa)*2000};
        }
      } else if(phase==='parked'){
        const ta=Math.atan2(exitTarget.y-dr.y,exitTarget.x-dr.x);
        let da=ta-dr.angle;
        while(da>Math.PI)da-=Math.PI*2;while(da<-Math.PI)da+=Math.PI*2;
        dr.angle+=da*.08;dr.vx+=Math.cos(dr.angle)*8*.15;dr.vy+=Math.sin(dr.angle)*8*.15;
        dr.vx*=.9;dr.vy*=.9;dr.x+=dr.vx;dr.y+=dr.vy;
        const off=dr.x<-200||dr.x>window.innerWidth+200||dr.y<-200||dr.y>window.innerHeight+200;
        if(off)textAlpha=Math.max(0,textAlpha-.008);
        if(Math.hypot(mouse.x-stolenPos.x,mouse.y-stolenPos.y)<60){
          document.body.style.cursor='';kill();return;
        }
      }

      flame=flame.filter(p=>{p.x+=p.vx;p.y+=p.vy;p.vx*=.93;p.vy*=.93;p.life-=p.decay;p.size*=1.03;
        if(p.life>0){drawFlame(p);return true;}return false;});
      burst=burst.filter(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.2;p.vx*=.97;p.life-=p.decay;
        if(p.life>0){ctx.beginPath();ctx.arc(p.x,p.y,p.size*p.life,0,Math.PI*2);
          ctx.fillStyle=`hsla(${p.hue},100%,60%,${p.life})`;ctx.fill();return true;}return false;});

      if(phase!=='vanish')drawDragonD(dr.x,dr.y,dr.angle,dr.flap);
      if(phase==='steal'||phase==='parked')drawCursor(stolenPos.x,stolenPos.y);

      if(textAlpha>0){
        ctx.save();ctx.globalAlpha=textAlpha;
        ctx.font="bold 16px 'Cinzel',serif";ctx.textAlign='center';
        ctx.shadowColor='#000';ctx.shadowBlur=14;
        ctx.fillStyle='rgba(255,60,0,1)';
        ctx.fillText('YOUR CURSOR IS MINE',window.innerWidth/2,55);
        ctx.shadowBlur=0;ctx.restore();
      }
      if(phase==='parked'){
        ctx.save();ctx.globalAlpha=.8+Math.sin(Date.now()*.003)*.2;
        ctx.font="bold 11px 'Cinzel',serif";ctx.textAlign='center';
        ctx.shadowColor='#000';ctx.shadowBlur=8;
        ctx.fillStyle='rgba(220,160,80,1)';
        ctx.fillText('move your cursor to the bottom-right corner to retrieve it',window.innerWidth/2,80);
        ctx.shadowBlur=0;ctx.restore();
      }
    }
    animDesktop();
  }

  eggBtn.addEventListener('click', function() {
    if (active) return;
    active = true;
    crackEgg(() => {
      if (isMobile) startMobile();
      else startDesktop();
    });
  });
})();
