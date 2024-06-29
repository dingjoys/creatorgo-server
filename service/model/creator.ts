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
        type: DataTypes.JSON,
    },

    handle: { type: DataTypes.STRING, },
    uniqueHolderNumber: { type: DataTypes.INTEGER, },
    totalAmount: { type: DataTypes.INTEGER, },
    totalMint: { type: DataTypes.INTEGER, },
    whaleNumber: { type: DataTypes.INTEGER, },
    score: { type: DataTypes.INTEGER, },
}, {
    tableName: "nft_contract_metadata"
})