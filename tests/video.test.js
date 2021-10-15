const request = require('supertest')
const app = require('../src/app')
const Video = require('../src/models/video')
const { existingUserOneId, existingUserOne, nonExistinUser, existingUserTwo, existingUserTwoId, newMp4Video, newRejectVideo, databaseInitConfig } = require('./fixtures/db')

beforeEach(databaseInitConfig)
 
test('Creating new video with mp4 media', async () => {
    const response = await request(app)
            .post('/api/videos/upload')
            .set('Authorization', `Bearer ${existingUserOne.tokens[0].token}`)
            .attach('media', 'tests/fixtures/mp4Media.mp4')
            .field({
                title: newMp4Video.title,
                description: newMp4Video.description
            })
            .expect(201)
    
    const video = await Video.findById(response.body._id)
    expect(video).not.toBeNull()
    expect(video.title).toBe(newMp4Video.title)
    expect(video.description).toBe(newMp4Video.description)
    expect(video.likes).toBe(0)
    expect(video.dislikes).toBe(0)
    expect(video.tags).toEqual([])
    expect(video.owner).toEqual(existingUserOneId)
})
 
test('Reject Creating new video with non-mp4 media', async () => {
    const response = await request(app)
            .post('/api/videos/upload')
            .set('Authorization', `Bearer ${existingUserOne.tokens[0].token}`)
            .attach('media', 'tests/fixtures/aviMedia.avi')
            .field({
                title: newRejectVideo.title,
                description: newRejectVideo.description
            })
            .expect(400)
    
    const video = await Video.findById(response.body._id)
    expect(video).toBeNull()
})
 
test('Reject Creating new video with large-mp4 media', async () => {
    const response = await request(app)
            .post('/api/videos/upload')
            .set('Authorization', `Bearer ${existingUserOne.tokens[0].token}`)
            .attach('media', 'tests/fixtures/mp4LargeMedia.mp4')
            .field({
                title: newRejectVideo.title,
                description: newRejectVideo.description
            })
            .expect(400)
    
    const video = await Video.findById(response.body._id)
    expect(video).toBeNull()
})

test('Reject Creating new video with existing Title', async () => {
    const response = await request(app)
            .post('/api/videos/upload')
            .set('Authorization', `Bearer ${existingUserOne.tokens[0].token}`)
            .attach('media', 'tests/fixtures/mp4Media.mp4')
            .field({
                title: newMp4Video.title,
                description: newMp4Video.description
            })
    .expect(201)

    const responseExisting = await request(app)
            .post('/api/videos/upload')
            .set('Authorization', `Bearer ${existingUserOne.tokens[0].token}`)
            .attach('media', 'tests/fixtures/mp4Media.mp4')
            .field({
                title: newMp4Video.title,
                description: newMp4Video.description
            })
            .expect(400)
    
    const video = await Video.findById(response.body._id)
    expect(video).not.toBeNull()
    
    const existingVideo = await Video.findById(responseExisting.body._id) 
    expect(existingVideo).toBeNull()
})

test('Getting All videos', async () => {
    await request(app)
            .post('/api/videos/upload')
            .set('Authorization', `Bearer ${existingUserOne.tokens[0].token}`)
            .attach('media', 'tests/fixtures/mp4Media.mp4')
            .field({
                title: newMp4Video.title,
                description: newMp4Video.description,
                science: 'science',
            })
            .expect(201)
    
    await request(app)
            .post('/api/videos/upload')
            .set('Authorization', `Bearer ${existingUserOne.tokens[0].token}`)
            .attach('media', 'tests/fixtures/mp4Media.mp4')
            .field({
                title: 'Another title',
                description: newMp4Video.description,
                sports: 'sports',
            })
            .expect(201)

    const response = await request(app)
            .get('/api/videos')
            .send()
            .expect(200)    
    expect(response.body.length).toBe(2)
})

test('Getting videos searching by tag sports', async () => {
    await request(app)
            .post('/api/videos/upload')
            .set('Authorization', `Bearer ${existingUserOne.tokens[0].token}`)
            .attach('media', 'tests/fixtures/mp4Media.mp4')
            .field({
                title: newMp4Video.title,
                description: newMp4Video.description,
                science: 'science',
            })
            .expect(201)
    
    await request(app)
            .post('/api/videos/upload')
            .set('Authorization', `Bearer ${existingUserOne.tokens[0].token}`)
            .attach('media', 'tests/fixtures/mp4Media.mp4')
            .field({
                title: 'Another title',
                description: newMp4Video.description,
                sports: 'sports',
            })
            .expect(201)

    const response = await request(app)
            .get('/api/videos?tag=sports')
            .send()
            .expect(200)    
    expect(response.body.length).toBe(1)
    expect(response.body[0].title).toBe('Another title')
    expect(response.body[0].description).toBe(newMp4Video.description)
    expect(response.body[0].tags).toEqual(['sports'])
})

