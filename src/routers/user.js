const express = require('express')
//const multer = require('multer')
const auth = require('../middlewares/auth')
const User = require('../models/user')

const router = new express.Router()

router.post('/api/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (err) {
        res.status(400).send({ error: err.message })
    }
})

router.post('/api/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password) 
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (err) {
        res.status(400).send({ error: err.message })
    }
})

router.post('/api/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token)
        await req.user.save()
        res.send()
    } catch (err) {
        res.status(500).send({ error: err.message })
    }
})

router.post('/api/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (err) {
        res.status(500).send({ error: err.message })
    }
})


router.delete('/api/users/me', auth, async (req, res) => {
    try {        
        await req.user.remove()
        res.send(req.user)        
    } catch (err) {
        res.status(500).send()
    }
})

module.exports = router