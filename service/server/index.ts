
import * as dotenv from 'dotenv';
import cors from "kcors";
import Koa from 'koa';
import bodyparser from 'koa-bodyparser';
import json from 'koa-json';
import logger from 'koa-logger';
import onerror from 'koa-onerror';
import Router from 'koa-router';
import { validate } from '../strategies';
import { listProposals, listVotes, listVotesByOwner, proposal, vote } from '../service/proposals';
import { ethers, utils } from 'ethers';
import { DefaultError, DefaultResponse } from '../lib/utils';
dotenv.config();

const app = new Koa()
onerror(app)

app.use(cors());
app.use(bodyparser())
app.use(json())
app.use(logger())
// app.use(require('koa-static')(__dirname + '/public'))

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


router.get("/webhook/nft", async (ctx) => {
    const data = ctx.request.body
    console.log(data)
    // ctx.body = await listProposals(space, parseInt(limit || "50"), parseInt(offset || "0"))
})


app.use(router.routes());

app.on('error', (err, ctx) => {
    console.error('server error', err, ctx)
});

const port = process.env.PORT || 3036; // Use the port specified in the environment variable PORT, or default to 3000
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});