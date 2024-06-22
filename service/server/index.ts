
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


router.get("/proposals", async (ctx) => {
    const { space, limit, offset } = ctx.request.query
    ctx.body = await listProposals(space, parseInt(limit || "50"), parseInt(offset || "0"))
})

router.get("/proposal/:id", async (ctx) => {
    const id = ctx.params.id
    ctx.body = await proposal(id)
})

router.get("/votes", async (ctx) => {
    const { proposalId, limit, offset } = ctx.request.query
    ctx.body = await listVotes(proposalId, parseInt(limit || "50"), parseInt(offset || "0"))
})

router.get("/votesByOwner", async (ctx) => {
    const { owner, limit, offset } = ctx.request.query
    ctx.body = await listVotesByOwner(owner, parseInt(limit || "50"), parseInt(offset || "0"))
})

// router.post("/vote", async (ctx) => {
//     const { proposalId, choice, due, owner, signature } = ctx.request.body
//     const msg = `${proposalId}-${due}-${choice}`

//     // const hash = ethers.utils.hashMessage(msg);
//     // const pk = ethers.utils.recoverPublicKey(hash, signature);
//     // const recoveredAddress = ethers.utils.computeAddress(
//     //     ethers.utils.arrayify(pk)
//     // );

//     // if (owner.toLowerCase() != recoveredAddress.toLowerCase()) {
//     //     throw DefaultError("invalid signature");
//     // }
//     await vote(proposalId, owner, choice, 1, msg, signature)
//     ctx.body = DefaultResponse()
// })

router.post("/vote", async (ctx) => {
    const { proposalId, choice, due, owner, signature } = ctx.request.body
    const msg = `${proposalId}-${due}-${JSON.stringify(choice)}`
    const hash = utils.keccak256(Buffer.from(msg))
    const pk = ethers.utils.recoverPublicKey(utils.hashMessage(hash), signature);
    const recoveredAddress = ethers.utils.computeAddress(
        ethers.utils.arrayify(pk)
    );
    if (owner.toLowerCase() != recoveredAddress.toLowerCase()) {
        throw DefaultError("invalid signature");
    }
    const validVote = await validate(owner, proposalId)
    const voteSum = Object.keys(choice).reduce((total, curr) => total + choice[curr], 0)
    if (voteSum > validVote)
        throw DefaultError("invalid vote number")
    await vote(proposalId, owner, choice, due, msg, signature)
    ctx.body = DefaultResponse()
})

router.get("/validate/:proposalId", async (ctx) => {
    const proposalId = ctx.params.proposalId
    const { owner } = ctx.request.query
    ctx.body = await validate(owner, proposalId)
})

app.use(router.routes());

app.on('error', (err, ctx) => {
    console.error('server error', err, ctx)
});

const port = process.env.PORT || 3035; // Use the port specified in the environment variable PORT, or default to 3000
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});