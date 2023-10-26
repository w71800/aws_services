const express = require('express')
const router = express.Router()

const getMessages = router.get("/messages", async (req, res) => {
  // 得到圖片的連結
  let command = new ListObjectsCommand({ Bucket: BUCKET_NAME })
  
  let result = await s3Client.send(command)
  let base = `https://${BUCKET_NAME}.s3.${S3_BUCKET_REGION}.amazonaws.com/`
  data = result.Contents.map( e => base + e.Key )

  res.send({ data })
})

module.exports = getMessages
