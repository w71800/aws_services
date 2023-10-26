const form = document.querySelector("form")
const messagesDiv = document.querySelector("#messages")

form.onsubmit = async (e) => {
  e.preventDefault()
  try{
    let { content } = await postMessage()

    messagesDiv.append(makeMessage(content))
  }
  catch(e){

  }
  
}

function makeMessage(messageData){
  let { text, url } = messageData

  let messageDiv = document.createElement("div")
  messageDiv.classList.add("message")

  let textDiv = document.createElement("div")
  textDiv.classList.add("text")
  textDiv.textContent = text

  let imgDiv = document.createElement("img")
  imgDiv.classList.add("image")
  imgDiv.setAttribute("src", url)

  messageDiv.append(textDiv)
  messageDiv.append(imgDiv)

  return messageDiv
}

function postMessage(){

  return fetch("/message", {
    method: "POST",
    body: new FormData(form)
  })
    .then( res => res.json() )
}

function getMessages(){
  return fetch("/messages")
    .then( res => res.json() )
}

function init(){
  getMessages()
    .then( res =>{
      let { data } = res
      for(let msg of data){
        messagesDiv.append(makeMessage({ text: msg.text, url: msg.img_url }))
      }
    })
}

init()