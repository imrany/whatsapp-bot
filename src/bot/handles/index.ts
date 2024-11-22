import axios from 'axios';
import { Client } from "genius-lyrics";
import { sessionName } from "../../../config.json"
import { config } from "dotenv";
import * as fs from "fs";
import { downloadContentFromMessage, getContentType } from '@whiskeysockets/baileys';
import Sticker, { StickerTypes } from 'wa-sticker-formatter';
import * as gis from "g-i-s";
import yts from "yt-search";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { writeFile } from 'fs/promises';
import ytdl from 'ytdl-core';
import wiki from 'wikipedia';
config()

const client = new Client();
let apiKey:any=process.env.API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export async function AiHandle(text:string, from:string, sock:any,msg:any) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    const result = await model.generateContent(text);
    const response = result.response;
    let markdown=response.text()

    await sock.sendMessage(from, {
      text: markdown,
    }, {
      quoted: msg
    });
  } catch (error:any) {
    console.error('Request failed:', error);
    await sock.sendMessage(from, {
        text: `Error: ${error.message}`,
    }, {
      quoted: msg
    });
  }
}

export async function googleSearchHandle(text:string, from:string, sock:any, msg:any) {
  try {
    let { data } = await axios.get(`https://www.googleapis.com/customsearch/v1?q=${text}&key=AIzaSyDMbI3nvmQUrfjoCJYLS69Lej1hSXQjnWI&cx=baf9bdb0c631236e5`)
    if (data.items.length == 0) {
      await sock.sendMessage(from, {
        text: `Unable to find any result 👽`,
      }, {
        quoted: msg
      });
      return;
    }

    let tex = `GOOGLE SEARCH 👽\n🔍 Term ~> ${text}\n\n`;
    for (let i = 0; i < data.items.length; i++) {
      tex += `🪧 Title ~> ${data.items[i].title}\n🖥 Description ~> ${data.items[i].snippet}\n🌐 Link ~> ${data.items[i].link}\n\n`
    }
    await sock.sendMessage(from, {
        text: tex,
    }, {
      quoted: msg
    });
  } catch (error:any) {
    console.error('Request failed:', error);
    await sock.sendMessage(from, {
        text: `Error: ${error.message}`,
    }, {
      quoted: msg
    });
  }
}

export async function githubSearchHandle(text:string, from:string, sock:any, msg:any) {
  try {
    let { data:repo } = await axios.get(`https://api.github.com/search/repositories?q=${text}`)
    if (repo.items.length == 0) {
      await sock.sendMessage(from, {
        text: `Unable to find any result 👽`,
      }, {
        quoted: msg
      });
      return;
    }

    let tex = `GITHUB SEARCH👽 \n🔍 Term ~> ${text}\n\n`;
    for (let i = 0; i < repo.items.length; i++) {
      tex += `🪧 Name ~> ${repo.items[i].name}\n👤 Watchers ~> ${repo.items[i].watchers_count}\n⭐️ Stars ~> ${repo.items[i].stargazers_count}\n📛 Forks ~> ${repo.items[i].forks_count}\n🖥 Description ~> ${repo.items[i].description}\n🌐 Link ~> ${repo.items[i].html_url}\n\n`
    }
    await sock.sendMessage(from, {
      text: tex,
    }, {
      quoted: msg
    });
  } catch (error:any) {
    console.error('Request failed:', error);
    await sock.sendMessage(from, {
        text: `Error: ${error.message}`,
    }, {
      quoted: msg
    });
  }
}

export async function sadCatHandle(text:string, from:string, sock:any, msg:any) {
  try {
    let response= await axios.get(`https://api.popcat.xyz/sadcat?text=${text}`, {
      responseType: 'arraybuffer'
    })
    const buffer = Buffer.from(response.data, "utf-8");

    await sock.sendMessage(from, {
      image: buffer,
      caption: `${sessionName}👽`
    }, {
      quoted: msg
    });
  } catch (error:any) {
    console.error('Request failed:', error);
    await sock.sendMessage(from, {
        text: `Error: ${error.message}`,
    }, {
      quoted: msg
    });
  }
}

export async function getLyricsHandle(text:string, from:string, sock:any, msg:any) {
  try {
    const search = await client.songs.search(text);
    const Song = search[0];
    const lyrics = await Song.lyrics();
    await sock.sendMessage(from, {
      text:lyrics
    }, {
      quoted: msg
    });
  } catch (error:any) {
    console.error('Request failed:', error);
    await sock.sendMessage(from, {
      text: `No lyrics found for ${text}`,
    }, {
      quoted: msg
    });
  }
}

