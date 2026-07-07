let captchaValue = '';

function drawCaptcha(text){
  const c = document.getElementById('captchaCanvas');
  const ctx = c.getContext('2d');
  ctx.clearRect(0,0,c.width,c.height);
  ctx.fillStyle = '#f6f6f6';
  ctx.fillRect(0,0,c.width,c.height);
  for(let i=0;i<18;i++){
    ctx.fillStyle = (i%2? '#e0e0e0':'#d0d0ff');
    ctx.fillRect(Math.random()*c.width, Math.random()*c.height, 2,2);
  }
  ctx.font = '20px Arial';
  ctx.fillStyle = '#111';
  ctx.setTransform(1, 0.15, -0.1, 1, 0, 0);
  ctx.fillText(text, 10, 26);
  ctx.setTransform(1,0,0,1,0,0);
}

async function fetchCaptcha(){
  try {
    const res = await fetch('/captcha');
    const data = await res.json();
    captchaValue = data.answer;
    drawCaptcha(data.render);
    document.getElementById('captchaInput').value = '';
  } catch(e){
    console.error(e);
  }
}

document.getElementById('refreshCaptcha').addEventListener('click', fetchCaptcha);
document.getElementById('togglePwd').addEventListener('click', ()=> {
  const p = document.getElementById('password');
  p.type = p.type === 'password' ? 'text' : 'password';
});

document.getElementById('loginForm').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const msg = document.getElementById('msg');
  msg.textContent = '';
  const payload = {
    username: document.getElementById('username').value,
    password: document.getElementById('password').value,
    captcha: document.getElementById('captchaInput').value
  };
  const res = await fetch('/login', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if(data.ok){
    window.location.href = data.redirect || '/after-login';
  } else {
    msg.style.color = '#b00';
    msg.textContent = data.error || 'Login failed';
    fetchCaptcha();
  }
});

window.addEventListener('load', fetchCaptcha);
