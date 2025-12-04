const { MongoClient }=require('mongodb'); //mongodb module import
const {createServer} = require('node:http'); //http module import
require('dotenv').config();
const mongoose=require('mongoose'); //dotenv module import
const app=require('express')(); //express module import
const hostname='127.0.0.1';
const port=3000;
app.use(require('express').json()); //middleware to parse json request body

//server creation
//commit
// connection to mongodb database
/*async function connectToDB(){
    const uri=process.env.DB_URL;
    const client=new MongoClient(uri);  
    try{
        await  client.connect();
        console.log('Connected to MongoDB');
    }
    catch(err){
        console.error('Error connecting to MongoDB:', err);
    }
    finally{
         await client.close();
    }
}
connectToDB();


const server = createServer((req,res)=>{
    res.statusCode=200;
    res.setHeader('Content-Type','text/plain');
    res.end('Hello World');
})

server.listen(port,hostname, ()=>{
    console.log(`Server is running at http://${hostname}:${port}/`);
}) */

//connecting to mongoose
//useNewUrlParser and useUnifiedTopology are options to avoid deprecation warnings
//what is deprecation warning? A deprecation warning is a message that indicates that a certain feature or practice is outdated and will be removed in future versions of the software. It serves as a heads-up for developers to update their code to use newer, preferred methods or features.
mongoose.connect(process.env.DB_URL, {useNewUrlParser:true, useUnifiedTopology:true})
.then(()=>{
    console.log('Connected to mongoose databasse');
})
.catch((err)=>{
    console.error('Error connecting to mongoose database:', err);
})

//routes
app.get('/',(req,res)=>{
    res.send('this is a get call');
    console.log('get request');
})

app.post('/post',(req,res)=>{
    res.send('this is a post call');
    console.log(req.body);

    console.log('post request');
})

app.put('/put',(req,res)=>{
    console.log(req.body);
    res.send('this is a put call');
    console.log('put request');
})

app.listen(port,()=>{
    console.log(`server is running on port ${port}`);
});
