const { Client, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const express = require('express');
const app = express();
app.use(express.json());
const client = new Client({ intents: 3276799 });

let giveaways = new Map(); // messageId -> { users: [], prize, channelId }
let warns = new Map(); // userId -> count

app.get('/', (req,res)=>{
res.send(`
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>AG Control Panel</title>
<style>
body{background:#2b2d31;color:#fff;font-family:sans-serif;padding:15px;max-width:650px;margin:auto}
.card{background:#313338;padding:15px;border-radius:8px;margin-bottom:15px;border:1px solid #3a3a3a}
input,textarea,select{width:100%;padding:10px;margin:6px 0;background:#2b2d31;border:1px solid #404040;color:#fff;border-radius:4px;box-sizing:border-box}
label{font-size:11px;color:#b5bac1;font-weight:bold;text-transform:uppercase}
button{padding:12px;border:none;border-radius:4px;font-weight:bold;cursor:pointer}
.tab{flex:1;background:#2b2d31;color:#949ba4}.tab.active{background:#5865F2;color:#fff}
.main{width:100%;background:#5865F2;color:#fff;font-size:16px;margin-top:10px}
.row{display:flex;gap:8px}
</style>
</head>
<body>
<h2 style="text-align:center">AFTERGLOW CONTROL PANEL</h2>
<div class="row" style="margin-bottom:15px">
<button class="tab active" onclick="showTab(1)" id="t1">📢 ANUNCIO</button>
<button class="tab" onclick="showTab(2)" id="t2">🎉 SORTEO</button>
<button class="tab" onclick="showTab(3)" id="t3">🎭 AUTO-ROL</button>
</div>
<div class="card">
<label>ID Canal Donde Enviar *</label>
<input id="channel" placeholder="ID del canal">
</div>

<div id="panel1" class="card">
<h3>📢 Tipo Anuncio (Carl-bot)</h3>
<label>Titulo</label><input id="a_title" placeholder="📢 TORNEO HOY">
<label>Descripcion</label><textarea id="a_desc" rows="4"></textarea>
<label>Color</label><input id="a_color" type="color" value="#ffcc00">
<label>Imagen Grande</label><input id="a_image" placeholder="https://... opcional">
<label>Mensaje fuera (@everyone)</label><input id="a_content" placeholder="@everyone">
<button class="main" onclick="sendAnuncio()">ENVIAR ANUNCIO</button>
</div>

<div id="panel2" class="card" style="display:none">
<h3>🎉 Tipo Sorteo</h3>
<label>Premio</label><input id="s_prize" placeholder="Ej: Rango VIP">
<label>Descripcion del sorteo</label><textarea id="s_desc" rows="3">Reacciona para participar!</textarea>
<label>Color</label><input id="s_color" type="color" value="#00ff88">
<label>Imagen del premio</label><input id="s_image" placeholder="https://...">
<button class="main" style="background:#00b37a" onclick="sendSorteo()">CREAR SORTEO CON BOTÓN</button>
<p style="font-size:12px;color:#b5bac1">Tendrá un botón de PARTICIPAR. Tú puedes ver quiénes participan en <a href="/participants" target="_blank" style="color:#00ff88">/participants</a></p>
</div>

<div id="panel3" class="card" style="display:none">
<h3>🎭 Tipo Auto-Rol (con botones)</h3>
<label>Titulo</label><input id="r_title" value="🎭 Elige tus roles">
<label>Descripcion</label><textarea id="r_desc" rows="3">Haz click en los botones para obtener roles</textarea>
<label>ID del Rol 1 (Click derecho al rol > Copiar ID) + Nombre Botón</label>
<div class="row"><input id="r1_id" placeholder="ID Rol 1"><input id="r1_name" placeholder="Ej: Minecraft"></div>
<label>ID del Rol 2</label>
<div class="row"><input id="r2_id" placeholder="ID Rol 2"><input id="r2_name" placeholder="Ej: Valorant"></div>
<label>ID del Rol 3</label>
<div class="row"><input id="r3_id" placeholder="ID Rol 3"><input id="r3_name" placeholder="Ej: Anuncios"></div>
<button class="main" style="background:#ff73fa;color:#000" onclick="sendRoles()">CREAR PANEL DE ROLES</button>
</div>

<p id="msg" style="text-align:center"></p>

<script>
function showTab(n){
  document.getElementById('panel1').style.display=n==1?'block':'none';
  document.getElementById('panel2').style.display=n==2?'block':'none';
  document.getElementById('panel3').style.display=n==3?'block':'none';
  document.getElementById('t1').className=n==1?'tab active':'tab';
  document.getElementById('t2').className=n==2?'tab active':'tab';
  document.getElementById('t3').className=n==3?'tab active':'tab';
}
async function post(url,data){
  document.getElementById('msg').innerText='Enviando...';
  const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
  document.getElementById('msg').innerText=await r.text();
}
function sendAnuncio(){ post('/send/announcement',{channelId:channel.value,title:a_title.value,description:a_desc.value,color:a_color.value,image:a_image.value,content:a_content.value}) }
function sendSorteo(){ post('/send/giveaway',{channelId:channel.value,prize:s_prize.value,description:s_desc.value,color:s_color.value,image:s_image.value}) }
function sendRoles(){ post('/send/autorole',{channelId:channel.value,title:r_title.value,description:r_desc.value,roles:[{id:r1_id.value,name:r1_name.value},{id:r2_id.value,name:r2_name.value},{id:r3_id.value,name:r3_name.value}]}) }
</script>
</body>
</html>
`);
});

app.get('/participants',(req,res)=>{
 let html='<body style="background:#2b2d31;color:#fff;font-family:sans-serif;padding:20px"><h2>🎉 Participantes Sorteos</h2>';
 for(let [mid,data] of giveaways){ html+=`<div style="background:#313338;padding:10px;margin:10px 0;border-radius:6px"><b>Premio: ${data.prize}</b><br>Mensaje: ${mid}<br>Participantes (${data.users.length}):<br>${data.users.map(u=>'<code>'+u.tag+'</code>').join('<br>') || 'Nadie aun'}<br><br><a href="/end/${mid}" style="color:#ff5555">Terminar sorteo y elegir ganador</a></div>`; }
 html+='</body>'; res.send(html);
});

app.get('/end/:id', async (req,res)=>{
 const g = giveaways.get(req.params.id);
 if(!g) return res.send('No existe');
 if(g.users.length==0) return res.send('Nadie participo');
 const winner = g.users[Math.floor(Math.random()*g.users.length)];
 const channel = await client.channels.fetch(g.channelId);
 await channel.send(`🎉 **SORTEO TERMINADO** 🎉 El ganador de **${g.prize}** es: <@${winner.id}>!!! Felicidades!`);
 res.send(`Ganador: ${winner.tag} - Anunciado en Discord`);
});

app.post('/send/announcement', async (req,res)=>{
 try{
  const {channelId,title,description,color,image,content}=req.body;
  const ch=await client.channels.fetch(channelId);
  const emb=new EmbedBuilder().setTitle(title||'Anuncio').setDescription(description||' ').setColor(color||'#ffcc00').setTimestamp();
  if(image) emb.setImage(image);
  emb.setFooter({text:'AG | AfterGlow'});
  await ch.send({content:content||null,embeds:[emb]});
  res.send('✅ Anuncio enviado');
 }catch(e){res.send('❌ '+e.message)}
});
app.post('/send/giveaway', async (req,res)=>{
 try{
  const {channelId,prize,description,color,image}=req.body;
  const ch=await client.channels.fetch(channelId);
  const emb=new EmbedBuilder().setTitle(`🎉 SORTEO: ${prize}`).setDescription(description).setColor(color||'#00ff88').setImage(image||null).setFooter({text:'Haz click en Participar'}).setTimestamp();
  const row=new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('giveaway_join').setLabel('🎉 PARTICIPAR').setStyle(ButtonStyle.Success));
  const msg=await ch.send({embeds:[emb],components:[row]});
  giveaways.set(msg.id,{prize,users:[],channelId});
  res.send('✅ Sorteo creado con botón');
 }catch(e){res.send('❌ '+e.message)}
});

