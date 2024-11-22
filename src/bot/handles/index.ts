import axios from 'axios';
import { Client } from "genius-lyrics";
import { sessionName } from "../../../config.json"
import { config } from "dotenv";
import * as fs from "fs";
import { downloadContentFromMessage, getContentType } from '@whiskeysockets/baileys';
import Sticker, { StickerTypes } from 'wa-sticker-formatter';
import * as gis from "g-i-s";
import yts from "yt-search";
import { writeFile } from 'fs/promises';
config()

const client = new Client();
const API_URL=process.env.API_URL
export async function AiHandle(text:string, from:string, sock:any,msg:any) {
  try {
    const response = await axios.post(`${API_URL}/api/md`, { prompt: text });
    const data = response.data;
  
    if (data.error) {
      console.log(data.error);
      await sock.sendMessage(from, {
        text: `Error: ${data.error}`,
      }, {
        quoted: msg
      });
    } else {
      await sock.sendMessage(from, {
        text: data,
      }, {
        quoted: msg
      });
    }
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
      reply(`Crownus👽\n Can't find a match : *${text}*!!`)
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