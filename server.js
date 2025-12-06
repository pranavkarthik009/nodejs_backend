const { MongoClient }=require('mongodb'); //mongodb module import
const {createServer} = require('node:http'); //http module import
require('dotenv').config();
const mongoose=require('mongoose'); //dotenv module import
const app=require('express')(); //express module import
const hostname='127.0.0.1';
const port=3000;
const token=require('jsonwebtoken');
const bcrypt=require('bcryptjs');
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

//user schema
const userSchema=new mongoose.Schema({
    name:String,
    email:String,
    password:String
});

//user model
const User=mongoose.model('User', userSchema);

app.post('/register',async(req,res)=>{
    const {name,email,password}=req.body;

    //const passwordHash=await bcrypt.hash(password,10);
    //password=passwordHash;
    const finduser=await User.findOne({email:email});
    if(finduser){
        return res.status(400).send('user already exists');
    }
    else{
        console.log('registering user');
        try{
        const hashedpassword=await bcrypt.hash(password,10);
        const newUser=new User({name,email,password:hashedpassword});
        await newUser.save();
        res.status(201).send('user registered successfully');
     }
     catch(err){
        res.status(500).send('error registering user');
     }
    }
    
    
})
//login route
app.post('/login',async(req,res)=>{
    const {email,password}=req.body;
    const finduser=await User.findOne({email:email});
    if(!finduser){
        res.status(400).send('user not registered');
    }
    else{
        try{
           const findpassword=await bcrypt.compare(password,finduser.password);
           if(findpassword){
            const jwt=await token.sign({id:finduser._id},process.env.JWT_SECRET,{expiresIn:'1h'});
            res.cookie('jwt',jwt,{httpOnly:true,secure:true}); //setting cookie with jwt token
            console.log('user logged in successfully');
            res.status(200).send('user logged in successfully')
           }
           else{
            res.status(400).send('password doesnt match');
           } 
        }
        catch(err){
            res.status(400).send('something went wrong');
        }
        
    }
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