export async function deleteBotMsgHandle(text:string, from:string, sock:any, msg:any,botId:string) {
  //only bot messages, anyone can delete
  if (msg.message.extendedTextMessage.contextInfo.participant == botId) {
    const options = {
        remoteJid: botId,
        fromMe: true,
        id: msg.message.extendedTextMessage.contextInfo.stanzaId,
    };
    await sock.sendMessage(from, {
        delete: options,
    });
    return;
  } else {
    await sock.sendMessage(from, {
      text: `👽 Only bot message can be delete.`,
    }, {
      quoted: msg
    });
  }
}

export async function reactionHandle(text:string, from:string, sock:any, msg:any) {
  const sender=from.endsWith('@g.us') ? msg.key.participant : from
  let mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
  const Reactions:any = {
    cry: 'Cried with',
    kiss: 'Kissed',
    punch: 'punched',
    bully: 'Bullied',
    hug: 'Hugged',
    lick: 'Licked',
    cuddle: 'Cuddled with',
    pat: 'Patted',
    smug: 'Smugged at',
    highfive: 'High-fived',
    bonk: 'Bonked',
    yeet: 'Yeeted',
    blush: 'Blushed at',
    wave: 'Waved at',
    smile: 'Smiled at',
    handhold: 'is Holding Hands with',
    nom: 'is Eating with',
    bite: 'Bit',
    glomp: 'Glomped',
    kill: 'Killed',
    slap: 'Slapped',
    cringe: 'Cringed at',
    kick: 'Kicked',
    wink: 'Winked at',
    happy: 'is Happy with',
    poke: 'Poked',
    dance: 'is Dancing with'
  }
  let { data: gi } = await axios.get(`https://g.tenor.com/v1/search?q=${text}&key=LIVDSRZULELA&limit=8`)
  let arr = []
  let user2:any
  arr.push(sender)
  try {
    user2 = msg.message.extendedTextMessage.contextInfo.participant || mentioned[0] || undefined
  } catch {
    user2 = sender
  }
  arr.push(user2)
  let rec = `@${sender.split("@")[0]} ${Reactions[text]} @${user2.split("@")[0]}`
  sock.sendMessage(from, {
    video: {
        url: gi.results?.[Math.floor(Math.random() * gi.results.length)]?.media[0]?.mp4?.url
    },
    caption: rec,
    gifPlayback: true,
    mentions: arr
  }, {
    quoted: msg
  })
}

export async function makeStickerHandle(text:string, from:string, sock:any, msg:any, type:any, args:string) {
  const isQuoted = type == 'extendedTextMessage'
  const quotedType = getContentType(msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) || null
  const isImage = type == 'imageMessage'
  const isVideo = type == 'videoMessage'
  const isQuotedImage = isQuoted && quotedType == 'imageMessage'
  const isQuotedVideo = isQuoted && quotedType == 'videoMessage'
  let anu:any
  let authorName:any
  let packName:any
  if (text) {
      anu = text.split('|')
      packName = anu[0] !== '' ? anu[0] : "Crownus👽"
      authorName = anu[1] !== '' ? anu[1] : "Crownus👽"
  } else {
      packName = "Crownus👽";
      authorName = "Crownus👽";
  }
  const getRandom = (ext:string) => {
      return `${Math.floor(Math.random() * 10000)}${ext}`;
  };
  const stickerFileName = getRandom(".webp");
  let stickerMake:any;
    
  //for image
  if (isImage || isQuotedImage) {
    let downloadFilePath;
    if (msg.message.imageMessage) {
      downloadFilePath = msg.message.imageMessage;
    } else {
      //tagged image
      downloadFilePath=msg.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
    }

    //for images
    const stream = await downloadContentFromMessage(downloadFilePath, "image");
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
        
    stickerMake = new Sticker(buffer, {
      pack: packName,
      author: authorName,
      type: args.includes("--crop") || args.includes("--c") ? StickerTypes.CROPPED : StickerTypes.FULL,
      quality: 100,
    });
  } else if (isVideo || isQuotedVideo) {
    //for videos
    let downloadFilePath;
    if (msg.message.videoMessage) {
      downloadFilePath = msg.message.videoMessage;
    } else {
      downloadFilePath = msg.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage;
    }
    const stream = await downloadContentFromMessage(downloadFilePath, "video");
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    
    stickerMake = new Sticker(buffer, {
      pack: packName, // The pack name
      author: authorName, // The author name
      type: args.includes("crop") || args.includes("c") ? StickerTypes.CROPPED : StickerTypes.FULL,
      quality: 40,
    });
  } else {
    await sock.sendMessage(from, {
      text: `👽  Give a media to convert into sticker!`,
    }, {
      quoted: msg
    });
    return;
  }
                    
  await stickerMake.toFile(stickerFileName);
  await sock.sendMessage(
    from, {
      sticker: fs.readFileSync(stickerFileName),
    }, {
      quoted: msg
    }
  );
  try {
    fs.unlinkSync(stickerFileName);
  } catch {
    console.log("error in deleting file.");
  }
}

