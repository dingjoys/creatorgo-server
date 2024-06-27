"use strict";

import { DataTypes, INTEGER, JSON, STRING } from "sequelize";
import { quietSequelize, sequelize } from ".";

export const NftTransfer = sequelize.define("", {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    from: {
        type: DataTypes.BLOB,
    },
    to: {
        type: DataTypes.BLOB,
    },
    contract: {
        type: DataTypes.BLOB,
    },
    block_number: {
        type: DataTypes.INTEGER
    },
    hash: {
        type: DataTypes.BLOB,
    },
    amount: {
        type: DataTypes.INTEGER,
    },
    token_id: {
        type: DataTypes.BLOB,
    },
    log_index:{
        type: DataTypes.INTEGER,
    }
}, {
    // modelName:"proposals",
    tableName: "nft_transfer"
})