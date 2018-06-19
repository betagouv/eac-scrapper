const fs = require('fs')
const { JSDOM } = require('jsdom')
const parser = require('papaparse')

const offset = Number(process.argv[2]) || 0
const limit = 3000
console.log('offset', offset)


function readBody(id, cb) {
  const content = fs.readFileSync(`./canope/${id}.html`)
  if(!content) return
  const html = new JSDOM(content.toString())
  return html.window.document.body
}

function getResultat(nodes, title) {
  const titleNode = nodes.find(n => n.textContent.trim().startsWith(title))
  if(!titleNode) return ''
  const result = titleNode.querySelector('.resultat')
  if(!result) return ''
  return result.textContent.replace(/\s+/g, ' ').trim()
}

function getSection(nodes, title) {
  const titleNodeIndex = nodes.findIndex(n => n.textContent.trim().startsWith(title))
  if(!titleNodeIndex) return ''
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
    city: '',
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

function toJson(pageIndex) {
  const body = readBody(pageIndex)
  if(!body) return
  const nodes = Array.from(body.querySelectorAll('*'))
  const raw = extractData(nodes)
  return cleanData(raw)
}


function run() {
  if(offset === 0) {
    const first = parser.unparse([toJson(1)], {header: true})
    fs.writeFileSync('actors.csv', first + '\n')
  }
  const stream = fs.createWriteStream('actors.csv', {flags:'a'})
  const data = [...Array(limit)].map((_, i) => {
    try {
      const index = i + 2 + offset
      const data = toJson(index)
      console.log('processing row', i + offset, `${Object.keys(data).length} cols`)
      if(!data.name) return
      const csv = parser.unparse([data], {header: false})
      stream.write(csv + '\n')
    }
    catch(e) {
      stream.end()
    }
  })
  stream.end()
  console.log(`ended ${data.length} from row ${offset} to row ${offset + limit}`)
}

run()
