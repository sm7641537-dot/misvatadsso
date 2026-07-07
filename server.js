const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
  secret: 'dev-secret-please-change',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 10*60*1000 }
}));

app.use(express.static(path.join(__dirname, '.')));

function makeMathCaptcha(){
  const a = Math.floor(Math.random()*9)+1;
  const b = Math.floor(Math.random()*9)+1;
  const ops = ['+','-','×'];
  const op = ops[Math.floor(Math.random()*ops.length)];
  let ans = 0;
  if(op === '+') ans = a + b;
  if(op === '-') ans = a - b;
  if(op === '×') ans = a * b;
  const render = `${a} ${op} ${b} =`;
  return {render, answer: String(ans)};
}

app.get('/captcha', (req,res)=>{
  const c = makeMathCaptcha();
  req.session.captcha = c.answer;
  // demo: return render (and answer only for visible testing; in production DO NOT return answer)
  res.json({ render: c.render, answer: c.answer });
});

app.post('/login', (req,res)=>{
  const { username, password, captcha } = req.body;
  if(!username || !password || !captcha){
    return res.json({ ok:false, error:'Missing fields' });
  }
  if(!req.session.captcha){
    return res.json({ ok:false, error:'Captcha expired, refresh page' });
  }
  if(String(captcha).trim() !== String(req.session.captcha).trim()){
    return res.json({ ok:false, error:'Invalid captcha' });
  }

  // Only accepted credential
  const ALLOWED_USER = 'dsso.kumilla';
  const ALLOWED_PASS = '123456';

  if(username === ALLOWED_USER && password === ALLOWED_PASS){
    req.session.authenticated = true;
    req.session.user = username;
    req.session.captcha = null;
    return res.json({ ok:true, redirect: '/after-login' });
  } else {
    return res.json({ ok:false, error:'Invalid username or password' });
  }
});

app.get('/after-login', (req, res) => {
  if (req.session && req.session.authenticated) {
    return res.sendFile(path.join(__dirname, 'after-login.html'));
  } else {
    return res.redirect('/');
  }
});

app.post('/logout', (req,res)=>{
  req.session.destroy(err=>{
    res.json({ ok: !err });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('Server running on port', PORT));