export async function stickerToMedia(text:string, from:string, sock:any, msg:any, type:any, args:string) {
  const quotedType = getContentType(msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) || null
  const isSticker = type == 'stickerMessage'
  const isQuoted = type == 'extendedTextMessage'
  const isQuotedSticker = isQuoted && quotedType == 'stickerMessage'

  const getRandom = (ext:string) => {
    return `${Math.floor(Math.random() * 10000)}${ext}`;
  };

  if ((isSticker && !msg.message.stickerMessage.isAnimated) || isQuotedSticker) {
    let downloadFilePath;
    if (msg.message.stickerMessage) {
      downloadFilePath = msg.message.stickerMessage;
    } else {
      downloadFilePath =msg.message.extendedTextMessage.contextInfo.quotedMessage.stickerMessage;
    }
    const stream = await downloadContentFromMessage(downloadFilePath, "image");
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    const media = getRandom(".jpeg");
    await writeFile(media, buffer);
    
    sock.sendMessage(
      from, {
        image: fs.readFileSync(media),
      }, {
        mimetype: "image/png",
        quoted: msg,
      }
    );
    
    fs.unlinkSync(media);
  } else {
    await sock.sendMessage(from, {
      text: `👽 There is some problem!\nTag a non-animated sticker with command to convert to Image!`,
    }, {
      quoted: msg
    });
  }
}

export async function searchImageHandle(text:string, from:string, sock:any, msg:any, type:any, args:string){
  try {
    const prefix="."
    if (!text) {
        let message = `👽 Query is not given! \nSend ${prefix}is query`;
        await sock.sendMessage(from, {
            text: message
        }, {
            quoted: msg
        });
        return;
    }
    
    let name = text;
    
    gis(name, async (error:any, results:any) => {
        if (error) {
          console.log(error);
          await sock.sendMessage(from, {
            text: error
          }, {
              quoted: msg
          });
        } else {
          let index = 0;
          if (results.length >= 10) {
              index = Math.floor(Math.random() * 10);
          }
          let img = results[index]["url"];
          console.log(img);
            
          try {
            sock.sendMessage(
              from, {
                image: {
                    url: img
                },
                caption: "Crownus👽"
              }, {
                quoted: msg
              }
            );
          } catch (err) {
            console.log(err)
            await sock.sendMessage(from, {
              text: `👽 Error in search!`
            }, {
                quoted: msg
            });
          }
        }
    });
  } catch (error:any) {
    await sock.sendMessage(from, {
      text: `Something bad happend\n${error.message}`
    }, {
      quoted: msg
    });
  }
}

export async function ytsearchHandle(text:string, reply:any) {
  const { videos } = await yts(text);
  if (!videos || videos.length <= 0) {
      reply(`Can't find a match : *${text}*!!`)
      return;
  }
  const length = videos.length < 10 ? videos.length : 10;
  let tex = `YOUTUBE SEARCH 👽\n🔍 Term ~> ${text}\n\n`;
  for (let i = 0; i < length; i++) {
      tex += `🌐 Link ~> ${videos[i].url}\n👤 Channel ~> ${videos[i].author.name}\n🖥 Title ~> ${videos[i].title}\n\n`;
  }
  reply(tex)
  return;
}

