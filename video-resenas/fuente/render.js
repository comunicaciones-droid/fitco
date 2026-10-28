const {chromium}=require('playwright');
const {spawn}=require('child_process');
const path=require('path');
(async()=>{
 const [,,html,mode,out]=process.argv; // mode: "stills:1,2,3" or "video"
 const b=await chromium.launch();
 const p=await b.newPage({viewport:{width:1080,height:1920}});
 await p.goto('file://'+path.resolve(html));
 await p.evaluate(()=>document.fonts.ready);
 await p.waitForTimeout(300);
 if(mode.startsWith('stills')){
  for(const t of mode.split(':')[1].split(',')){await p.evaluate(t=>seek(+t),t);await p.screenshot({path:`${out}/s_${t}.png`});}
 } else {
  const fps=30,N=Math.round((await p.evaluate(()=>window.DURATION||20))*fps);
  const ff=spawn('ffmpeg',['-y','-f','image2pipe','-framerate',''+fps,'-i','-','-f','lavfi','-i','anullsrc=r=44100:cl=stereo','-shortest','-c:v','libx264','-preset','slow','-crf','16','-pix_fmt','yuv420p','-profile:v','high','-c:a','aac','-movflags','+faststart',out],{stdio:['pipe','ignore','inherit']});
  for(let i=0;i<N;i++){await p.evaluate(t=>seek(t),i/fps);const buf=await p.screenshot({type:'png'});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if(i%60==0)console.log('frame',i);}
  ff.stdin.end();await new Promise(r=>ff.on('close',r));
 }
 await b.close();
})();
