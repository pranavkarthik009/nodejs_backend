
const {createServer} = require('node:http'); //http module import
require('dotenv').config(); //dotenv module import

const hostname='127.0.0.1';
const port=3000;

//server creation
//commit


const server = createServer((req,res)=>{
    res.statusCode=200;
    res.setHeader('Content-Type','text/plain');
    res.end('Hello World');
})

server.listen(port,hostname, ()=>{
    console.log(`Server is running at http://${hostname}:${port}/`);
})