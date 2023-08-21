import mongoose from "mongoose";

mongoose.set('strictQuery', false);
mongoose.connect('mongodb://admin:123456@127.0.0.1:27017/mjServer?authSource=admin',(err) => {
    if(err) return console.log(err)
    console.log('连接mongodb数据库成功')
})

export default mongoose