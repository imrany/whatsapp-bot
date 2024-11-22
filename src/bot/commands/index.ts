import { downloadContentFromMessage, getContentType } from "@whiskeysockets/baileys";
import * as TD from "better-tord";
import { uploadByBuffer, uploadByUrl } from "telegraph-uploader";
import { AiHandle, deleteBotMsgHandle, getLyricsHandle, githubSearchHandle, googleSearchHandle, makeStickerHandle, reactionHandle, sadCatHandle, searchImageHandle, stickerToMedia, ytsearchHandle } from "../handles";

export async function checkCommandAndRespond(m:any, sock:any) {
    const msg = m.messages[0]; // received message
    const from:any = msg.key.remoteJid; // 254700000000@s.whatsapp.net
    const type:any = getContentType(msg.message)
    const quotedType = getContentType(msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) || null
    const botId = sock.user.id.includes(':') ? sock.user.id.split(':')[0] + '@s.whatsapp.net' : sock.user.id
    console.log(`Bot id: ${botId}, Type: ${type}, quotedType:${quotedType}`)


    // Extract message content
    const content = type == 'conversation' ? msg.message?.conversation : msg.message[type]?.caption || msg.message[type]?.text || ''
    // const content =
    // msg.message.conversation ||
    // msg.message.extendedTextMessage?.text ||
    // msg.message.imageMessage?.caption; // ".ai what is code?"

    const command=content.slice(1).trim().split(' ').shift().toLowerCase() // result "ai"
    const text = content.replace(command, '').slice(1).trim(); //"what is code?"
    const args = content.trim().split(' ').slice(1)
    //Types of messages
    const isImage = type == 'imageMessage'
    const isVideo = type == 'videoMessage'
    const isAudio = type == 'audioMessage'
    const isSticker = type == 'stickerMessage'
    const isContact = type == 'contactMessage'
    const isLocation = type == 'locationMessage'

    const isQuoted = type == 'extendedTextMessage'
    const isQuotedImage = isQuoted && quotedType == 'imageMessage'
    const isQuotedVideo = isQuoted && quotedType == 'videoMessage'
    const isQuotedAudio = isQuoted && quotedType == 'audioMessage'
    const isQuotedSticker = isQuoted && quotedType == 'stickerMessage'
    const isQuotedContact = isQuoted && quotedType == 'contactMessage'
    const isQuotedLocation = isQuoted && quotedType == 'locationMessage'

    let mediaType = type
    let stream:any
    if (isQuotedImage || isQuotedVideo || isQuotedAudio || isQuotedSticker) {
        mediaType = quotedType
        msg.message[mediaType] = msg.message.extendedTextMessage.contextInfo.quotedMessage[mediaType]
        stream = await downloadContentFromMessage(msg.message[mediaType], mediaType.replace('Message', ''))
            .catch(console.error)
    }

    const reply = async (text:string) => {
        return sock.sendMessage(from, {
            text: text
        }, {
            quoted: msg
        })
    }
    const bufferToUrl = async (buffer:any) => {
        const data = await uploadByBuffer(buffer)
        return data
    }

    switch (command) {
        case "ai": {
                if(!text){
                    reply('👽 Provide a prompt!')
                    return;
                }
                await  AiHandle(text, from, sock, msg);
            }
            break;
        case "google": {
                if (!text) {
                    reply('👽 Provide a search term!')
                    return;
                }
                await googleSearchHandle(text, from, sock,msg)
            }
            break;
        case "githubsearch":
        case "github": {
                if (!text) {
                    reply('👽 Provide a search term!')
                    return;
                }
                await githubSearchHandle(text,from,sock,msg)
            }
            break;
        case "dare": {
                let dare = TD.get_dare();
                reply(dare);
            }
            break
        case "truth": {
                let truth = TD.get_truth();
                reply(truth);
            }
            break;
        case "sadcat": {
                if (!text) {
                    reply('👽 Provide a the search term!')
                    return;
                }
                await sadCatHandle(text,from,sock,msg)
            }
            break;
        case "lyrics": {
                if (!text) {
                    reply('👽 Provide a the search term!')
                    return;
                }
                await getLyricsHandle(text,from,sock,msg)
            }
            break;
        case 'del':
        case 'delete': {
                if (!msg.message.extendedTextMessage) {
                    reply("👽 Tag message to delete.");
                    return;
                }
                await deleteBotMsgHandle(text,from,sock,msg,botId)            
            }
            break
        case 'cry':
        case 'kiss':
        case 'bully':
        case 'hug':
        case 'lick':
        case 'cuddle':
        case 'pat':
        case 'smug':
        case 'highfive':
        case 'bonk':
        case 'yeet':
        case 'blush':
        case 'wave':
        case 'smile':
        case 'handhold':
        case 'nom':
        case 'bite':
        case 'glomp':
        case 'kill':
        case 'slap':
        case 'cringe':
        case 'kick':
        case 'wink':
        case 'happy':
        case 'poke':
        case 'punch':
        case 'dance': {
                await reactionHandle(text,from,sock,msg)
            }
            break;
        case 'sticker':
        case 's': {
                await makeStickerHandle(text, from, sock, msg, type, args)
            }
            break
        case 'image': {
                if (!isQuoted) {
                    reply("👽 Give a sticker to convert into media!");
                    return;
                }
                await stickerToMedia(text, from, sock, msg, type, args)
            }
            break
        case "imagesearch":
        case "img": {
                if (!text) {
                    reply('👽 Provide a search term!')
                    return;
                }
                await searchImageHandle(text, from, sock, msg, type, args)
            }
            break
        case 'ytsearch':
        case 'yts': {
                if (!text) {
                    reply('Crownus👽\n Provide a search term!')
                    return;
                }
                await ytsearchHandle(text,reply)
            }
            break;
        default:
            break;
    }
}
