const setup = require('../data/setup.js');
const pool = require('../lib/utils/pool.js');
const request = require('supertest');
const app = require('../lib/app');
const Post = require('../lib/models/Post.js');

jest.mock('../lib/services/github');

describe('posts', () => {
  beforeEach(() => {
    return setup(pool);
  });
  afterAll(() => {
    pool.end();
  });

  it('POST /api/v1/posts creates a new post for signed in users', async () => {
    const agent = request.agent(app);
    const user = await agent
      .get('/api/v1/github/callback?code=42')
      .redirects(1);
    const newPost = { description: 'what a test time!', user_id: user.body.id };
    const res = await agent.post('/api/v1/posts').send(newPost);
    // expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: expect.any(String),
      description: newPost.description,
      user_id: newPost.user_id,
    });
  });

  it('GET /api/v1/posts should return a list of posts if logged in', async () => {
    const agent = request.agent(app);
    const user = await agent
      .get('/api/v1/github/callback?code=42')
      .redirects(1);
    const newPost = await Post.insert({
      description: 'fancy words',
      user_id: user.body.id,
    });
    const res = await agent.get('/api/v1/posts');
    expect(res.status).toBe(200);
    expect(res.body[0]).toEqual(newPost);
  });
});
