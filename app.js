import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import {index, store} from './controllers/CategoryController.js'
import indexRouter from './routes/index.js';

const env=dotenv.config().parsed;
var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', indexRouter);
app.get('/categories',index)
app.post('/categories',store)

//connect to mongoDB
mongoose.connect(`${env.MONGODB_URI}${env.MONGODB_HOST}:${env.MONGODB_PORT}`,{

    dbName:env.MONGODB_DB_NAME,
})
const db=mongoose.connection;
db.on('error',console.error.bind(console, 'connection error:'));
db.once('open',function(){
    console.log('connected to mongoDB');
});

app.listen(env.APP_PORT,()=>{
    console.log(`server is running on port ${env.APP_PORT}`);
})
