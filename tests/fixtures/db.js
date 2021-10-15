const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../../src/models/user')
const Video = require('../../src/models/video')

const existingUserOneId = new mongoose.Types.ObjectId()
const existingUserTwoId = new mongoose.Types.ObjectId()
const taskOneId = new mongoose.Types.ObjectId()
const taskThreeId = new mongoose.Types.ObjectId()

const existingUserOne = {
    _id: existingUserOneId,
    name: "Testing character One",
    password: "123456.*",
    email: "testingCharOne@test.com",
    tokens: [{
        token: jwt.sign({ _id: existingUserOneId }, process.env.JWT_SECRET)
    }]
}

const existingUserTwo = {
    _id: existingUserTwoId,
    name: "Testing character Two",
    password: "654321.*",
    email: "testingCharTwo@test.com",
    tokens: [{
        token: jwt.sign({ _id: existingUserTwoId }, process.env.JWT_SECRET)
    }]
}

const nonExistinUser = {
    name: "D. E. C. B.",
    password: "11235813.*",
    email: "davidecobaez@test.com"
}

const newMp4Video = {
    title: 'Test MP4 Title',
    description: 'Test MP4 Desciption'
}

const newRejectVideo = {
    title: 'Test reject Title',
    description: 'Test reject Desciption'
}

const databaseInitConfig = async () => {
    await User.deleteMany()
    await Video.deleteMany()
    await new User(existingUserOne).save()
}

module.exports = {
    existingUserOneId,
    existingUserOne,
    existingUserTwoId,
    existingUserTwo,
    nonExistinUser,
    newMp4Video,
    newRejectVideo,
    databaseInitConfig
}