import { Op, literal } from "sequelize"
import { Proposal } from "../model/proposals"
import { Votings } from "../model/votings"

export const listProposals = async (space, limit: number, offset: number) => {
    const proposals = await Proposal.findAndCountAll({
        where: space ? {
            space
        } : {}, limit, offset, raw: true, order: [["id", "desc"]]
    })

    const rawResult: any[] = await Votings.findAll({
        where: {
            proposal_id: { [Op.in]: proposals.rows.map((p: any) => p.id) }
        }, raw: true
    })

    let results = rawResult.reduce((res, curr) => {
        if (!res[curr.proposal_id]) {
            res[curr.proposal_id] = {}
        }
        for (let choice of Object.keys(curr.choice)) {
            res[curr.proposal_id][choice] = (res[curr.proposal_id][choice] || 0) + curr.choice[choice]
        }
        return res
    }, {})


    return {
        proposals,
        results
    }
}


export const proposal = async (id) => {
    const proposal = await Proposal.findOne({
        where: {
            id
        }, raw: true
    })

    // attributes: [[literal("count(*)"), "count"], "choice"],
    const rawResult: any[] = await Votings.findAll({
        where: {
            proposal_id: id
        }, raw: true
    })
    let result = rawResult.reduce((res, curr) => {
        for (let choice of Object.keys(curr.choice)) {
            console.log(curr.choice[choice], res[choice])
            res[choice] = (res[choice] || 0) + curr.choice[choice]
        }
        return res
    }, {})
    console.log(result)

    return {
        proposal,
        result: result
    }
}

export const listVotes = async (proposal_id, limit: number, offset: number) => {
    return Votings.findAndCountAll({
        where: {
            proposal_id
        }, limit, offset
    })
}

export const listVotesByOwner = async (owner, limit: number, offset: number) => {
    return Votings.findAndCountAll({
        where: {
            voter: owner
        }, limit, offset
    })
}

export const listVoteResult = async (proposal_id, limit: number, offset: number) => {
    return Votings.findAll({
        attributes: [[literal("count(*)"), "count"], "choice"],
        where: {
            proposal_id
        }, limit, offset, group: "choice"
    })
}

export const vote = async (proposal_id, voter, choice, due, msg, sig) => {
    const vote = await Votings.findOne({ where: { voter, proposal_id } })
    if (vote) {
        return vote.update({
            choice, due, sig
        })
    }
    return Votings.create({
        proposal_id,
        voter, choice, msg, sig, due
    })
}