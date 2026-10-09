const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const express = require('express');
const app = express();
const client = new Client({ intents: [3276799] });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// PAGINA WEB PARA CREAR EMBEDS
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>AfterGlow - Embed Builder</title>
<style>
body{background:#313338;color:white;font-family:sans-serif;padding:20px}
input,textarea,select{width:100%;padding:12px;margin:8px 0;background:#2b2d31;border:none;color:white;border-radius:8px}
button{width:100%;padding:15px;background:#5865F2;color:white;border:none;border-radius:8px;font-size:16px;font-weight:bold;cursor:pointer}
.preview{background:#2b2d31;border-left:4px solid #ffcc00;padding:15px;border-radius:8px;margin-top:15px}
label{font-size:12px;color:#b5bac1;font-weight:bold}
</style>
</head>
<body>
<h2>🎨 AG | AfterGlow - Embed Builder</h2>
<label>Titulo del Embed</label>
<input id="title" placeholder="Ej: 📢 ANUNCIO">
<label>Descripción (puedes usar **negrita**)</label>
<textarea id="desc" rows="4" placeholder="Ej: Hoy torneo a las 21:00"></textarea>
<label>Color</label>
<input id="color" type="color" value="#ffcc00">
<label>Imagen (URL opcional)</label>
<input id="image" placeholder="https://...">
<label>Thumbnail (icono pequeño)</label>
<input id="thumb" placeholder="https://...">
<label>ID del Canal donde enviar</label>
<input id="channel" placeholder="Ej: 123456789... (click derecho al canal > Copiar ID)">

<button onclick="sendEmbed()">ENVIAR EMBED AL DISCORD</button>

<div id="preview" class="preview">
<b id="pTitle">Vista previa</b><br><span id="pDesc">Aquí verás tu embed</span>
</div>

<script>
function updatePreview(){
  document.getElementById('pTitle').innerText = document.getElementById('title').value || 'Vista previa';
  document.getElementById('pDesc').innerText = document.getElementById('desc').value || 'Descripción...';
}
document.getElementById('title').oninput = updatePreview;
document.getElementById('desc').oninput = updatePreview;

async function sendEmbed(){
  const data = {
    title: document.getElementById('title').value,
    description: document.getElementById('desc').value,
    color: document.getElementById('color').value,
    image: document.getElementById('image').value,
    thumbnail: document.getElementById('thumb').value,
    channelId: document.getElementById('channel').value
  };
  const res = await fetch('/send', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) });
  const text = await res.text();
  alert(text);
}
</script>
</body>
</html>
  `);
});

// RECIBE EL EMBED DE LA PAGINA Y LO ENVIA A DISCORD
app.post('/send', async (req, res) => {
  try {
    const { title, description, color, image, thumbnail, channelId } = req.body;
    const channel = await client.channels.fetch(channelId);
    if (!channel) return res.send('❌ ID de canal no valido');

    const embed = new EmbedBuilder()
    .setTitle(title || 'AfterGlow')
    .setDescription(description || ' ')
    .setColor(color || '#ffcc00')
    .setFooter({ text: 'AG | AfterGlow' })
    .setTimestamp();

    if (image) embed.setImage(image);
    if (thumbnail) embed.setThumbnail(thumbnail);

    await channel.send({ embeds: [embed] });
    res.send('✅ Embed enviado con éxito a ' + channel.name);
  } catch (e) {
    console.error(e);
    res.send('❌ Error: ' + e.message);
  }
});

client.on('ready', () => console.log(`✅ Bot ${client.user.tag} online`));
client.login(process.env.TOKEN);

app.listen(process.env.PORT || 3000, () => console.log('🌐 Web online'));
