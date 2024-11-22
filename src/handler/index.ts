import axios from 'axios';
import { config } from "dotenv";
config()

const API_URL=process.env.API_URL
export async function sendRequestAndHandleResponse(content:string, from:string, sock:any) {
    try {
        const response = await axios.post(`${API_URL}/api/md`, { prompt: content });
        const data = response.data;
     
        if (data.error) {
          console.log(data.error);
          await sock.sendMessage(from, {
            text: `Error: ${data.error}`,
          });
        } else {
          await sock.sendMessage(from, {
            text: data,
          });
        }
    } catch (error:any) {
        console.error('Request failed:', error);
        await sock.sendMessage(from, {
            text: `Error: ${error.message}`,
        });
    }
}
