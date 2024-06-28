"use strict";

import { DataTypes, INTEGER, STRING } from "sequelize";
import { quietSequelize, sequelize } from ".";

export const Creator = quietSequelize.define("", {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    address: { type: STRING },
    contracts: {
        type: DataTypes.BLOB,
    },
    owner: { type: DataTypes.BLOB, },
    metadata: { type: STRING },
    supply: { type: INTEGER }

}, {
    // modelName:"proposals",
    tableName: "nft_contract_metadata"
})
