
import * as dotenv from 'dotenv';
import Koa from 'koa';
import logger from 'koa-logger';
import onerror from 'koa-onerror';
import Router from 'koa-router';
import { DefaultResponse } from '../lib/utils';
import { getCreatorData } from '../service/creatorService';
import { bulkCreateNftTransfers } from '../service/nftLogService';
const zlib = require('zlib');

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
    const { headers } = ctx.request;
    try {
        let body = ""
        if (ctx.request.headers['content-encoding'] === 'gzip') {
            body = await new Promise((resolve, reject) => {
                const chunks: any[] = [];
                ctx.req.on('data', chunk => {
                    chunks.push(chunk);
                });
                ctx.req.on('end', () => {
                    const buffer = Buffer.concat(chunks);
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
            const data = JSON.parse(body)
            data.forEach(d => {
                bulkCreateNftTransfers(d)
            })
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
            throw Error(`invalid data - ${body}`)
        }
        ctx.status = 200; // 设置响应状态码为 200 表示成功接收
        console.log(`Webhook received successfully ${headers["batch-start-range"]}-${headers["batch-end-range"]}`)
        ctx.body = `200`; // 返回一个响应
    } catch (e) {
        console.error(e)
        ctx.status = 500
    }
})


router.get("/api/creator/data", async (ctx) => {
    const { owner } = ctx.request.query
    const data = await getCreatorData(owner)
    console.log(data)
    ctx.body = DefaultResponse(data)
})

app.on('error', (err, ctx) => {
    console.error('server error', err, ctx)
});

const port = process.env.PORT || 3036; // Use the port specified in the environment variable PORT, or default to 3000
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
