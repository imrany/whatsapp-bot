const { default: axios } = require('axios');
const qrcode = require('qrcode-terminal');

const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.initialize();
client.on('message',async message => {
    const content=message.body;
    if(content === '.commands') {
		message.reply(message.from,`
         hy
        .ping
        .meme
        `);
	}
    if(content === 'hy') {
        message.reply('hy too, I am available...speak.');
    }
	if(content === '.ping') {
		client.sendMessage(message.from,'pong');
	}
	if(content === '.meme') {
        const meme=await axios("https://meme-api.herokuapp.com/gimme").then(res=>res.data);
		client.sendMessage(message.from,await MessageMedia.fromUrl(meme.url));
	}
});