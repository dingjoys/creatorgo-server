"use strict";

import { DataTypes, INTEGER, STRING } from "sequelize";
import { quietSequelize, sequelize } from ".";

export const NftTokenMetadata = quietSequelize.define("", {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    name: { type: STRING },
    contract: {
        type: DataTypes.BLOB,
    },
    token_id: {
        type: DataTypes.BLOB,
    },
    metadataUrl: { type: STRING },
}, {
    // modelName:"proposals",
    tableName: "nft_token_metadata"
})
