//@ts-nocheck
import dotenv from 'dotenv'
dotenv.config()


import './core/db'
import express from 'express'

import { registerValidations } from './validations/register';


import { UserCtrl } from './controllers/UserController';



const app = express()

app.use(express.json())


app.get('/users', UserCtrl.index)
app.post('/users', registerValidations, UserCtrl.create)

app.post('/verify', registerValidations, UserCtrl.verify)

// app.patch('/users', UserCtrl.update)
// app.delete('/users', UserCtrl.delete)


app.listen(process.env.PORT, () => {
	console.log('run')
})


//2.20