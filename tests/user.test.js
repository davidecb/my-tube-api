const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { existingUserOneId, existingUserOne, nonExistinUser, databaseInitConfig } = require('./fixtures/db')

beforeEach(databaseInitConfig)

test('Creating new user', async () => {
    const response = await request(app)
            .post('/api/users')
            .send(nonExistinUser)
            .expect(201)

    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()
    expect(response.body).toMatchObject({        
        user: {
            name: nonExistinUser.name,
            email: nonExistinUser.email,
            _id: response.body.user._id,
            valorations: []
        },
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe(nonExistinUser.password)
})
 
test('Reject creating new user with short password', async () => {
    await request(app)
            .post('/api/users')
            .send({
                name: nonExistinUser.name,
                password: "12345",
                email: nonExistinUser.email
            })
            .expect(400)
})

test('Reject creating new user with existing email', async () => {
    await request(app)
            .post('/api/users')
            .send({
                name: nonExistinUser.name,
                password: nonExistinUser.password,
                email: existingUserOne.email
            })
            .expect(400)
})

test('Login existing user', async () => {
    const response = await request(app)
            .post('/api/users/login')
            .send({
                password: existingUserOne.password,
                email: existingUserOne.email
            })
            .expect(200)

    const user = await User.findById(existingUserOneId)
    expect(user).not.toBeNull()
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Reject login non-existing user', async () => {
    await request(app)
            .post('/api/users/login')
            .send({
                password: existingUserOne.password,
                email: 'non-existing@test.com'
            })
            .expect(400)
})

test('Reject login wrong pass', async () => {
    await request(app)
            .post('/api/users/login')
            .send({
                password: 'wrong-password',
                email: existingUserOne.email
            })
            .expect(400)
})

test('Logout session', async () => {
    await request(app)
            .post('/api/users/logout')
            .set('Authorization', `Bearer ${existingUserOne.tokens[0].token}`)
            .send()
            .expect(200)
})

test('Reject Logout session without Auth', async () => {
    await request(app)
            .post('/api/users/logout')
            .send()
            .expect(401)
})

test('Logout all sessions', async () => {
    await request(app)
            .post('/api/users/logoutAll')
            .set('Authorization', `Bearer ${existingUserOne.tokens[0].token}`)
            .send()
            .expect(200)
})

test('Reject Logout all sessions without Auth', async () => {
    await request(app)
            .post('/api/users/logoutAll')
            .send()
            .expect(401)
})

test('Deleting my user', async () => {
    await request(app)
            .delete('/api/users/me')
            .set('Authorization', `Bearer ${existingUserOne.tokens[0].token}`)
            .send()
            .expect(200)

    const user = await User.findById(existingUserOneId)
    expect(user).toBeNull()
})

test('Deleting my user without auth', async () => {
    await request(app)
            .delete('/api/users/me')
            .send()
            .expect(401)
})
