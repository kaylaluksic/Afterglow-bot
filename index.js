const { Client, EmbedBuilder } = require('discord.js');
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const client = new Client({ intents: 3276799 });

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>AG | Carl Style</title>
<style>
body{background:#2b2d31;color:#fff;font-family:Whitney, sans-serif;padding:15px;max-width:600px;margin:auto}
.card{background:#313338;padding:15px;border-radius:8px;margin-bottom:15px;border:1px solid #404040}
input,textarea,select{width:100%;padding:10px;margin:6px 0;background:#2b2d31;border:1px solid #404040;color:#fff;border-radius:4px;box-sizing:border-box}
label{font-size:12px;color:#b5bac1;font-weight:bold;text-transform:uppercase}
button.main{width:100%;padding:14px;background:#5865F2;color:#fff;border:none;border-radius:4px;font-weight:bold;font-size:16px;cursor:pointer}
.row{display:flex;gap:10px}
.row>div{flex:1}
.preview{background:#2b2d31;border-left:4px solid #ffcc00;padding:12px;border-radius:4px;margin-top:10px;word-break:break-word}
.small{font-size:12px;color:#949ba4}
</style>
</head>
<body>
<h2 style="text-align:center">AG | Embed Builder <span style="color:#ffcc00">Carl Style</span></h2>
<div class="card">
<label>Canal ID *</label>
<input id="channel" placeholder="Click derecho al canal > Copiar ID">
<label>Mensaje de contenido (fuera del embed, ej: @everyone)</label>
<input id="content" placeholder="Opcional: @everyone o texto normal">
</div>

<div class="card">
<label>Autor - Nombre</label>
<input id="author" placeholder="Ej: AfterGlow Server">
<label>Autor - Icono (URL)</label>
<input id="authorIcon" placeholder="https://...">
<label>Titulo del Embed</label>
<input id="title" placeholder="Ej: 📢 TORNEO HOY">
<label>Descripcion</label>
<textarea id="desc" rows="4" placeholder="Soporta **negrita** y [links](https://)"></textarea>
<label>Color</label>
<input id="color" type="color" value="#ffcc00">
</div>

<div class="card">
<label>Thumbnail (imagen pequeña arriba a la derecha)</label>
<input id="thumb" placeholder="https://...">
<label>Imagen Grande (abajo del embed)</label>
<input id="image" placeholder="https://...">
<label>Footer - Texto</label>
<input id="footer" value="AG | AfterGlow">
<label>Footer - Icono (URL)</label>
<input id="footerIcon" placeholder="https://...">
<label><input type="checkbox" id="timestamp" checked> Mostrar hora actual (como Carl-bot)</label>
</div>

<button class="main" onclick="send()">ENVIAR EMBED COMO CARL-BOT</button>
<p id="msg" class="small" style="text-align:center;margin-top:10px"></p>

<script>
async function send(){
  document.getElementById('msg').innerText='Enviando...';
  const data = {
    content: document.getElementById('content').value,
    title: document.getElementById('title').value,
    description: document.getElementById('desc').value,
    color: document.getElementById('color').value,
    author: document.getElementById('author').value,
    authorIcon: document.getElementById('authorIcon').value,
    thumbnail: document.getElementById('thumb').value,
    image: document.getElementById('image').value,
    footer: document.getElementById('footer').value,
    footerIcon: document.getElementById('footerIcon').value,
    timestamp: document.getElementById('timestamp').checked,
    channelId: document.getElementById('channel').value
  };
  const r = await fetch('/send',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
  document.getElementById('msg').innerText=await r.text();
}
</script>
</body>
</html>
`);
});

app.post('/send', async (req, res) => {
  try {
    const { content, title, description, color, author, authorIcon, thumbnail, image, footer, footerIcon, timestamp, channelId } = req.body;
    const channel = await client.channels.fetch(channelId);
    if(!channel) return res.send('❌ ID de canal inválido');

    const embed = new EmbedBuilder().setColor(color || '#ffcc00');
    if(title) embed.setTitle(title);
    if(description) embed.setDescription(description);
    if(author) embed.setAuthor({ name: author, iconURL: authorIcon || null });
    if(thumbnail) embed.setThumbnail(thumbnail);
    if(image) embed.setImage(image);
    if(footer) embed.setFooter({ text: footer, iconURL: footerIcon || null });
    if(timestamp) embed.setTimestamp();

    await channel.send({ content: content || null, embeds: [embed] });
    res.send('✅ Embed enviado como Carl-bot a #' + channel.name);
  } catch(e){ console.error(e); res.send('❌ Error: '+e.message); }
});

client.on('ready', ()=>console.log('BOT '+client.user.tag+' ONLINE'));
app.listen(process.env.PORT||3000,'0.0.0.0',()=>console.log('WEB ONLINE'));
client.login(process.env.TOKEN);
`);
});
