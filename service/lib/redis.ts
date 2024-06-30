import Redis from 'ioredis';
let redis = new Redis({
    host: "r-j6cbkponby9m53hb02.redis.rds.aliyuncs.com",
    password: "Happyblock123",
    port: "6379",
    db: 13
},);;

export default redis