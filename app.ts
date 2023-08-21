import express, {Response, NextFunction} from 'express'
import { AuthRequest, ErrorMsg, useError } from './interface/index';
import { ServerInfo } from './config'
const { expressjwt } = require('express-jwt') // express针对的jwtToken验证
const { usersRouter, roomsRouter } = require('./router/index')
const bodyParser = require('body-parser')
const path = require('path')
const serveIndex = require('serve-index');
const server = express()

export const jwtSecret = 'liuhao' // jwt签名

server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: false }));

server.all('*', (req: AuthRequest,res: Response, next: NextFunction) => {
    res.setHeader('Access-Control-Allow-Origin','*');
	res.setHeader('Access-Control-Allow-Headers',"*");
    next()
})

// 设置了静态文件的根目录为statics文件夹
server.use('/statics', express.static(path.join(__dirname, 'statics')))
server.use('/res', serveIndex(path.join(__dirname, 'statics/mj/res'), {'icons': true}));
// server.use('/statics', express.static(`${process.cwd()}/statics/images`));
server.use(expressjwt({
    secret: jwtSecret,
    algorithms:['HS256'], // 如果没有更改jwt算法，则默认使用的加密的是hs256算法
    getToken: (req: AuthRequest) => {
        if (req.headers.authorization) {
            return req.headers.authorization
          }
        return null
    }
}).unless({ // 排除的接口地址
    path:['/get_server_info','/user/register' ,'/user/login', '/user/getWxOpenId', '/room/getRoom']
}))

server.use((err:any,req: AuthRequest, res: Response, next: NextFunction) => {
    if(err.name === 'UnauthorizedError') {
        const error = new useError(401, '用户登录已过期，请重新登录')
        return next(error)
    }
    next()
})
server.use('/user', usersRouter)
server.use('/room', roomsRouter)

server.get('/get_server_info', (req: AuthRequest, res: Response) => {
    res.send({code: 200, data:ServerInfo})
})

server.use((err: ErrorMsg, req: AuthRequest, res: Response ,next: NextFunction) => {
    res.send({code:err.code || 500, message: err.message});
})



server.listen(9000, () => {
    console.log('mjgame_server 9000 端口已开放')
})

