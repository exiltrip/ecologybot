const Router = require('express')
const router = new Router()
const applicationController = require('../controllers/application.controller')

router.post('/application', applicationController.createApplication)
router.get('/application', applicationController.getApplications)
router.get('/application/:id', applicationController.getOneApplication)
router.delete('/application/:id', applicationController.deleteApplication)

module.exports = router
