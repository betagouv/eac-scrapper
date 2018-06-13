const fs = require('fs')
const { JSDOM } = require('jsdom')
const batchProcess = require('batch-process')

const offset = Number(process.argv[2]) || 0
const limit = 3000


function readBody(id, cb) {
  const content = fs.readFileSync(`./canope/${id}.html`)
  if(!content) return
  const html = new JSDOM(content.toString())
  return html.window.document.body
}

function getResultat(nodes, title) {
  const titleNode = nodes.find(n => n.textContent.trim().startsWith(title))
  if(!titleNode) return
  const result = titleNode.querySelector('.resultat')
  if(!result) return
  return result.textContent.replace(/\s+/g, ' ').trim()
}

function getSection(nodes, title) {
  const titleNodeIndex = nodes.findIndex(n => n.textContent.trim().startsWith(title))
  if(!titleNodeIndex) return
  // +2 is the proper `p` (+1 is the `span` inside the title)
  return nodes[titleNodeIndex + 2].textContent.replace(/\s+/g, ' ').trim()
}

function extractData(nodes) {
  return {
    name: getResultat(nodes, 'Nom de la structure'),
    owner: getResultat(nodes, 'Responsable'),
    type: getResultat(nodes, 'Type de structure'),
    address: getResultat(nodes, 'Adresse'),
    postalCode: getResultat(nodes, 'Code Postal'),
    city: null,
    phone: getResultat(nodes, 'Téléphone'),
    email: getResultat(nodes, 'Mél :'),
    timetable: getResultat(nodes, 'Horaires'),
    audience: getResultat(nodes, "Condition d'accès"),
    contactName: getResultat(nodes, 'Personne à contacter'),
    contactPhone: getResultat(nodes, 'Téléphone contact'),
    contactEmail: getResultat(nodes, 'Mél contact'),
    description: getSection(nodes, 'Descriptif'),
    links: getSection(nodes, 'Lien(s)'),
    keywords: getSection(nodes, 'Mots-'),
    domain: getSection(nodes, 'Contexte'),
    actions: getSection(nodes, 'Description'),
    partners: getSection(nodes, 'Participation'),
  }
}

function cleanData(data) {
  if(data.postalCode && data.postalCode.includes(' - ')) {
    [data.postalCode, data.city] = data.postalCode.split(' - ')
  }
  if(data.phone && data.phone.includes(' / ')) {
    data.phone = data.phone.split(' / ')[0].trim()
  }
  if(data.actions && data.actions.trim() === '·') {
    data.actions = ''
  }
  return data
}

function writeOutput(list) {
  fs.writeFile(`actors-${offset}-${limit}.json`, JSON.stringify(list), console.error.bind(console))
}

function run() {
  let count = 0
  const data = [...Array(limit)].map((_, i) => {
    const index = i + 1 + offset
    const body = readBody(index)
    if(!body) return
    count++
    const nodes = Array.from(body.querySelectorAll('*'))
    const raw = extractData(nodes)
    console.log('processed', index)
    return cleanData(raw)
  })
  const filtered = data.filter(d => d && d.name)
  console.log(filtered.length, 'objects extracted.', count)
  writeOutput(filtered)
}

run()
