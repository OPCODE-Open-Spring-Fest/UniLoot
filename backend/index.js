const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const bodyParser = require('body-parser');

require('dotenv').config();//only uploading the public env file 

const app = express();
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cors({
    origin : '*'
}))
app.get('/health',(req,res)=>{
    res.send('OK');
})
const PORT = process.env.PORT || 3001;
app.listen(PORT,() => {
    console.log(`Server is running on port ${PORT}`);
})
