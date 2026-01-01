const express= require('express');
const mydb = require("mysql2")

const db = mydb.createConnection({
    host: "localhost",
    user: "root",
    password: "789456Ahmad@",
  //  database: "mydb"
})

//console.log(db.execute(`show databases`));
console.log("Connected to database");