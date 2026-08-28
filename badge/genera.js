const {chromium}=require('playwright');
const fs=require('fs');
(async()=>{
const b=await chromium.launch({executablePath:"/opt/pw-browsers/chromium-1194/chrome-linux/chrome"});
const p=await (await b.newContext()).newPage();
await p.setContent('<canvas id="c" width="96" height="96"></canvas>');
const dis=async(nome,q)=>{
  const d=await p.evaluate((q)=>{
    const c=document.getElementById('c'), x=c.getContext('2d'), cx=48, cy=48, A=-Math.PI/2, r=40;
    x.clearRect(0,0,96,96);
    /* Nella barra di stato Android usa solo il canale alfa e colora tutto di
       bianco: il contorno è nero al 50% (esce grigio), la fetta nero pieno. */
    x.lineWidth=7; x.strokeStyle='rgba(0,0,0,0.5)';
    x.beginPath(); x.arc(cx,cy,r-3.5,0,Math.PI*2); x.stroke();
    if(q>0){ x.fillStyle='rgba(0,0,0,1)'; x.beginPath(); x.moveTo(cx,cy);
      x.arc(cx,cy,r-9,A,A+Math.PI*2*Math.min(q,1)); x.closePath(); x.fill(); }
    if(q>1){ x.fillStyle='rgba(0,0,0,1)'; x.beginPath(); x.arc(cx,cy,r,0,Math.PI*2); x.fill(); }
    return c.toDataURL('image/png');
  },q);
  fs.writeFileSync('/home/user/diario/badge/'+nome, Buffer.from(d.split(',')[1],'base64'));
};
for(let i=0;i<=100;i+=5) await dis('cerchio-'+String(i).padStart(3,'0')+'.png', i/100);
await dis('cerchio-oltre.png', 2);
await b.close(); console.log('badge fatti');
})();
