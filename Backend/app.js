const cors = require("cors");
const express = require("express");
const app = express();

const urlRoutes = require("./routes/urlRoutes")

const PORT = process.env.server_port || 3000;

app.use(cors());

app.use(express.json());

app.use((err, req, res, next) => {
    res.json({
        success: "failure",
        message: err.message
    })
});

app.use("/api", urlRoutes);



const server = app.listen(PORT, (err) => {
    if (err) {
        console.log(err);
    }
    console.log(`SERVER IS RUNNING ON PORT ${PORT}`);
});

module.exports = app;