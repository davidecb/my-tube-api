const mongoose = require('mongoose')

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    videoSrc: {
        type: String
    },
    videoType: {
        type: String
    },
    tags: {        
        type: Array        
    },
    likes: {
        type: Number,
        default: 0
    },
    dislikes: {
        type: Number,
        default: 0
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})

videoSchema.methods.toJSON = function () {
    const video = this
    const videoObject = video.toObject()
    
    delete videoObject.videoType
    delete videoObject.__v
    delete videoObject.updatedAt

    return videoObject
}

videoSchema.methods.getVideoBuffer = function () {
    const video = this
    const videoObject = video.toObject()

    delete videoObject.__v    
    delete videoObject.updatedAt
    delete videoObject.createdAt

    return videoObject
}

const Video = mongoose.model('Video', videoSchema)

module.exports = Video