export async function playYtAudioHandle(text:string,from:string,sock:any,msg:any,reply:any, args:any){
  try {
    const { videos } = await yts(text);
    if (!videos || videos.length <= 0) {
        reply(`Can't find a match : *${args[0]}*!!`)
        return;
    }
    let urlYt = videos[0].url
    let infoYt = await ytdl.getInfo(urlYt);
    //30 MIN
    let period:any=infoYt.videoDetails.lengthSeconds
    if (period >= 1800) {
      reply(`Audio is too big!`);
      return;
    }
    const getRandom = (ext:string) => {
      return `${Math.floor(Math.random() * 10000)}${ext}`;
    };
    let titleYt = infoYt.videoDetails.title;
    let randomName = getRandom(".mp3");
    const stream = ytdl(urlYt, {
      filter: (info) => info.audioBitrate == 160 || info.audioBitrate == 128,
    }).pipe(fs.createWriteStream(`./${randomName}`));
    console.log("Audio downloading ->", urlYt);
    await new Promise((resolve, reject) => {
      stream.on("error", reject);
      stream.on("finish", resolve);
    });
    
    let stats = fs.statSync(`./${randomName}`);
    let fileSizeInBytes = stats.size;
    // Convert the file size to megabytes (optional)
    let fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);
    console.log("Audio downloaded ! Size: " + fileSizeInMegabytes);
    if (fileSizeInMegabytes <= 40) {
      //sendFile(from, fs.readFileSync(`./${randomName}`), msg, { audio: true, jpegThumbnail: (await getBuffer(dl.meta.image)).buffer, unlink: true })
      await sock.sendMessage(
        from, {
          document: fs.readFileSync(`./${randomName}`),
          mimetype: "audio/mpeg",
          fileName: titleYt + ".mp3",
        }, {
          quoted: msg
        }
      );
    } else {
      reply(`File size bigger than 40mb.`);
    }
    fs.unlinkSync(`./${randomName}`);
  } catch (e:any) {
    reply(e.toString())
  }
}

export async function getGIFHandle(text:string,from:string,sock:any,msg:any,reply:any){
  try {
    let { data: gi } = await axios.get(`https://g.tenor.com/v1/search?q=${text}&key=LIVDSRZULELA&limit=8`)
    sock.sendMessage(from, {
      video: {
        url: gi.results?.[Math.floor(Math.random() * gi.results.length)]?.media[0]?.mp4?.url
      },
      caption: "Crownus👽\nHere you go",
      gifPlayback: true
    }, {
      quoted: msg
    })
  } catch (err:any) {
    reply("Couldn't find")
    console.log(err)
  }
}

export async function wikipediaHandle(text:string,reply:any){
  try {
    const con = await wiki.summary(text);
    const tex = `Title:~> ${con.title}
          
Desc:~> ${con.description}

Summary:~> ${con.extract}

URL:~> ${con.content_urls.mobile.page}
`
    reply(tex)
  } catch (err:any) {
    console.log(err)
    return reply(`Your text isn't valid`)
  }
}

export async function factHandle(reply:any){
  try {
    const { data:response } =await axios.get(`https://nekos.life/api/v2/fact`)
    console.log(response);
    const tet = `📛Fact:~> ${response.fact}`
    reply(tet)
  } catch (error:any) {
    reply(`Cannot get a fact`)
  }
}

export async function showTypesOfReactionsHandle(senderName:string,reply:any) {
  reply(` Hi ${senderName}, I'm ${sessionName}👽 

    📛 *Reaction List*
    
    cry
    kiss
    bully
    hug
    lick
    cuddle
    pat
    smug
    highfive
    bonk
    yeet
    blush
    wave
    smile
    handhold
    nom
    bite
    glomp
    kill
    slap
    cringe
    kick
    wink
    happy
    poke
    punch
    dance
    
    -  _Let's React_ 🔰
    
    Support us by following us on GitHub:
    
    https://github.com/imrany/whatsapp-bot\n
    Support me through Mpesa Till number: 9655689
    `)
}

export async function definitionHandle(text:string,reply:any) {
  try {
    let def = await axios.get(`http://api.urbandictionary.com/v0/define?term=${text}`)
    if (!def) return reply(`${text} isn't a valid text`)
    const defi = `
Word:~> ${text}

Definition:~> ${def.data.list[0].definition
.replace(/\[/g, "")
.replace(/\]/g, "")}

💭 Example:~> ${def.data.list[0].example
.replace(/\[/g, "")
.replace(/\]/g, "")}
       `
    reply(defi)
  } catch (err:any) {
    console.log(err.toString())
    return reply("Sorry could not find the definition!")
  }
}

export async function adviceHandle(reply:any) {
  await axios
  .get(`https://api.adviceslip.com/advice`)
  .then((response) => {
      // console.log(response);
      const tet = `Advice for you:~> ${response.data.slip.advice}`
      reply(tet)
  })
  .catch((err) => {
      reply(`🔍 Error: ${err}`)
  })
}

