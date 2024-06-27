
import * as dotenv from 'dotenv';
import Koa from 'koa';
import bodyparser from 'koa-bodyparser';
import logger from 'koa-logger';
import onerror from 'koa-onerror';
import Router from 'koa-router';
import { DefaultResponse } from '../lib/utils';
const compress = require('koa-compress');
const Moralis = require("moralis").default;

dotenv.config();

const app = new Koa()
onerror(app)
app.use(compress());
app.use(bodyparser())
app.use(logger())

app.use(async (ctx, next) => {
    const start = new Date();
    try {
        await next();
    } catch (error: any) {
        console.error(`APP-
      ${JSON.stringify({ error })}-${error.stack}`
        );
        let code = 99
        if (error.toString().indexOf("expire") > -1) {
            return code = 104
        }

        ctx.body = {
            code: error.code || code,
            msg: error.msg || error.toString(),
        };
        return;
    }
    const ms = new Date().getTime() - start.getTime();
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

const router = new Router();


router.post("/webhook/nft", async (ctx) => {
    const { headers, body } = ctx.request;

    console.log(body)
    ctx.body = DefaultResponse()
})

router.post("/webhook/zora", async (ctx) => {
    const { headers, body } = ctx.request;

    console.log(headers, body, ctx.request)
    ctx.status = 200; // 设置响应状态码为 200 表示成功接收
    ctx.body = 'Webhook received successfully'; // 返回一个响应
})


app.use(router.routes());

app.on('error', (err, ctx) => {
    console.error('server error', err, ctx)
});

const port = process.env.PORT || 3036; // Use the port specified in the environment variable PORT, or default to 3000
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});