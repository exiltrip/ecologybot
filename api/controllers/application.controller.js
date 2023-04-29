const db = require('../db')


class applicationController {
    async createApplication(req, res) {
        const {telegramid, fio, age, aboutme} = req.body
        const newPost = await db.query(`INSERT INTO applications (telegramid, fio, age, aboutme) values ($1, $2, $3, $4) RETURNING *`, [telegramid, fio, age, aboutme])
        res.json(newPost.rows[0])
    }
    async getApplications(req, res) {
        const Posts = await db.query(`SELECT * FROM applications`)
        res.json(Posts.rows)

    }
    async getOneApplication(req, res) {
        const id = req.params.id
        const Post = await db.query(`SELECT * FROM applications where telegramid = $1`, [id])
        res.json(Post.rows[0])
    }
    async deleteApplication(req, res) {
        const id = req.params.id
        const Post = await db.query(`DELETE FROM applications where id = $1`, [id])
        res.json(Post.rows[0])

    }
}

module.exports = new applicationController()