test('Getting videos searching by title', async () => {
    await request(app)
            .post('/api/videos/upload')
            .set('Authorization', `Bearer ${existingUserOne.tokens[0].token}`)
            .attach('media', 'tests/fixtures/mp4Media.mp4')
            .field({
                title: newMp4Video.title,
                description: newMp4Video.description,
                science: 'science',
            })
            .expect(201)
    
    await request(app)
            .post('/api/videos/upload')
            .set('Authorization', `Bearer ${existingUserOne.tokens[0].token}`)
            .attach('media', 'tests/fixtures/mp4Media.mp4')
            .field({
                title: 'Another title',
                description: newMp4Video.description,
                sports: 'sports',
            })
            .expect(201)

    const response = await request(app)
            .get('/api/videos?searchParams=title')
            .send()
            .expect(200)    
    expect(response.body.length).toBe(2)
    expect(response.body[0].title).toBe('Another title')
    expect(response.body[0].description).toBe(newMp4Video.description)
    expect(response.body[0].tags).toEqual(['sports'])
    expect(response.body[1].title).toBe(newMp4Video.title)
    expect(response.body[1].description).toBe(newMp4Video.description)
    expect(response.body[1].tags).toEqual(['science'])
})

test('Getting video buffer', async () => {
    const uploadRes = await request(app)
            .post('/api/videos/upload')
            .set('Authorization', `Bearer ${existingUserOne.tokens[0].token}`)
            .attach('media', 'tests/fixtures/mp4Media.mp4')
            .field({
                title: newMp4Video.title,
                description: newMp4Video.description,
                science: 'science',
            })
            .expect(201)
    
    const video = await Video.findById(uploadRes.body._id)
    expect(video.mediaBuffer).toEqual(expect.any(Buffer))  
    const url = `/api/videos/${uploadRes.body._id}`
    const response = await request(app)
            .get(url)
            .send()
            .expect(200)
    
    expect(response.body.mediaBuffer).toEqual(expect.any(String))
})

test('Valorating video by first time (like)', async () => {
    const uploadRes = await request(app)
            .post('/api/videos/upload')
            .set('Authorization', `Bearer ${existingUserOne.tokens[0].token}`)
            .attach('media', 'tests/fixtures/mp4Media.mp4')
            .field({
                title: newMp4Video.title,
                description: newMp4Video.description,
                science: 'science',
            })
            .expect(201)
            
    const video = await Video.findById(uploadRes.body._id)
    expect(video.likes).toBe(0)
    expect(video.dislikes).toBe(0)

    const url = `/api/videos/${uploadRes.body._id}/like`
    const response = await request(app)
            .patch(url)
            .set('Authorization', `Bearer ${existingUserOne.tokens[0].token}`)
            .send()
            .expect(200)    
    expect(response.body.likes).toBe(1)
    expect(response.body.dislikes).toBe(0)

    const videoLater = await Video.findById(uploadRes.body._id)
    expect(videoLater.likes).toBe(1)
    expect(videoLater.dislikes).toBe(0)
})

test('Valorating video by first time (dislike)', async () => {
    const uploadRes = await request(app)
            .post('/api/videos/upload')
            .set('Authorization', `Bearer ${existingUserOne.tokens[0].token}`)
            .attach('media', 'tests/fixtures/mp4Media.mp4')
            .field({
                title: newMp4Video.title,
                description: newMp4Video.description,
                science: 'science',
            })
            .expect(201)
            
    const video = await Video.findById(uploadRes.body._id)
    expect(video.likes).toBe(0)
    expect(video.dislikes).toBe(0)

    const url = `/api/videos/${uploadRes.body._id}/dislike`
    const response = await request(app)
            .patch(url)
            .set('Authorization', `Bearer ${existingUserOne.tokens[0].token}`)
            .send()
            .expect(200)    
    expect(response.body.likes).toBe(0)
    expect(response.body.dislikes).toBe(1)

    const videoLater = await Video.findById(uploadRes.body._id)
    expect(videoLater.likes).toBe(0)
    expect(videoLater.dislikes).toBe(1)
})

