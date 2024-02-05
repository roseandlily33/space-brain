const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const knex = require('knex')({
    client: 'pg',
    connection : {
        host: '127.0.0.1',
        user: '',
        port: '5430',
        password: '',
        database: 'smart_brain'
    }
});

const app = express();
const PORT = 3004 || process.env.PORT;
app.use(express.json())
app.use(cors());



// knex.select('*').from('users')
// let result = knex.select('*').from('users').then(data => {
//     console.log(data)
// })
// console.log(result)
const saltRounds = 10;
// const myPlaintextPassword = 's0/\/\P4$$w0rD';
// const someOtherPlaintextPassword = 'not_bacon';

app.post('/signin', (req, res) => {
    console.log('Hit the sign in', req.body)
    const {password, email} = req.body;
    knex.select('hash', 'email').from('login')
    .where('email', '=', email)
    .then(data => {
        const isValid = bcrypt.compareSync(password, data[0].hash);
        if(isValid){
           return knex.select('*').from('users').where('email', '=', email)
            .then(user => res.json(user[0]))
            .catch(err => res.status(400).json({err: 'Unable to get user'}))
        } else {
            res.status(400).json('Wrong credentails')
        }
    })
    .catch(err => res.status(400).json(err));
    console.log('Was able to login user')
})
app.post('/register', (req, res) => {
    const {name, email, password} = req.body;
    const hash = bcrypt.hashSync(password, saltRounds);
    knex.transaction(trx => {
      trx.insert({
        hash: hash,
        email: email
      })
      .into('login')
      .returning('email')
      .then(loginEmail => {
        return trx('users')
          .returning('*')
          .insert({
            email: loginEmail[0].email,
            name: name,
            joined: new Date()
          })
          .then(user => {
            res.json(user[0]);
          })
      })
      .then(trx.commit)
      .catch(trx.rollback)
    })
    .catch(err => res.status(400).json(err))
})
app.get('/profile/:id', (req, res) => {
    const {id} = req.params;
    knex.select('*').where({
        id: id
    }).from('users').then(user => res.json(user[0])).catch(err => res.json({err: 'Not Found'}))
})
app.put('/image', (req, res) => {
    const {id} = req.params;
    console.log(id)
    knex.where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => res.json(entries[0].entries))
    .catch(err => res.status(400).json({err: 'Unable to set the count'}))
})

app.listen(PORT, () => {
    console.log('App listening on port ', PORT);
})