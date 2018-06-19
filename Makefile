run: download scrap

download:
	node downloder

scrap:
	node scrapper 0
	node scrapper 3000
	node scrapper 6000
	node scrapper 9000
	node scrapper 12000
	node scrapper 15000
	node scrapper 18000
	node scrapper 21000
	say 'all batched finished'
