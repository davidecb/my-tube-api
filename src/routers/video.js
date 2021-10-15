const express = require('express')
const multer = require('multer')
const Video = require('../models/video')
const auth = require('../middlewares/auth')
const fs = require('fs')
const router = new express.Router()

const API_KEY = 'a623b1a6-caf3-43b3-b992-892c79fec7a9'
/* 
const storage = multer.diskStorage({
    destination: 'D:/Documentos/ceiba-globant-node-course/my-tube-app/serverStorage',
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + req.user._id + '.' + file.mimetype.split('/')[1]
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
}) */

const upload = multer({/* 
    storage: storage, */
    limits: {
        fileSize: 1024 * 1024 * 16
    },
    fileFilter (req, file, cb) {
        if(! file.originalname.match(/\.(mp4)$/)) {
           return cb(new Error('Please upload a MP4 video file')) 
        }

        cb(undefined, true)
    }
})

router.post('/api/videos/upload', auth, upload.single('media'), async (req, res) => {    
    try {
        const data = req.body
        console.log(req.file)
        const {title, description, ...args} = data;
        const videos = await Video.find({ title })

        if (videos.length > 0) {
            throw new Error('this title was taken')
        }

        const tags = []
        for (const key in args) {
            tags.push(args[key])
        }
        const mediaBuffer = req.file.buffer
        //const videoSrc = req.file.filename

        const video = new Video({
            title,
            description,
            videoType: req.file.mimetype,
            mediaBuffer,
            //videoSrc,
            tags,
            owner: req.user._id
        })

        await video.save()
        res.status(201).send(video)
    } catch (err) {
        res.status(400).send({ error: err.message }) 
    }   
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.get('/api/videos', async (req, res) => {
    try {
        const findObj = {}
        const { searchParams, tag } = req.query

        if (searchParams) {
            findObj.title = {$regex:`.*${searchParams}`,$options:"i"}
        }

        if (tag && tag !== 'all') {
            findObj.tags = tag
        }

        const videos = await Video.find(findObj).sort({ createdAt: -1 })
        res.status(200).send(videos)
    } catch (err) {
        res.status(500).send({ error: err.message })
    }
})

router.get('/api/myvideos', auth, async (req, res) => {
    try {
        await req.user.populate('videos')
        res.status(200).send(req.user.videos)
    } catch (err) {
        res.status(500).send({ error: err.message })
    }
})

router.get('/api/videos/:id', async (req, res) => {
    try {
        const video = await Video.findById(req.params.id)
        const videoInfo = await video.getVideoBuffer()
        res.status(200).send(videoInfo)
    } catch (err) {
        res.status(500).send({ error: err.message })
    }
})

router.get('/api/videos/download/:id', async (req, res) => {
    try {
        const video = await Video.findById(req.params.id)
        res.status(200).send()
    } catch (err) {
        console.log(err)
        res.status(500).send({ error: err.message })
    }
})

router.patch('/api/videos/:id/:valoration', auth, async (req, res) => {
    try {
        const videoId = req.params.id
        const video = await Video.findById(videoId)
        const valoration = req.params.valoration
        const alreadyRated = req.user.valorations.filter((valoration) => valoration.videoId.toString() === videoId)
        if (alreadyRated.length === 0) {
            if (valoration === 'like') {
                video.likes +=  1
            } else if (valoration === 'dislike') {
                video.dislikes +=  1
            } else {
                throw new Error()
            }
        } else {
            if (alreadyRated[0].valoration !== valoration) {
                if (valoration === 'like') {
                    video.likes +=  1
                    video.dislikes -=  1
                } else if (valoration === 'dislike') {
                    video.dislikes +=  1
                    video.likes -=  1
                } else {
                    throw new Error()
                }
                req.user.valorations = req.user.valorations.filter((valoration) => valoration.videoId.toString() !== videoId)
            }
        }
        req.user.valorations = req.user.valorations.concat({ videoId, valoration })
        await video.save()
        await req.user.save()
        res.status(200).send({
            likes: video.likes,
            dislikes: video.dislikes
        })
    } catch (err) {
        res.status(500).send({ error: err.message })
    }
})

router.delete('/api/videos/:id', auth, async (req, res) => {
    try {
        const _id = req.params.id
        const video = await Video.findOneAndDelete({ _id, owner: req.user._id })

        if (!video) {
            return res.status(404).send()
        }

        res.send(video)
    } catch (err) {
        res.status(500).send({ error: err.message })
    }
})

module.exports = router