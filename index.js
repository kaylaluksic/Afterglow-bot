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
<title>AG Carl Style</title>
<style>
body{background:#2b2d31;color:#fff;font-family:sans-serif;padding:15px;max-width:600px;margin:auto}
.card{background:#313338;padding:15px;border-radius:8px;margin-bottom:15px;border:1px solid #3a3a3a}
input,textarea{width:100%;padding:10px;margin:6px 0;background:#2b2d31;border:1px solid #404040;color:#fff;border-radius:4px;box-sizing:border-box}
label{font-size:11px;color:#b5bac1;font-weight:bold;text-transform:uppercase}
button{width:100%;padding:14px;background:#5865F2;color:#fff;border:none;border-radius:4px;font-weight:bold;font-size:16px}
</style>
</head>
<body>
<h2 style="text-align:center">AG | Carl Style</h2>
<div class="card">
<label>ID Canal *</label><input id="channel" placeholder="ID del canal">
<label>Contenido fuera del embed ( @everyone )</label><input id="content" placeholder="@everyone opcional">
</div>
<div class="card">
<label>Titulo</label><input id="title" placeholder="📢 ANUNCIO">
<label>Descripcion</label><textarea id="desc" rows="4" placeholder="Descripcion con **negrita**"></textarea>
<label>Color</label><input id="color" type="color" value="#ffcc00">
<label>Autor</label><input id="author" placeholder="AfterGlow">
<label>Thumbnail (icono chico)</label><input id="thumb" placeholder="https://...">
<label>Imagen grande</label><input id="image" placeholder="https://...">
<label>Footer</label><input id="footer" value="AG | AfterGlow">
</div>
<button onclick="send()">ENVIAR</button>
<p id="msg" style="text-align:center"></p>
<script>
async function send(){
  document.getElementById('msg').innerText='Enviando...';
  const body={title:document.getElementById('title').value,description:document.getElementById('desc').value,color:document.getElementById('color').value,author:document.getElementById('author').value,thumbnail:document.getElementById('thumb').value,image:document.getElementById('image').value,footer:document.getElementById('footer').value,content:document.getElementById('content').value,channelId:document.getElementById('channel').value};
  const r=await fetch('/send',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  document.getElementById('msg').innerText=await r.text();
}
</script>
</body>
</html>
`);
});

app.post('/send', async (req, res) => {
  try {
    const { content, title, description, color, author, thumbnail, image, footer, channelId } = req.body;
    const channel = await client.channels.fetch(channelId);
    const embed = new EmbedBuilder().setColor(color || '#ffcc00');
    if (title) embed.setTitle(title);
    if (description) embed.setDescription(description);
    if (author) embed.setAuthor({ name: author });
    if (thumbnail) embed.setThumbnail(thumbnail);
    if (image) embed.setImage(image);
    if (footer) embed.setFooter({ text: footer });
    embed.setTimestamp();
    await channel.send({ content: content || null, embeds: [embed] });
    res.send('✅ Enviado a #' + channel.name);
  } catch (e) {
    res.send('❌ Error: ' + e.message);
  }
});

client.on('ready', () => console.log('BOT ONLINE ' + client.user.tag));
app.listen(process.env.PORT || 3000, '0.0.0.0', () => console.log('WEB ONLINE'));
client.login(process.env.TOKEN);
