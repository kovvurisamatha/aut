const express = require('express')
const app = express()
app.use(express.json())
const path = require('path')
const dbpath = path.join(__dirname, 'userData.db')
let db = null
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const bcrypt = require('bcrypt')
const initializeandstartdb = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server running at http://localhost/3000/')
    })
  } catch (e) {
    console.log(`db error:${e.message}`)
    process.exit(1)
  }
}
initializeandstartdb()
module.exports = app
//api1
app.post('/register', async (request, response) => {
  const {username, name, password, gender, location} = request.body
  let hashedpassword = await bcrypt.hash(password, 10)
  let checkusername = `select * from user where username='${username}'`
  let userdata = await db.get(checkusername)
  if (userdata === undefined) {
    let newuser = `insert into user
        (username,name,password,gender,location)
        values('${username}','${name}','${password}','${gender}','${location}')`
    if (password.length < 5) {
      response.status(400)
      response.send('Password is too short')
    } else {
      let newuserdetails = await db.run(newuser)
      response.status(200)
      response.send('User created successfully')
    }
  } else {
    response.status(400)
    response.send('User already exists')
  }
})
//api2
app.post('/login', async (request, response) => {
  const {username, password} = request.body
  const selectuser = `select * from user
  where username='${username}'`
  const dbuser = await db.get(selectuser)
  if (dbuser === undefined) {
    response.status(400)
    response.send('Invalid user')
  } else {
    const ispasswordmatched = await bcrypt.compare(password, dbuser.password)
    if (ispasswordmatched === true) {
      response.status(200)
      response.send('Login success!')
    } else {
      response.status(400)
      response.send('Invalid password')
    }
  }
})
//api3
app.put('/change-password', async (request, response) => {
  const {username, oldPassword, newPassword} = request.body
  const selectuser = `select * from user where 
  username='${username}'`
  dbuser = await db.get(selectuser)
  if (dbuser === undefined) {
    response.status(400)
    response.send('Invalid user')
  } else {
    const ispasswordmatched = await bcrypt.compare(oldPassword, dbuser.password)
    if (ispasswordmatched === true) {
      const lengthofnewpassword = length(newpassword)
      if (lengthofnewpassword < 5) {
        response.status(400)
        response.send('Password is too short')
      } else {
        const encryptedpassword = await bcrypt.hash(newpassword, 10)
        const newpasswordquery = `update user
        set password="${encryptedpassword}"`
        dbresponse = await db.run(newpasswordquery)
        response.status(400)
        response.send('Password updated')
      }
    } else {
      response.status(400)
      response.send('Invalid current password')
    }
  }
})
