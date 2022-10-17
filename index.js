const express=require('express');
const cors=require('cors');
const app=express();
app.use(cors());//cors

const port=process.env.PORT||5000;
app.listen(port,()=>{
console.log(`Server running on port ${port}`);
require('./whatsapp-web');//using whatsapp-web.js
});


