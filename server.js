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

const postSchema=new mongoose.Schema({
    authorID:String,
    email:String,
    title:String,
    description:String
})


//user model
const User=mongoose.model('User', userSchema);
const Post=mongoose.model('Post',postSchema);

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

async function finduserIdbyemail(email){
    const user=await User.findOne({email:email});
    if(!user){
        console.log("user not found");
        return "";
    }
    
    return user._id;
}

app.post('/createnewpost',async(req,res)=>{
    const {email,title,description}=req.body;
    //verifying author id;
    try{
        const authorID=await finduserIdbyemail(email);
    if(authorID){
        console.log("author verified");
        const newPost=new Post({authorID,email,title,description});
        await newPost.save();
        res.status(201).send('post created successfully');
    }
    else{
        res.status(400).send('user not found to create post');
    }
    }
    catch(err){
        console.log('error log'+ err);
        res.status(400).send('something went wrong');

    }
    

})

app.get('/getposts',async(req,res)=>{
    const {email}=req.body;
    try{
        const posts=await Post.find({email:email});
        res.status(200).json(posts);        
    }
    catch(err){
        res.status(500).send('error fetching posts');
    }
})



app.get('/getpostById/:id',async(req,res)=>{
    const postId=req.params.id;
    try{
        const findPost=await Post.findById(postId);
        console.log('post found'+findPost);
        res.status(200).json(findPost);
    }
    catch(err){
        console.log('error fetching post by id'+err);
        res.status(404).send('post not found');
    }
    
    
})

app.get('/getallpostsbyuser/:email',async(req,res)=>{
    const email=req.params.email;
    try{
        const findposts=await Post.find({email:email});
        if(findposts){
            res.status(200).json(findposts);
        }
        else{
            res.status(404).json('no posts found for this user');
        }
        
    }
    catch(err){
        res.status(404).status('something went wrong in fetching the posts');
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
