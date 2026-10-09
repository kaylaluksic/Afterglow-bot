const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const client = new Client({ intents: [3276799] });

client.on('ready', () => {
  console.log(`✅ ${client.user.tag} ONLINE 24/7`);
  client.user.setActivity('AG | AfterGlow', { type: 3 });
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '!ping') {
    return message.reply(`🏓 Pong! ${client.ws.ping}ms - 24/7`);
  }

  if (message.content === '!help') {
    const embed = new EmbedBuilder()
     .setTitle('📋 AfterGlow Bot - Comandos')
     .setColor('#2b2d31')
     .setDescription('!ping - ver latencia\n!help - este menu\n!info - info del server')
     .setFooter({ text: 'AG | AfterGlow - 24/7' });
    return message.reply({ embeds: [embed] });
  }

  if (message.content === '!info') {
    return message.reply(`👥 ${message.guild.memberCount} miembros en ${message.guild.name}`);
  }
});

client.login(process.env.TOKEN);
