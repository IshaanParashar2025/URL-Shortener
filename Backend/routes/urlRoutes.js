const express = require("express");
const router = express.Router();

const urlController = require("../controllers/urlController");

router.post("/shorten", urlController.shortenURL);
router.get("/shorten/:shortCode", urlController.getOriginalURL);
router.put("/shorten/:shortCode", urlController.updateURL);
router.delete("/shorten/:shortCode", urlController.deleteURL);
router.get("/shorten/:shortCode/stats", urlController.getStats);

module.exports = router;