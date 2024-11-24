const express = require('express')
const { UserController } = require('../controllers/UserController')


const router = express.Router()


router.post('/login',UserController.loginUser)
router.post('/register-user', UserController.registerUser)
router.put('/reset-password',UserController.resetPassword)
router.get('/:id',UserController.getUserData)

