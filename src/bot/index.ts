import makeWASocket, { DisconnectReason, getContentType, useMultiFileAuthState } from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
// import { fileURLToPath } from 'url';
import { config } from "dotenv";
import { sessionName } from "../../config.json"
import path from "path";
import { checkCommandAndRespond } from './commands';
config();

const API_URL=process.env.API_URL
export let qrcodeData:string

export async function connectToWhatsApp () {
  // Set up the file for storing auth state
  // const __filename = fileURLToPath(import.meta.url);
  // const __dirname = path.dirname(__filename);
  // const authFilePath = path.join(__dirname, 'auth_info.json');
  // const { state, saveState } = useSingleFileAuthState(authFilePath);

  // utility function to help save the auth state in a single folder
  // this function serves as a good guide to help write auth & key states for SQL/no-SQL databases, which I would recommend in any production grade system
  const { state, saveCreds } = await useMultiFileAuthState(path.resolve(`${sessionName}-session`))
  // will use the given state to connect
  // so if valid credentials are available -- it'll connect without QR

  const sock = makeWASocket({
    // can provide additional config here
    printQRInTerminal: true,
    auth: state
  })
  // this will be called as soon as the credentials are updated
  sock.ev.on ('creds.update', saveCreds)

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr }:any= update
    qrcodeData=qr
    console.log("qr-details:", qrcodeData)
    if(connection === 'close') {
      let reason = (lastDisconnect.error as Boom)?.output?.statusCode
      if (reason === DisconnectReason.badSession) {
        console.log(`Bad Session File, Please Delete ${sessionName}-session and Scan Again`)
        sock.logout()
      } else if (reason === DisconnectReason.connectionClosed) {
        console.log('Connection closed, reconnecting....')
        connectToWhatsApp()
      } else if (reason === DisconnectReason.connectionLost) {
        console.log('Connection Lost from Server, reconnecting...')
        connectToWhatsApp()
      } else if (reason === DisconnectReason.connectionReplaced) {
        console.log('Connection Replaced, Another New Session Opened, Please Close Current Session First')
        sock.logout()
      } else if (reason === DisconnectReason.loggedOut) {
        console.log(`Device Logged Out, Please Delete ${sessionName}-session and Scan Again.`)
        sock.logout()
      } else if (reason === DisconnectReason.restartRequired) {
        console.log('Restart Required, Restarting...')
        connectToWhatsApp()
      } else if (reason === DisconnectReason.timedOut) {
        console.log('Connection TimedOut, Reconnecting...')
        connectToWhatsApp()
      } else {
        const error=`Unknown DisconnectReason: ${reason}|${lastDisconnect.error}`
        sock.end({name:error,message:error})
      }

      // const shouldReconnect = (lastDisconnect.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
      // console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
      // // reconnect if not logged out
      // if(shouldReconnect) {
      //     connectToWhatsApp()
      // }
    } else if(connection === 'open') {
      console.log('opened connection')
    }
  })

  // Event: Messages received
  sock.ev.on('messages.upsert', async(m)=> {
    const isbot=m.messages[0].key.fromMe //true or false
    const msg = m.messages[0]; // received message
    const from:any = msg.key.remoteJid; // 254700000000@s.whatsapp.net
    const isGroup = from.endsWith('@g.us'); // 254700000000@g.us
    const isNewsLetter = from.endsWith('@newsletter'); // 120363162145046745@newsletter
    const isBroadcast = from.endsWith('@broadcast'); // status@broadcast
    const type=m.type
    // const type = getContentType(msg.message)


    if (!msg.message) return; // Ignore system messages
    if (isNewsLetter||isBroadcast) return; // Ignore news letter messages/ updates or broadcast
    if (type !== 'notify') return

    // Extract message content
    const content =
    msg.message.conversation ||
    msg.message.extendedTextMessage?.text ||
    msg.message.imageMessage?.caption;

    console.log( `From: ${from}`, `isbot: ${isbot}`,`Type: ${type}`,`Message received: ${content}`);
    // auto reply
    // if(!isbot){
      if (content) {
        if (!isGroup) {
          // Send a reply for private messages
          checkCommandAndRespond(m,sock)
        } else {
          // Example for groups: reply only to tagged messages 
          const bot:any=sock.user //bot's whatsapp account
          if (msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.includes(bot.id)) {
            await sock.sendMessage(from, {
              text: `Hello! I'm not available.\n You mentioned me.`,
            });
          }
        }
      }
    // }else{
    //   console.log("Texting yourself")
    // }
  })
  return sock;
}