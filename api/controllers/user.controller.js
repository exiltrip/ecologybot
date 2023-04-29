const db = require('../db')


class usersController {
    async createUser(req, res) {
        const {telegramid, username, role} = req.body
        const newPost = await db.query(`INSERT INTO users (telegramid, username, role) values ($1, $2, $3) RETURNING *`, [telegramid, username, role])
        res.json(newPost.rows[0])
    }
    async getUsers(req, res) {
        const Posts = await db.query(`SELECT * FROM users`)
        res.json(Posts.rows)

    }
    async getOneUser(req, res) {
        const id = req.params.id
        const Post = await db.query(`SELECT * FROM users where telegramid = $1`, [id])
        res.json(Post.rows[0])
    }
    async deleteUser(req, res) {
        const id = req.params.id
        const Post = await db.query(`DELETE FROM users where id = $1`, [id])
        res.json(Post.rows[0])

    }
}

module.exports = new usersController()
