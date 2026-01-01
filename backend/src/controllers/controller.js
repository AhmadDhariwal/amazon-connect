const express = require("express");
const mysql = require("../model/model");

async function createitems (req,res)  {
     const items = await  mysql.createitem(req.body);
     res.status(200).json(items);
}
async function getitems(req,res){
    const items = await mysql.getitems();
    res.status(200).json(items);
}
async function updatebyid(req, res){
    const items = await mysql.updatebyid(req.params.id,req.body);
    res.status(200).json(items,"Updated");
}

async function getbyid(req,res) {
    const items= await mysql.getbyid(req.params.id);
    res.status(200).json(items,"Item");
}

async function deletebyid(req,res){
    const items = await mysql.deletebyid(req.params.id);
    res.status(200).json(items, "Deleted");
}
module.exports = {
    createitems,
    getitems,
    updatebyid,
    getbyid,
    deletebyid,
}