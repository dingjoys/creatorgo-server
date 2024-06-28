


"use strict";

import { BIGINT, DataTypes, INTEGER, STRING } from "sequelize";
import { quietSequelize, sequelize } from ".";


// `mint_count` int,
// `max_token_id` bigint,
// `total_amount` int,
// `trace_id` bigint,
// `createdAt` datetime DEFAULT NULL,
// `updatedAt` datetime DEFAULT NULL,


export const NftMintData = quietSequelize.define("", {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    contract: {
        type: DataTypes.BLOB,
    },
    mint_count: { type: INTEGER },
    max_token_id: { type: BIGINT },
    total_amount: { type: INTEGER },
    trace_id: { type: BIGINT },

}, {
    // modelName:"proposals",
    tableName: "nft_mint_data"
})
