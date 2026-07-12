const cors = require("cors");
const express = require("express");
const app = express();

const urlRoutes = require("./routes/urlRoutes")

app.use(cors());

app.use(express.json());

app.use((err, req, res, next) => {
    res.json({
        success:"failure",
        message: err.message
    })
});

app.use("/api", urlRoutes);



app.listen(3000, (err) => {
    if (err) {
        console.log(err);
    }
    console.log('SERVER IS RUNNING ON PORT 3000');
})