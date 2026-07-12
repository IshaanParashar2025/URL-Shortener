const db = require("../config/db");

exports.shortenURL = async (new_url, old_url) => {
    const sql = "INSERT INTO URLs (shortened_url, original_url) VALUES (?, ?);"
    const [result] = await db.query(sql, [new_url, old_url]);
    return result.insertId;
}

exports.returnURL = async (short_url) => {
    const sql = "SELECT url_id, shortened_url, original_url, created_at, updated_at, times_accessed FROM URLs WHERE shortened_url = ?";
    const [result] = await db.query(sql, [short_url]);
    return result;
}

exports.returnURLById = async (url_id) => {
    const sql = "SELECT * FROM URLs WHERE url_id = ?";
    const [result] = await db.query(sql, [url_id]);    
    return result;
}

exports.updateURL = async (shortCode, url) => {
    const sql = "UPDATE URLs SET original_url = ?, times_accessed = times_accessed + 1, updated_at = current_timestamp() WHERE shortened_url = ?";
    const [result] = await db.query(sql, [url, shortCode]);
    return result;
}

exports.deleteURL = async (shortCode) => {
    const sql = "DELETE FROM URLs WHERE shortened_url = ?";
    const [result] = await db.query(sql, [shortCode]);
    return result;
}

exports.incrementAccessTimes = async (shortCode) => {
    const sql = "UPDATE URLs SET times_accessed = times_accessed + 1 WHERE shortened_url = ?";
    const [result] = await db.query(sql, [shortCode]);
    return result;
}