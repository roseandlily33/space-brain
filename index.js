const express = require('express');
const app = express();
const PORT = 3004 || process.env.PORT;
const bodyParser = require('body-parser');
app.use(bodyParser.json());

const bcrypt = require('bcrypt');
const saltRounds = 10;
// const myPlaintextPassword = 's0/\/\P4$$w0rD';
// const someOtherPlaintextPassword = 'not_bacon';

const database =  {
    users: [
        {id: 123, name: 'John', entries: 0, joined: new Date()},
        {id: 1234, name: 'Sabrina', entries: 0, joined: new Date()}
    ]
}


app.get('/', (req, res) => {
    res.send(database.users)
})
app.post('/signin', (req, res) => {
    const {password, name} = req.body;
    if(req.body){
        bcrypt.compare(password, hash, function(err, result) {
          if(err){
            res.json('Could not login')
          } else {
            res.json(result);
          }
        });
        // bcrypt.compare(someOtherPlaintextPassword, hash, function(err, result) {
        //     // result == false
        // });
        //console.log(req.body);
        //console.log(database);
        res.json('Signing in completed')
    } else {
        res.json('Error logging in')
    }
    
})
app.post('/register', (req, res) => {
    const {name, password} = req.body;
    bcrypt.genSalt(saltRounds, function(err, salt) {
        if(err){
            res.json('Could not store information')
        }
        bcrypt.hash(password, salt, function(err, hash) {
            // Store hash in your password DB.
        });
    });
    
    if(req.body){
        database.users.push({
            id: 12345,
            name: name,
            password: password,
            entries: 0,
            joined: new Date()
        });
        res.json(database.users[database.users.length -1]);
        console.log(database)
    } else {
        res.json('User was not craeted')
    }
})
app.get('/profile/:id', (req, res) => {
    const {id} = req.params;
    let found = false;
    database.users.forEach(user => {
        if(user.id == id){
            found = true;
            res.json(user)
        } else {
            res.status(404).json("no user found")
        }
    })
    if(!found){
        res.status(400).json('Not Found')
    }
})
app.post('/image', (req, res) => {
    const {id} = req.params;
    let found = false;
    database.users.forEach(user => {
        if(user.id === id){
            found = true;
            return res.json(user)
        } else {
            return res.json('Image not found')
        }
    })
})

app.listen(PORT, () => {
    console.log('App listening on port ', PORT);
})