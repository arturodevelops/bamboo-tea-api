const express = require('express')
const { UserController } = require('../controllers/UserController')
const authenticateToken = require('../middleware/authenticateToken')


const router = express.Router()


router.post('/login',UserController.loginUser)
router.post('/register-user', authenticateToken,UserController.registerUser)
router.put('/reset-password',authenticateToken,UserController.resetPassword)
router.get('/:id',authenticateToken,UserController.getUserData)

module.exports.UserRoutes = {router}

