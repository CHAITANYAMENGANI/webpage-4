(function(){
  var WEDDING = new Date("2027-02-14T07:15:00+05:30");
  function pad(n){return String(n).padStart(2,"0")}
  function tick(){
    var t=Math.max(0,WEDDING-new Date()),
        s=Math.floor(t/1000);
    document.getElementById("d").textContent=Math.floor(s/86400);
    document.getElementById("h").textContent=pad(Math.floor(s%86400/3600));
    document.getElementById("m").textContent=pad(Math.floor(s%3600/60));
    document.getElementById("s").textContent=pad(s%60);
  }
  tick();setInterval(tick,1000);

  var tt;
  function toast(msg){var el=document.getElementById("toast");el.textContent=msg;el.classList.add("on");clearTimeout(tt);tt=setTimeout(function(){el.classList.remove("on")},3200)}
  document.querySelectorAll("[data-toast]").forEach(function(b){b.addEventListener("click",function(){toast(b.dataset.toast)})});

  document.getElementById("rsvp-form").addEventListener("submit",function(e){
    e.preventDefault();
    this.style.display="none";
    document.getElementById("thanks").style.display="block";
  });

  /* Guest-pass QR: encodes this page's address */
  function makeQR(){
    var box=document.getElementById("qrcode");box.innerHTML="";
    if(!window.QRCode)return;
    var cs=getComputedStyle(document.documentElement);
    var url=(location.href||"").split("#")[0]||"https://example.com";
    try{new QRCode(box,{text:url,width:170,height:170,colorDark:cs.getPropertyValue("--qr-fg").trim()||"#75542B",colorLight:cs.getPropertyValue("--qr-bg").trim()||"#FFFFFF",correctLevel:QRCode.CorrectLevel.H})}catch(err){}
  }
  makeQR();
  if(window.matchMedia)window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",makeQR);

  var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add("in");io.unobserve(x.target)}})},{threshold:.12});
  document.querySelectorAll(".fade").forEach(function(el){io.observe(el)});

  /* Emerald Palace colour customiser */
  var rootStyle=document.documentElement;
  var panel=document.getElementById("style-panel");
  var toggle=document.getElementById("style-toggle");
  var presets={
    emerald:{primary:"#123D32",gold:"#C5A66B",bg:"#F8F5EC"},
    ivory:{primary:"#66543A",gold:"#B89555",bg:"#FBF8F0"},
    burgundy:{primary:"#101D3B",gold:"#C9A45C",bg:"#F4F0E6"},
    midnight:{primary:"#263653",gold:"#C7AD76",bg:"#F3F1EA"}
  };
  var controls={
    primary:document.getElementById("primary-color"),
    gold:document.getElementById("accent-color"),
    bg:document.getElementById("background-color")
  };
  function hexRgb(hex){
    var h=hex.replace("#","");
    return {r:parseInt(h.slice(0,2),16),g:parseInt(h.slice(2,4),16),b:parseInt(h.slice(4,6),16)};
  }
  function mix(hex1,hex2,amount){
    var a=hexRgb(hex1),b=hexRgb(hex2);
    return "#"+["r","g","b"].map(function(k){return Math.round(a[k]*(1-amount)+b[k]*amount).toString(16).padStart(2,"0")}).join("");
  }
  function applyColors(c){
    rootStyle.style.setProperty("--primary",c.primary);
    rootStyle.style.setProperty("--gold",c.gold);
    rootStyle.style.setProperty("--gold-l",mix(c.gold,"#FFFFFF",.35));
    rootStyle.style.setProperty("--bg",c.bg);
    rootStyle.style.setProperty("--bg2",mix(c.bg,c.primary,.055));
    rootStyle.style.setProperty("--card",mix(c.bg,"#FFFFFF",.48));
    rootStyle.style.setProperty("--line",mix(c.bg,c.gold,.34));
    rootStyle.style.setProperty("--ink",mix(c.primary,"#111A16",.22));
    rootStyle.style.setProperty("--muted",mix(c.primary,"#FFFFFF",.43));
    rootStyle.style.setProperty("--on-gold","#FFFDF7");
    rootStyle.style.setProperty("--qr-fg",c.primary);
    controls.primary.value=c.primary;controls.gold.value=c.gold;controls.bg.value=c.bg;
    makeQR();
  }
  function currentColors(){return {primary:controls.primary.value,gold:controls.gold.value,bg:controls.bg.value}}
  function selectPreset(name){
    var c=presets[name];if(!c)return;
    applyColors(c);
    document.querySelectorAll(".palette").forEach(function(b){b.classList.toggle("active",b.dataset.palette===name)});
    document.getElementById("style-feedback").textContent=name==="burgundy"?"Midnight Heirloom palette selected.":" "+(name==="emerald"?"Emerald Palace":name==="ivory"?"Royal Ivory":"Midnight Blue")+" palette selected.";
  }
  document.querySelectorAll(".palette").forEach(function(b){
    b.addEventListener("click",function(){selectPreset(b.dataset.palette)});
  });
  Object.keys(controls).forEach(function(k){
    controls[k].addEventListener("input",function(){
      document.querySelectorAll(".palette").forEach(function(b){b.classList.remove("active")});
      applyColors(currentColors());
      document.getElementById("style-feedback").textContent="Custom colours applied. Save to keep them on this device.";
    });
  });
  toggle.addEventListener("click",function(){
    var open=panel.hidden;panel.hidden=!open;toggle.setAttribute("aria-expanded",String(open));
  });
  document.getElementById("panel-close").addEventListener("click",function(){
    panel.hidden=true;toggle.setAttribute("aria-expanded","false");
  });
  document.getElementById("save-colors").addEventListener("click",function(){
    try{localStorage.setItem("wedding-colours-v1",JSON.stringify(currentColors()));document.getElementById("style-feedback").textContent="Your colours have been saved on this device."}
    catch(e){document.getElementById("style-feedback").textContent="Colours are applied, but this browser did not allow saving."}
  });
  document.getElementById("reset-colors").addEventListener("click",function(){
    try{localStorage.removeItem("wedding-colours-v1")}catch(e){}
    selectPreset("burgundy");
  });
  try{
    var saved=JSON.parse(localStorage.getItem("wedding-colours-v1")||"null");
    if(saved&&/^#[0-9a-f]{6}$/i.test(saved.primary)&&/^#[0-9a-f]{6}$/i.test(saved.gold)&&/^#[0-9a-f]{6}$/i.test(saved.bg)){
      applyColors(saved);
      document.querySelectorAll(".palette").forEach(function(b){b.classList.remove("active")});
      document.getElementById("style-feedback").textContent="Your saved colour settings are active.";
    }
  }catch(e){}

})();