test('Valorating video by first time (like) no Auth', async () => {
    const uploadRes = await request(app)
            .post('/api/videos/upload')
            .set('Authorization', `Bearer ${existingUserOne.tokens[0].token}`)
            .attach('media', 'tests/fixtures/mp4Media.mp4')
            .field({
                title: newMp4Video.title,
                description: newMp4Video.description,
                science: 'science',
            })
            .expect(201)
            
    const video = await Video.findById(uploadRes.body._id)
    expect(video.likes).toBe(0)
    expect(video.dislikes).toBe(0)

    const url = `/api/videos/${uploadRes.body._id}/like`
    const response = await request(app)
            .patch(url)
            .send()
            .expect(401)

    const videoLater = await Video.findById(uploadRes.body._id)
    expect(videoLater.likes).toBe(0)
    expect(videoLater.dislikes).toBe(0)
})

test('Valorating video by first time (dislike) no Auth', async () => {
    const uploadRes = await request(app)
            .post('/api/videos/upload')
            .set('Authorization', `Bearer ${existingUserOne.tokens[0].token}`)
            .attach('media', 'tests/fixtures/mp4Media.mp4')
            .field({
                title: newMp4Video.title,
                description: newMp4Video.description,
                science: 'science',
            })
            .expect(201)
            
    const video = await Video.findById(uploadRes.body._id)
    expect(video.likes).toBe(0)
    expect(video.dislikes).toBe(0)

    const url = `/api/videos/${uploadRes.body._id}/dislike`
    const response = await request(app)
            .patch(url)
            .send()
            .expect(401)

    const videoLater = await Video.findById(uploadRes.body._id)
    expect(videoLater.likes).toBe(0)
    expect(videoLater.dislikes).toBe(0)
})

test('Valorating video by second time (like)', async () => {
    const uploadRes = await request(app)
            .post('/api/videos/upload')
            .set('Authorization', `Bearer ${existingUserOne.tokens[0].token}`)
            .attach('media', 'tests/fixtures/mp4Media.mp4')
            .field({
                title: newMp4Video.title,
                description: newMp4Video.description,
                science: 'science',
            })
            .expect(201)
            
    const video = await Video.findById(uploadRes.body._id)
    expect(video.likes).toBe(0)
    expect(video.dislikes).toBe(0)

    const url = `/api/videos/${uploadRes.body._id}/like`
    await request(app)
            .patch(url)
            .set('Authorization', `Bearer ${existingUserOne.tokens[0].token}`)
            .send()
            .expect(200)    
    const response = await request(app)
            .patch(url)
            .set('Authorization', `Bearer ${existingUserOne.tokens[0].token}`)
            .send()
            .expect(200)    
    expect(response.body.likes).toBe(1)
    expect(response.body.dislikes).toBe(0)

    const videoLater = await Video.findById(uploadRes.body._id)
    expect(videoLater.likes).toBe(1)
    expect(videoLater.dislikes).toBe(0)
})

test('Valorating video by second time (dislike)', async () => {
    const uploadRes = await request(app)
            .post('/api/videos/upload')
            .set('Authorization', `Bearer ${existingUserOne.tokens[0].token}`)
            .attach('media', 'tests/fixtures/mp4Media.mp4')
            .field({
                title: newMp4Video.title,
                description: newMp4Video.description,
                science: 'science',
            })
            .expect(201)
            
    const video = await Video.findById(uploadRes.body._id)
    expect(video.likes).toBe(0)
    expect(video.dislikes).toBe(0)

    const url = `/api/videos/${uploadRes.body._id}/dislike`
    await request(app)
            .patch(url)
            .set('Authorization', `Bearer ${existingUserOne.tokens[0].token}`)
            .send()
            .expect(200)    
    const response = await request(app)
            .patch(url)
            .set('Authorization', `Bearer ${existingUserOne.tokens[0].token}`)
            .send()
            .expect(200)    
    expect(response.body.likes).toBe(0)
    expect(response.body.dislikes).toBe(1)

    const videoLater = await Video.findById(uploadRes.body._id)
    expect(videoLater.likes).toBe(0)
    expect(videoLater.dislikes).toBe(1)
})

test('Valorating video by second time (like to dislike)', async () => {
    const uploadRes = await request(app)
            .post('/api/videos/upload')
            .set('Authorization', `Bearer ${existingUserOne.tokens[0].token}`)
            .attach('media', 'tests/fixtures/mp4Media.mp4')
            .field({
                title: newMp4Video.title,
                description: newMp4Video.description,
                science: 'science',
            })
            .expect(201)
            
    const video = await Video.findById(uploadRes.body._id)
    expect(video.likes).toBe(0)
    expect(video.dislikes).toBe(0)

    const url = `/api/videos/${uploadRes.body._id}/like`
    const url2 = `/api/videos/${uploadRes.body._id}/dislike`
    const response1 = await request(app)
            .patch(url)
            .set('Authorization', `Bearer ${existingUserOne.tokens[0].token}`)
            .send()
            .expect(200)
    expect(response1.body.likes).toBe(1)
    expect(response1.body.dislikes).toBe(0)            
    const response2 = await request(app)
            .patch(url2)
            .set('Authorization', `Bearer ${existingUserOne.tokens[0].token}`)
            .send()
            .expect(200)    
    expect(response2.body.likes).toBe(0)
    expect(response2.body.dislikes).toBe(1)

    const videoLater = await Video.findById(uploadRes.body._id)
    expect(videoLater.likes).toBe(0)
    expect(videoLater.dislikes).toBe(1)
})

