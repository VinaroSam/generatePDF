'use strict'
const express = require('express')
const bodyParser = require('body-parser')
const hbs = require('express-handlebars')
const app = express()
const config = require('./config')
const path = require('path')
const puppeteer = require('puppeteer');
const fs = require('fs')

if(!fs.existsSync('./pdf')){
    fs.mkdirSync('./pdf');
  }
app.use(express.static('public'))
app.use(bodyParser.json())
app.use('/vue', express.static(path.join(__dirname, '/node_modules/vue/dist/')))

app.engine('hbs', hbs({extname: '.hbs', defaultLayout: 'main'}))
app.set('view engine', 'hbs')

app.get('/', (req, res)=>{
    console.log(__dirname)    
    res.render('home', {
        name: 'Vinaro Sam',
        test: ['1',' 2', '2', '4', '3']
        }
    )
})

app.get('/export/pdf/', (req, res) => {
    let friendlyURL = path.join(__dirname,'pdf',encodeURIComponent(req.query.url.replace(/\./g,'_'))+'.pdf')
    const generatePDF = async () => {
        console.log(req.query.url)
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.goto(decodeURIComponent(req.query.url))
        const buffer = await page.pdf({format: 'A4'})
        res.type('application/pdf')
    
        await browser.close()
        return buffer
    }
    generatePDF().then(x =>{
        if(fs.existsSync(friendlyURL)) {
            fs.unlinkSync(friendlyURL)
            console.log('deleted')
        }
    
        
        setTimeout(function(){fs.writeFileSync(friendlyURL, x,'binary')}, 1000)
        console.log('created')
        res.end(x)
    })
})

app.listen(config.port, ()=>{
    console.log(`The server is running on port ${config.port}`)
})