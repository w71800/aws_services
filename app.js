const express = require('express');
const app = express();
const path = require('path');
const multer = require("multer")
const console = require('console')
const sassMiddleware = require('express-dart-sass');
const { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsCommand } = require('@aws-sdk/client-s3')
require('dotenv').config()
const mysql = require('mysql2/promise')
const {   
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  S3_BUCKET_REGION,
  BUCKET_NAME,
  DB_HOST,
  DB_USER,
  DB_PASSWORD
} = process.env

const s3Client = new S3Client({
  region: S3_BUCKET_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});
const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: 'wehelp',
  connectionLimit: 10 
})

const upload = multer()



app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

// 設定Sass中間件
app.use(sassMiddleware({
  /* Options */
  src: path.join(__dirname, 'sass'),
  dest: path.join(__dirname, 'public/styles'),
  debug: true,
  outputStyle: 'compressed',
  prefix: '/styles', // 這個前綴是什麼？
  indentedSyntax: true,
}));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')))


app.get("/", (req, res) => {
  res.render("index.pug")
})

app.post("/message", upload.single("image"), async (req, res) => {
  let { text } = req.body
  try{
    let key = Date.now().toString()
    let imageUrl = `http://d39z1uqnre40a.cloudfront.net/${key}`;
    let command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    })
    await s3Client.send(command)

    let query = `INSERT into messages (text, img_url) VALUES (?, ?)`
    let values = [text, imageUrl]
    let [ result ] = await pool.query(query, values)

    res.json({
      message: `${ result.insertId } 已成功插入`,
      content: {
        text: text,
        url: imageUrl,
      }
      
    });
  }
  catch (error){
    console.log(error); 
    res.status(500).send('檔案上傳失敗');
  }
})

app.get("/messages", async (req, res) => {
  let [ rows ] = await pool.query("SELECT * from messages")

  res.send({ data: rows })
})


app.listen(3000, () => {
  console.log(`應用程式正在監聽端口 3000`);
});
