const fs = require('fs')
var http = require('http')
const request = require('request-promise')

const limit = Number(process.argv[2]) || 2


http.globalAgent.maxSockets = 2

async function readPage(id) {
  return await request(`http://www.reseau-canope.fr/carte-des-ressources/rclvisu/fic_edit.asp?Ecr=CNDPconsult.asp&fETABL=${id}`, {
    encoding: 'latin1'
  })
}

async function download(id) {
  fs.writeFile(`canope/${id}.html`, await readPage(id), (err) => {
    if(err) console.error(err)
  })
}

async function batch() {
  [...Array(limit)].forEach(async (_, i) => {
    download(i + 1)
  })
}

async function run() {
  await batch()
}

run()
