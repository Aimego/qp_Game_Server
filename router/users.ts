import express from 'express'
// import fetch from 'node-fetch';
const fetch = require('node-fetch');
import { Request, Response, NextFunction } from 'express';
import { useError } from '../interface';
const jwt = require('jsonwebtoken') // jwtToken获取
import { jwtSecret } from '../app'
import users_model from '../models/users'
const router = express.Router()

const AppId = 'wxfff78a6f1ec2f759'
const AppSecret = '61167db96ae90527ad7ddb17fdfd4394'

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { sign, username, avatar } = req.body
        new users_model({
            sign,
            name: username,
            avatar
        }).save((err: any, doc: any) => {
            if (err) {
                const error = new useError(500, '创建用户失败')
                return next(error)
            }
            res.send({ code: 200, data: doc })
        })
    } catch (err: any) {
        const error = new useError(500, err)
        return next(error)
    }
})

router.post('/getWxOpenId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const code = req.body.code
        const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${AppId}&secret=${AppSecret}&js_code=${code}&grant_type=authorization_code`
        fetch(url).then((response: any) => {
            if(!response.ok) {
                throw '获取微信用户openid失败'
            }
            return response.json()
        }).then((data: any) => {
            res.send({ code: 200, data })
        }).catch(() => {
            throw '获取微信用户openid失败2'
        })
    } catch (err: any) {
        console.log('getWxOpenId' + err)
        const error = new useError(500, err)
        return next(error)
    }
})

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { sign, name } = req.body
        const user = await users_model.findOne({ name, sign })
        if (!user) {
            throw '该用户不存在'
        }
        const token = jwt.sign({ _id: user._id, sign }, jwtSecret, { expiresIn: 3 * 24 * 60 * 60 }); // 默认加密算法是 hs256
        res.send({ code: 200, data: { userinfo: user, token } })
    } catch (err: any) {
        const error = new useError(409, err)
        return next(error)
    }
})



export default router