export async function downloadYtVideoHandle(text:string,from:string,sock:any,msg:any,reply:any,args:any) {
  const prefix="."
  const getRandom = (ext:string) => {
    return `${Math.floor(Math.random() * 10000)}${ext}`;
  };
  if (args.length === 0) {
    reply(`URL is empty! \nSend ${prefix}ytv url`);
    return;
  }
  try {
    let urlYt = args[0];
    if (!urlYt.startsWith("http")) {
      reply(`Give youtube link!`);
      return;
    }
    let infoYt = await ytdl.getInfo(urlYt);
    //30 MIN
    const period:any=infoYt.videoDetails.lengthSeconds
    if (period >= 1800) {
      reply(`Video file too big!`);
      return;
    }
    let titleYt = infoYt.videoDetails.title;
    let randomName = getRandom(".mp4");
    
    const stream = ytdl(urlYt, { filter: (info) => info.itag == 22 || info.itag == 18,}).pipe(fs.createWriteStream(`./${randomName}`));
    console.log("Video downloading ->", urlYt);
    await new Promise((resolve, reject) => {
      stream.on("error", reject);
      stream.on("finish", resolve);
    });
    
    let stats = fs.statSync(`./${randomName}`);
    let fileSizeInBytes = stats.size;
    // Convert the file size to megabytes (optional)
    let fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);
    console.log("Video downloaded ! Size: " + fileSizeInMegabytes);
    if (fileSizeInMegabytes <= 100) {
      sock.sendMessage(
        from, {
          video: fs.readFileSync(`./${randomName}`),
          caption: `${titleYt}`,
        }, {
          quoted: msg
        }
      );
    } else {
      reply(`File size bigger than 40mb.`);
    }
    
    fs.unlinkSync(`./${randomName}`);
  } catch (e:any) {
    reply(e.toString())
  }
}

export async function downloadYtAudioHandle(text:string,from:string,sock:any,msg:any,reply:any,args:any) {
  const prefix="."
  const getRandom = (ext:string) => {
    return `${Math.floor(Math.random() * 10000)}${ext}`;
  };
  if (args.length === 0) {
      reply(`URL is empty! \nSend ${prefix}yta url`);
      return;
  }
  try {
    let urlYt = args[0];
    if (!urlYt.startsWith("http")) {
        reply(`Give youtube link!`);
        return;
    }
    let infoYt = await ytdl.getInfo(urlYt);
    const period:any=infoYt.videoDetails.lengthSeconds
    //30 MIN
    if (period >= 1800) {
      reply(`Video too big!`);
      return;
    }
    let titleYt = infoYt.videoDetails.title;
    let randomName = getRandom(".mp3");
    const stream = ytdl(urlYt, { filter: (info) => info.audioBitrate == 160 || info.audioBitrate == 128, }).pipe(fs.createWriteStream(`./${randomName}`));
    console.log("Audio downloading ->", urlYt);
    // reply("Downloading.. This may take upto 5 min!");
    await new Promise((resolve, reject) => {
      stream.on("error", reject);
      stream.on("finish", resolve);
    });
    
    let stats = fs.statSync(`./${randomName}`);
    let fileSizeInBytes = stats.size;
    // Convert the file size to megabytes (optional)
    let fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);
    console.log("Audio downloaded ! Size: " + fileSizeInMegabytes);
    if (fileSizeInMegabytes <= 40) {
      //sendFile(from, fs.readFileSync(`./${randomName}`), msg, { audio: true, jpegThumbnail: (await getBuffer(dl.meta.image)).buffer, unlink: true })
      await sock.sendMessage(
        from, {
          document: fs.readFileSync(`./${randomName}`),
          mimetype: "audio/mpeg",
          fileName: titleYt + ".mp3",
        }, {
          quoted: msg
        }
      );
    } else {
      reply(`File size bigger than 40mb.`);
    }
    fs.unlinkSync(`./${randomName}`);
  } catch (e:any) {
      reply(e.toString())
  }
}

export async function helpHandle(senderName:string,reply:any){
  try {
    reply(`Hi ${senderName}, I'm ${sessionName}👽 
    🤖 *Command List* 🤖

ℹ️ *Mods*:-

~> \`\`\`ytsearch, play, ytaudio, lyrics, ytvideo\`\`\`\
\n\n⭐️ *Fun*:-

~> \`\`\`reaction, truth, sadcat, dare, advise, fact\`\`\`\
\n\n💮 *Web*:-

~> \`\`\`githubsearch, github, google, upload, imagesearch, img, define, wikipedia, gify, sticker, image\`\`\`\
\n\n📛 *Moderation*:-

\n\n📗 *Note*~> Use this bot responsibly, I'm not liable for any misuse and misconduction.
\nSupport us by following us on GitHub:
\nhttps://github.com/imrany/whatsapp-bot
\n Till number: 9655689
`)
    return;
  } catch (e:any) {
    reply(e.message)
  }
}