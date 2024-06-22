"use strict";

import { DataTypes, INTEGER, JSON, STRING } from "sequelize";
import { quietSequelize, sequelize } from ".";

export const Proposal = sequelize.define("", {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
    },
    author: {
        allowNull: false,
        type: STRING,
    },
    title: {
        type: STRING,
    },
    body: {
        type: STRING
    },
    choices: {
        type: JSON,
    },
    strategies: {
        type: JSON
    },
    start: {
        type: INTEGER
    },
    end: {
        type: INTEGER
    },
}, {
    // modelName:"proposals",
    tableName: "proposals"
})
