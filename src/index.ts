import makeWASocket, { BufferJSON, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import { fileURLToPath } from 'url';
import axios from 'axios';
import { config } from "dotenv";
config();
import path from "path";
import * as fs from 'fs'

const API_URL=process.env.API_URL

async function connectToWhatsApp () {
    // Set up the file for storing auth state
    // const __filename = fileURLToPath(import.meta.url);
    // const __dirname = path.dirname(__filename);
    // const authFilePath = path.join(__dirname, 'auth_info.json');
    // const { state, saveState } = useSingleFileAuthState(authFilePath);

    // utility function to help save the auth state in a single folder
    // this function serves as a good guide to help write auth & key states for SQL/no-SQL databases, which I would recommend in any production grade system
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')
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
        const { connection, lastDisconnect }:any = update
        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
            // reconnect if not logged out
            if(shouldReconnect) {
                connectToWhatsApp()
            }
        } else if(connection === 'open') {
            console.log('opened connection')
        }
    })

     // Event: Messages received
    sock.ev.on('messages.upsert', async(m)=> {
        const msg = m.messages[0];
        // const owner=msg.key.fromMe
        if (!msg.message) return; // Ignore system messages

        const from:any = msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');

        // Extract message content
        const content =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        msg.message.imageMessage?.caption;

        console.log('Message received:', content);
        // auto reply
        if (content) {
            if (!isGroup) {
              // Send a reply for private messages
              try{
                const request=axios.post(`${API_URL}/api/md`, {
                  prompt: content
                })
                const response=(await request).data
                if(response.error){
                  console.log(response.error)
                  await sock.sendMessage(from, {
                    text: `Error: ${response.error}`,
                  });
                }else{
                  await sock.sendMessage(from, {
                    text: response,
                  });
                }
              }catch(error:any){
                console.log(error.message)
              }
            } else {
              // Example for groups: reply only to tagged messages 
              const owner:any=sock.user //owner is the bot whatsapp account
              if (msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.includes(owner.id)) {
                await sock.sendMessage(from, {
                  text: `Hello! I am a bot. You mentioned me.`,
                });
              }
            }
        }
    })
    return sock;
}
// run in main file
connectToWhatsApp()