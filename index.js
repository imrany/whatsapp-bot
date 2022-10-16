const { default: axios } = require('axios');
const qrcode = require('qrcode-terminal');
const express=require('express');
const cors=require('cors');

const app=express();
app.use(cors());

const port=process.env.PORT||5000;
app.listen(port,()=>{
console.log(`Server running on port ${port}`);
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const $server=new Client({
        authStrategy: new LocalAuth()
    });
    /*$server.on('qr', qr => {
       qrcode.generate(qr, {small: true});
       app.get('/',async(req,res)=>{
        try{
            res.json(`${qr}`);
        } catch(err){
            console.log(err.message);
        }
    })
    });*/
    
    $server.on('ready', () => {
        console.log('Client is ready!');
    });
    
    $server.initialize();
    $server.on('message',async message => {
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
            Hello, Imran is not available.
            you are talking to his chatbot.
            my name is *Antonne*💀..
            To proceed type *.commands*
            `);
        }
        if(content === '.goodnight') {
            message.reply(`
            Who the fuck do you think you are?
            i go sleep when i want to!!
            *LOSER🤣🤣*
            `);
        }
        if(content === '.meme') {
           try {
            message.react('😁');
            const meme=await axios("https://meme-api.herokuapp.com/gimme").then(res=>res.data);
            message.reply(await MessageMedia.fromUrl(meme.url));
           } catch (error) {
            message.reply("I'm out of memes");
           }
        } else if(content === '.joke') {
            try {
                message.react('😩');
                const joke=await axios("https://v2.jokeapi.dev/joke/Any?safe-mode").then(res=>res.data);
                const jokeMsg=await $server.sendMessage(message.from,joke.setup||joke.joke);
                if(joke.delivery) setTimeout(()=>{jokeMsg.reply(joke.delivery)},5000);
            } catch (error) {
                $server.sendMessage(message.from,'Try next time🤣');
            }
        }
    });
});


