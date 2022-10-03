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
		message.reply(`
        (*List of commands to use*)
        >.hello - calls out the bot.
        >.joke - generate random jokes.
        >.meme - generates random memes.
        >.goodnight - sleeps the bot.
        `);
	}
    if(content === '.hello') {
        message.reply(`
        Hello, Imran is not available...you are talking to his chatbot.
        my name is Antonne💀..To proceed type *.commands*
        `);
    }
    if(content === '.goodnight') {
        message.reply(`
        What the fuck do you think you are?...i go sleep when i want to!!
        *LOSER🤣🤣*
        `);
    }
	if(content === '.meme') {
        const meme=await axios("https://meme-api.herokuapp.com/gimme").then(res=>res.data);
		client.sendMessage(message.from,await MessageMedia.fromUrl(meme.url));
	} else if(content === '.joke') {
        const joke=await axios("").then(res=>res.data);
        const jokeMsg=await client.sendMessage(message.from,joke.setup||joke.joke);
        if(joke.delivery) setTimeout(()=>{jokeMsg.reply(joke.delivery)},5000)
    }
});