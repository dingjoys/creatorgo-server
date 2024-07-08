"use strict";

import { DataTypes, INTEGER, STRING } from "sequelize";
import { quietSequelize, sequelize } from ".";

export const nftContractMetadata = quietSequelize.define("", {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    contract: {
        type: DataTypes.BLOB,
    },
    owner: { type: DataTypes.BLOB, },
    earner: { type: DataTypes.BLOB, },
    metadata: { type: STRING },
}, {
    // modelName:"proposals",
    tableName: "nft_contract_metadata"
})
