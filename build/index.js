"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const baileys_1 = __importStar(require("@whiskeysockets/baileys"));
async function connectToWhatsApp() {
    const { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)('auth_info_baileys');
    const sock = (0, baileys_1.default)({
        printQRInTerminal: true,
        auth: state
    });
    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', (update) => {
        var _a, _b;
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = ((_b = (_a = lastDisconnect.error) === null || _a === void 0 ? void 0 : _a.output) === null || _b === void 0 ? void 0 : _b.statusCode) !== baileys_1.DisconnectReason.loggedOut;
            console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect);
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        }
        else if (connection === 'open') {
            console.log('opened connection');
        }
    });
    sock.ev.on('messages.upsert', async (m) => {
        var _a, _b, _c, _d, _e;
        const msg = m.messages[0];
        if (!msg.message)
            return;
        const from = msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const content = msg.message.conversation ||
            ((_a = msg.message.extendedTextMessage) === null || _a === void 0 ? void 0 : _a.text) ||
            ((_b = msg.message.imageMessage) === null || _b === void 0 ? void 0 : _b.caption);
        console.log('Message received:', content);
        if (content) {
            if (!isGroup) {
                await sock.sendMessage(from, {
                    text: `You said: "${content}"`,
                });
            }
            else {
                const owner = sock.user;
                if ((_e = (_d = (_c = msg.message.extendedTextMessage) === null || _c === void 0 ? void 0 : _c.contextInfo) === null || _d === void 0 ? void 0 : _d.mentionedJid) === null || _e === void 0 ? void 0 : _e.includes(owner.id)) {
                    await sock.sendMessage(from, {
                        text: `Hello! I am a bot. You mentioned me.`,
                    });
                }
            }
        }
        await sock.sendMessage(m.messages[0].key.remoteJid, { text: 'Hello there!' });
    });
    return sock;
}
connectToWhatsApp();
