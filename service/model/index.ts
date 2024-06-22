"use strict";

import { DataTypes, Dialect, Sequelize } from "sequelize";
const fs = require("fs");
const path = require("path");
const basename = path.basename(__filename);
const dbConfig = {
    username: "ding",
    password: "ding950613",
    database: "nfts_data_center_test",
    host: "127.0.0.1",
    dialect: "mysql" as Dialect,
    dialectOptions: {
        charset: "utf8mb4"
    },
    timezone: "+08:00",
    pool: {
        max: 80,
        min: 1
    }
}

const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
        ...dbConfig,
        benchmark: true,
        logging: (log, timing) => {
            if (log.includes('Error')) {
                console.error(log);
            } else {
                console.log(`${log},${timing}ms`);
            }
        },
    }
);

const quietSequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
        ...dbConfig,
        benchmark: true,
        logging: (log) => {
            if (log.includes('Error')) {
                console.error(log);
            }
        }
    }
);

const db = { quietSequelize, sequelize, Sequelize };


fs.readdirSync(__dirname)
    .filter((file) => {
        return (
            file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
        );
    })
    .forEach((file) => {
        try {
            let model = require(path.join(__dirname, file))(
                sequelize,
                DataTypes
            );
            db[model.name] = model;
        } catch (e) { }
    });

Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

module.exports = db;
export { Sequelize, sequelize, quietSequelize };
// const a= {...db}
// export { sequelize, Sequelize, ...db };

