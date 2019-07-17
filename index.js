const express = require('express')
const bodyParser = require('body-parser')
const expressJwt = require('express-jwt')
const jwt = require('jsonwebtoken')
require('express-group-routes')
const jwt_decode = require('jwt-decode')
const app = express()

app.use(bodyParser.json())


const mysql = require('mysql')
const connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database: 'test_satu_db'
})

app.group("/api/v1", (router) => {
    router.post('/login', (req, res) =>{
        const email = req.body.email
        const password = req.body.password

        connection.query('SELECT * FROM users where email="'+email+'" and password="'+password+'"', (err, rows, fields)=>{
            if(rows.length == 1){
                //const token = jwt.sign({email:email}, 'key')
                const user_id = rows[0].user_id
                const token = jwt.sign({email:email, user_id:user_id}, 'key')

                const decoded = jwt.decode(token)
                // console.log(decoded)

                res.send({user_id, token})
            }else{
                res.send(401, "Wrong email or password")
            }            
        })
        
    })

    // router.get('/chats', expressJwt({secret: 'key'}), (req, res) =>{
    //     connection.query('SELECT * FROM chats', function(err, rows, fields){
    //         if(err) throw err

    //         res.send(rows)
    //     })
    // })
    router.get('/chats', expressJwt({secret: 'key'}), (req, res) =>{
        connection.query('SELECT users.email, users.user_id, chats.id, chats.chat, chats.time FROM users, chats where users.user_id = chats.user_id', function(err, rows, fields){
            if(err) throw err

            res.send(rows)
        })
    })
    router.post('/chat', (req, res) => {
        const user_id = req.body.userId
        const chat = req.body.chat
        const time = req.body.time

        connection.query('INSERT INTO chats(user_id, time, chat) values('+user_id+',"'+time+'", "'+chat+'")', function(err, rows, fields){
            if(err) throw err

            res.send(rows)
        })
    })
    router.delete('/chat/:id', (req, res) =>{
        const id = req.params.id
        
        connection.query('DELETE FROM chats WHERE id = '+id+' ', function(err, rows, fields){
            if(err)throw err

            res.send(rows)
        })
    })
    router.patch('/chat/:id', (req, res) =>{
        const id = req.params.id
        const chat = req.body.chat

        connection.query('UPDATE chats set chat="'+chat+'" where id='+id+'', function(err, rows, fields){
            if(err) throw err

            res.send(rows)
        })
    })
    // router.get('/account/:email', (req, res) =>{
    //     const email = req.params.email
    //     const password = req.params.password

    //     // connection.query('SELECT * FROM accounts where email="'+email+'" and password="'+password+'"', function(err, rows){
    //         connection.query('SELECT * FROM accounts where email="'+email+'"', function(err, rows){
    //             if(err) throw err

    //         res.send(rows)
    //     })
    // })
    router.patch('/post/:id', (req, res)=>{
        const id = req.body.id
        const url = req.body.caption
        const caption = req.body.caption
        connection.query('UPDATE posts SET url="'+url+'" caption="'+caption+'" WHERE id = '+id+' ', function(err, rows, fields){
            if(err)throw err

            res.send(rows)
        })
    })
    router.delete('/post/:id', (req, res)=>{
        const id = req.body.id
        connection.query('DELETE FROM posts WHERE id = '+id+' ', function(err, rows, fields){
            if(err)throw err

            res.send(rows)
        })
    })

})

app.listen('3500', () => {console.log("App Running!")})