test('Valorating video by second time (dislike to like)', async () => {
    const uploadRes = await request(app)
            .post('/api/videos/upload')
            .set('Authorization', `Bearer ${existingUserOne.tokens[0].token}`)
            .attach('media', 'tests/fixtures/mp4Media.mp4')
            .field({
                title: newMp4Video.title,
                description: newMp4Video.description,
                science: 'science',
            })
            .expect(201)
            
    const video = await Video.findById(uploadRes.body._id)
    expect(video.likes).toBe(0)
    expect(video.dislikes).toBe(0)

    const url = `/api/videos/${uploadRes.body._id}/dislike`
    const url2 = `/api/videos/${uploadRes.body._id}/like`
    const response1 = await request(app)
            .patch(url)
            .set('Authorization', `Bearer ${existingUserOne.tokens[0].token}`)
            .send()
            .expect(200)
    expect(response1.body.likes).toBe(0)
    expect(response1.body.dislikes).toBe(1)    
    const response2 = await request(app)
            .patch(url2)
            .set('Authorization', `Bearer ${existingUserOne.tokens[0].token}`)
            .send()
            .expect(200)    
    expect(response2.body.likes).toBe(1)
    expect(response2.body.dislikes).toBe(0)

    const videoLater = await Video.findById(uploadRes.body._id)
    expect(videoLater.likes).toBe(1)
    expect(videoLater.dislikes).toBe(0)
})

test('Deleting my video', async () => {
   const response = await request(app)
           .post('/api/videos/upload')
           .set('Authorization', `Bearer ${existingUserOne.tokens[0].token}`)
           .attach('media', 'tests/fixtures/mp4Media.mp4')
           .field({
               title: newMp4Video.title,
               description: newMp4Video.description
           })
           .expect(201)
   
   const video = await Video.findById(response.body._id)
   expect(video).not.toBeNull()

   const url = `/api/videos/${response.body._id}`
   await request(app)
           .delete(url)
           .set('Authorization', `Bearer ${existingUserOne.tokens[0].token}`)
           .send()
           .expect(200)

   const videoLater = await Video.findById(response.body._id)
   expect(videoLater).toBeNull()
})

test('Deleting other user video', async () => {
   const response = await request(app)
           .post('/api/videos/upload')
           .set('Authorization', `Bearer ${existingUserOne.tokens[0].token}`)
           .attach('media', 'tests/fixtures/mp4Media.mp4')
           .field({
               title: newMp4Video.title,
               description: newMp4Video.description
           })
           .expect(201)
   
   const video = await Video.findById(response.body._id)
   expect(video).not.toBeNull()

   const url = `/api/videos/${response.body._id}`
   await request(app)
           .delete(url)
           .set('Authorization', `Bearer ${existingUserTwo.tokens[0].token}`)
           .send()
           .expect(401)

   const videoLater = await Video.findById(response.body._id)
   expect(videoLater).not.toBeNull()
})

test('Deleting my video no Auth', async () => {
   const response = await request(app)
           .post('/api/videos/upload')
           .set('Authorization', `Bearer ${existingUserOne.tokens[0].token}`)
           .attach('media', 'tests/fixtures/mp4Media.mp4')
           .field({
               title: newMp4Video.title,
               description: newMp4Video.description
           })
           .expect(201)
   
   const video = await Video.findById(response.body._id)
   expect(video).not.toBeNull()

   const url = `/api/videos/${response.body._id}`
   await request(app)
           .delete(url)
           .send()
           .expect(401)

   const videoLater = await Video.findById(response.body._id)
   expect(videoLater).not.toBeNull()
})

/*
test('Deleting my tasks', async () => {
    await request(app)
            .delete(`/tasks/${taskOneId}`)
            .set('Authorization', `Bearer ${existingUser.tokens[0].token}`)
            .send()
            .expect(200)
    const task = await Task.findById(taskOneId)
    expect(task).toBeNull()
})

test('Deleting other user tasks', async () => {
    await request(app)
            .delete(`/tasks/${taskThreeId}`)
            .set('Authorization', `Bearer ${existingUser.tokens[0].token}`)
            .send()
            .expect(404)
    const task = await Task.findById(taskThreeId)
    expect(task).not.toBeNull()
}) */