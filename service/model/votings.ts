"use strict";

import { DataTypes, INTEGER, JSON, STRING } from "sequelize";
import { quietSequelize, sequelize } from ".";

export const Votings = sequelize.define("", {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    voter: {
        allowNull: false,
        type: STRING,
    },
    proposal_id: {
        type: INTEGER,
    },
    choice: {
        type: JSON
    },
    due: {
        type: INTEGER
    },
    msg: {
        type: STRING
    },
    sig: {
        type: STRING
    },
}, {
    // modelName:"proposals",
    tableName: "votings"
})
