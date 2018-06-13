# Canaux-Canope scrapper


Download and scrap available contents from the https://www.reseau-canope.fr website.

## Installing

make sure you have a recent node (tested on Node 10).

```
npm install
mkdir canope
```

## Running


### Downloading webpages

```
node downloader.js
```

Will download all webpages into a _./canope_ folder.
Your HTML webpages will be named 1.html, 2.html, …


### Scrapping page content

```
node scrapper.js <offset>
```

Will process 3000 pages from the _./canope_ folder,
starting at the number specified by `<offset>`  html pages
and transform them into one list of _JSON_ objects that will be saved into
an `output-<offset>-3000.json` file.

You may then repeat the task with the next 3000 offset: `node scrapper.js 3000`.
