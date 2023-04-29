const express = require("express")
const applicationRoutes = require('./routes/application.routes')
const userRoutes = require('./routes/user.routes')
const PORT = process.env.PORT || 8080
const app = express()
const cors = require('cors')
app.use(express.static(__dirname));


app.use(cors())
app.disable('etag');
app.get('/*', function(req, res, next){
    res.setHeader('Last-Modified', (new Date()).toUTCString());
    next();
});

app.get('/api/', function (req, res, next) {
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);
    res.json({msg: 'This is CORS-enabled for all origins!'})
})

app.use(express.json())
app.use('/api', applicationRoutes)
app.use('/api', userRoutes)

app.listen(PORT, () => console.log(`server started on port ${PORT}`))
