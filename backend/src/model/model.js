const express = require('express');
const mysql = require('mysql2/promise');

const connectdb = async () => {
    try {
        const db = await mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "789456Ahmad@",
            database: "mysql" // uncomment when you have a specific database
        });
        
        console.log("Connected to MySQL database");
        
        // // Show databases
        // const [rows] = await db.execute('SHOW DATABASES');
        // console.log('Available databases:', rows);
        
        return db;
    } catch (error) {
        console.error('Database connection failed:', error.message);
        throw error;
    }
};

const createitem = async(data) => {
    let connection;
    try{
        connection = await connectdb();
       // console.log("Connected to MySQL database");
    const [result] = await connection.query(
        'INSERT INTO item(name,price,category,quantity) VALUES (?,?,?,?)',[data.name,data.price,data.category,data.quantity]
    );
    console.log("Item created successfully",result.insertId);
    return {success: true , insertId: result.insertId,...data};
}
catch(error){
     console.error('Error creating item:', error.message);
      return {success: false, error: error.message};
}
finally{
    if(connection){
       await connection.end();
    }
}
}

const getitems= async () => {
let connection;
try{
    connection = await connectdb();
   const [result] = await connection.query(
    'SELECT * FROM item'
   );
   console.log("Items", result);
   return result;
}
catch(error){
    console.error('Error getting items', error.message);   
     return {success: false, error: error.message};
}
finally{
    if(connection){
       await connection.end();
    }
}
}

const updatebyid = async (id,data) => {
    let connection;
    try{
        connection = await connectdb();
        const[result] = await connection.query(
           'UPDATE item SET name=?,price=?,category=?,quantity=? WHERE id=?',[data.name,data.price,data.category,data.quantity,id]
        
        );
        console.log("Item updated successfully", result.affectedRows);
        return [result,data];
    }
    catch(error){
        console.error('Error updating item', error.message);
        return {success: false, error: error.message};
    }
    finally{
        if(connection){
           await connection.end();
        }
    }
}

const deletebyid = async (id) => {
    let connection;
    try{
        connection = await connectdb();
        const[result] = await connection.query(
           'DELETE FROM item WHERE id=?',[id]
        );
        console.log("Item deleted successfully", result.affectedRows);
        return result;
    }
    catch(error){
        console.error('Error deleting item', error.message);
        return {success: false, error: error.message};
    }
    finally{
        if(connection){
           await connection.end();
        }
    }
}
// Initialize database connection
connectdb().catch(console.error);

module.exports = { connectdb,createitem,getitems,updatebyid,deletebyid };