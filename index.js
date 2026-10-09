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
<title>AfterGlow Embed</title>
<style>
body{background:#313338;color:#fff;font-family:sans-serif;padding:20px;max-width:500px;margin:auto}
input,textarea{width:100%;padding:12px;margin:8px 0;background:#2b2d31;border:1px solid #404040;color:white;border-radius:6px;box-sizing:border-box}
button{width:100%;padding:14px;background:#5865F2;color:white;border:none;border-radius:6px;font-weight:bold;font-size:16px;margin-top:10px}
h2{text-align:center}
</style>
</head>
<body>
<h2>🎨 AfterGlow Embed Builder</h2>
<input id="title" placeholder="Titulo: ej 📢 ANUNCIO">
<textarea id="desc" rows="5" placeholder="Descripcion: ej Hoy torneo 21:00"></textarea>
<input id="color" type="color" value="#ffcc00">
<input id="channel" placeholder="ID del Canal de Discord">
<button onclick="enviar()">ENVIAR A DISCORD</button>
<p id="msg"></p>
<script>
async function enviar(){
  document.getElementById('msg').innerText='Enviando...';
  const r = await fetch('/send',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
    title:document.getElementById('title').value,
    description:document.getElementById('desc').value,
    color:document.getElementById('color').value,
    channelId:document.getElementById('channel').value
  })});
  document.getElementById('msg').innerText=await r.text();
}
</script>
</body>
</html>
`);
});

app.post('/send', async (req, res) => {
  try {
    const { title, description, color, channelId } = req.body;
    if(!channelId) return res.send('❌ Pon el ID del canal');
    const channel = await client.channels.fetch(channelId);
    const embed = new EmbedBuilder().setTitle(title||'AfterGlow').setDescription(description||' ').setColor(color||'#ffcc00').setFooter({text:'AG | AfterGlow'}).setTimestamp();
    await channel.send({ embeds: [embed] });
    res.send('✅ Enviado a #' + channel.name);
  } catch(e){ res.send('❌ Error: '+e.message); }
});

client.on('ready', () => console.log('BOT ONLINE: ' + client.user.tag));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('WEB ONLINE en puerto ' + PORT);
});

client.login(process.env.TOKEN);
