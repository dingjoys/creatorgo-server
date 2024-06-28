"use strict";

import { DataTypes, INTEGER, STRING } from "sequelize";
import { quietSequelize } from ".";

export const nftContractMetadata = quietSequelize.define("", {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    name:{ type: STRING },
    contract: {
        type: DataTypes.BLOB,
    },
    owner: { type: DataTypes.BLOB, },
    metadataUrl: { type: STRING },
    supply: { type: INTEGER }

}, {
    // modelName:"proposals",
    tableName: "nft_contract_metadata"
})