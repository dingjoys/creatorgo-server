
import * as dotenv from 'dotenv';
import Koa from 'koa';
import bodyparser from 'koa-bodyparser';
import logger from 'koa-logger';
import onerror from 'koa-onerror';
import Router from 'koa-router';
import { DefaultResponse } from '../lib/utils';
const zlib = require('zlib');
const compress = require('koa-compress');
const Moralis = require("moralis").default;

dotenv.config();

const app = new Koa()
onerror(app)
// app.use(compress());
// app.use(bodyparser())
app.use(logger())

const router = new Router();

router.post("/webhook/nft", async (ctx) => {
    const { headers, body } = ctx.request;

    console.log(body)
    ctx.body = DefaultResponse()
})

router.post("/webhook/zora", async (ctx) => {
    const { headers, body } = ctx.request;
    console.log(body)
    try {
        let body = ""
        if (ctx.request.headers['content-encoding'] === 'gzip') {
            body = await new Promise((resolve, reject) => {
                let data = '';
                ctx.req.on('data', chunk => {
                    data += chunk;
                });
                ctx.req.on('end', () => {
                    console.log(data)
                    const buffer = Buffer.from(data);
                    zlib.gunzip(buffer, (err, decoded) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(decoded.toString());
                        }
                    });
                });
                ctx.req.on('error', err => {
                    reject(err);
                });
            });
        } else {
            body = await new Promise((resolve, reject) => {
                let data = '';
                ctx.req.on('data', chunk => {
                    data += chunk;
                });
                ctx.req.on('end', () => {
                    resolve(data);
                });
                ctx.req.on('error', err => {
                    reject(err);
                });
            });
        }
        console.log('Received webhook payload:', body);
        // console.log(headers, body, ctx.request)
        ctx.status = 200; // 设置响应状态码为 200 表示成功接收
        ctx.body = 'Webhook received successfully'; // 返回一个响应
    } catch (e) {
        console.error(e)
        ctx.status = 500
    }
})


app.use(router.routes());

app.on('error', (err, ctx) => {
    console.error('server error', err, ctx)
});

const port = process.env.PORT || 3036; // Use the port specified in the environment variable PORT, or default to 3000
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});