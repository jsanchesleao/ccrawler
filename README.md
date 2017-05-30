# CCrawler

A configurable web crawler

Installation:

`npm install ccrawler`

Or, alternatively

`npm install -g ccrawler`

Simple write a script file and ccrawler will crawl through it. For example:

```
open "http://www.globo.com"
find ".hui-premium__title"
inner-html
```

You can run this file with `ccrawler -f crawlfile`.

## Variables

At any point you can use variables, like `open "http://mysite/${page}"`, and you can pass the variable to the cli with `ccrawler --page foo`

## As a library

```javascript
const ccrawler = require('ccrawler')

ccrawler.execFile('./myfile', {page: 'foo'})
  .then(result => console.log(result))
  .catch(err => console.log(err))
```
