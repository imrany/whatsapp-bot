import express from "express"
import cors from "cors"
import qrcode from "qrcode"
import { config } from "dotenv"
import { connectToWhatsApp, qrcodeData } from "./bot"
config()

const app=express()
app.use(cors({
    origin:"*",
    methods: ["GET", "POST", "DELETE", "UPDATE", "PATCH", "PUT"]
}))
app.use(express.json())
app.use(express.urlencoded({extended:false}))

connectToWhatsApp()

app.get('/qrcode', async (req:any, res:any) => {
    try {
      const buffer = await qrcode.toBuffer(qrcodeData);
      res.setHeader("Content-Type", "image/png");
      res.end(buffer);
    } catch (err) {
      console.error("Error generating QR code:", err);
      res.status(500).send({error:"Internal Server Error"});
    }
});

const PORT = process.env.PORT||8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});