app.post('/send/autorole', async (req,res)=>{
 try{
  const {channelId,title,description,roles}=req.body;
  const ch=await client.channels.fetch(channelId);
  const validRoles=roles.filter(r=>r.id&&r.name);
  const emb=new EmbedBuilder().setTitle(title).setDescription(description).setColor('#ff73fa').setTimestamp();
  const row=new ActionRowBuilder();
  for(let r of validRoles){ row.addComponents(new ButtonBuilder().setCustomId('autorole_'+r.id).setLabel(r.name).setStyle(ButtonStyle.Primary)); }
  await ch.send({embeds:[emb],components:[row]});
  res.send('✅ Panel de auto-rol creado');
 }catch(e){res.send('❌ '+e.message)}
});

client.on('ready',()=>console.log('BOT ONLINE '+client.user.tag));

client.on('messageCreate', async (msg)=>{
 if(msg.author.bot) return;
 if(msg.content==='!ping'){ msg.reply(`🏓 Pong! ${client.ws.ping}ms | Uptime bot AG`); }
 if(msg.content.startsWith('!warn')){
  if(!msg.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return msg.reply('❌ No tienes permiso');
  const user=msg.mentions.members.first();
  if(!user) return msg.reply('Menciona a alguien:!warn @usuario razon');
  let count=(warns.get(user.id)||0)+1; warns.set(user.id,count);
  msg.channel.send(`⚠️ ${user} tiene ${count} warns. Razón: ${msg.content.split(' ').slice(2).join(' ')}`);
  if(count>=3){ msg.guild.members.ban(user,{reason:'3 warns'}).catch(()=>{}); msg.channel.send(`🔨 ${user} baneado por 3 warns`); }
 }
 if(msg.content.startsWith('!kick')){
  if(!msg.member.permissions.has(PermissionsBitField.Flags.KickMembers)) return;
  const user=msg.mentions.members.first(); if(user) { user.kick(); msg.channel.send(`👢 ${user.user.tag} kickeado`); }
 }
 if(msg.content.startsWith('!ban')){
  if(!msg.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return;
  const user=msg.mentions.members.first(); if(user) { user.ban(); msg.channel.send(`🔨 ${user.user.tag} baneado`); }
 }
});

client.on('interactionCreate', async (i)=>{
 try{
  if(i.customId==='giveaway_join'){
   const g=giveaways.get(i.message.id);
   if(!g) return i.reply({content:'Sorteo expirado',ephemeral:true});
   if(g.users.find(u=>u.id===i.user.id)) return i.reply({content:'Ya participas!',ephemeral:true});
   g.users.push({id:i.user.id,tag:i.user.tag});
   i.reply({content:`✅ Entraste al sorteo de **${g.prize}**!`,ephemeral:true});
  }
  if(i.customId.startsWith('autorole_')){
   const roleId=i.customId.split('_')[1];
   const role=i.guild.roles.cache.get(roleId);
   if(!role) return i.reply({content:'Rol no encontrado',ephemeral:true});
   const has=i.member.roles.cache.has(roleId);
   if(has){ await i.member.roles.remove(roleId); i.reply({content:`❌ Rol **${role.name}** removido`,ephemeral:true}); }
   else { await i.member.roles.add(roleId); i.reply({content:`✅ Rol **${role.name}** agregado`,ephemeral:true}); }
  }
 }catch(e){ console.log(e); }
});

app.listen(process.env.PORT||3000,'0.0.0.0',()=>console.log('WEB ONLINE'));
client.login(process.env.TOKEN);
