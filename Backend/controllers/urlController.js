const urlModel = require("../model/urlModel");
const generateShortURL = require("../util/shortCodeGenerator");

exports.shortenURL = async (req, res, next) => {
    try {

        const {url} = req.body;
        
        if (!url) {
            return res.status(400).json({
                success: false,
                message: "Must add a URL"
            })
        }

        try {
            new URL(url);
        }
        catch (err) {
            return res.status(400).json({
                success: false,
                message: "Must be a valid URL"
            })
        }

        const MAX_ATTEMPTS = 10;
        
        let new_url = null;
        
        for (let i = 0; i < MAX_ATTEMPTS; i++) {
            let candidate = await generateShortURL();
            let exists = await urlModel.returnURL(candidate);
            
            if (exists.length == 0) {
                new_url = candidate;
                break;
            }
        }
        
        if (!new_url) {
            return res.status(400).json({
                success: false,
                message: "failed to generate short URL"
            });
        }
        
        let result = await urlModel.shortenURL(new_url, url);
        
        let [row] = await urlModel.returnURLById(result);

        const {created_at, updated_at} = row;
        
        res.status(201).json({
            id: result,
            url: url,
            shortCode: new_url,
            created_at,
            updated_at
        });
        
    }
    catch (err) {
        console.log(err);
        next(err);        
    }
}


exports.getOriginalURL = async (req, res, next) => {
    try {
        const shortCode = req.params.shortCode;

        if (!shortCode) {
            return res.status(400).json({
                success: false,
                message: "Must add a URL"
            })
        }

        if (shortCode.length != 7) {
            return res.json({
                success: "failure",
                message: "Invalid short code"
            });
        }

        const [row] = await urlModel.returnURL(shortCode);

        if (!row) {
            return res.status(404).json({
                success: "failure",
                message: "URL NOT FOUND"
            });
        }

        const result = await urlModel.incrementAccessTimes(shortCode);

        const {url_id:id,original_url : url, created_at, updated_at} = row;

        res.status(200).json({
            id,
            url,
            shortCode,
            created_at,
            updated_at
        });
    }
    catch (err) {
        console.log(err);
        next(err);  
    }
}


exports.updateURL = async (req, res, next) => {
    try {

        const {url} = req.body;
        
        if (!url) {
            return res.status(400).json({
                success: false,
                message: "Must add a URL"
            })
        }
        
        try {
            new URL(url);
        }
        catch (err) {
            return res.status(400).json({
                success: false,
                message: "Must be a valid URL"
            })
        }
        
        const shortCode = req.params.shortCode;
        
        if (!shortCode) {
            res.status(400).json({
                success: false,
                message: "Must add a URL"
            })
        }
        
        if (shortCode.length != 7) {
            return res.json({
                success: "failure",
                message: "Invalid short code"
            });
        }

        const result = await urlModel.updateURL(shortCode, url);

        if (result.affectedRows === 0) {
            return res.status(404).json( {
                success: "failure",
                message: "shortCode not found"
            });
        }

        const [row] = await urlModel.returnURL(shortCode);

        const {
            url_id,
            original_url,
            shortened_url,
            created_at,
            updated_at
        } = row;

        res.status(200).json({
            id:url_id,
            url: original_url,
            shortCode: shortened_url,
            created_at,
            updated_at
        });


    }
    catch (err) {
        console.log(err);
        next(err);
        
    }
}

exports.deleteURL = async (req, res, next) => {
    try {
        const shortCode = req.params.shortCode;

        if (!shortCode) {
            return res.status(400).json({
                success: false,
                message: "Must add a URL"
            });
        }

        if (shortCode.length != 7) {
            return res.json({
                success: "failure",
                message: "Invalid short code"
            });
        }

        const result = await urlModel.deleteURL(shortCode);

        if (result.affectedRows == 0) {
            return res.status(404).json({
                success: "failure",
                message: "URL NOT FOUND"
            })
        }

        res.status(204).json({
            success: "success",
            message: "Deleted URL successfully"
        });
    }
    catch (err) {
        console.log(err);
        next(err);
        
    }
}

exports.getStats = async (req, res, next) => {
    const shortCode = req.params.shortCode;

    console.log(shortCode);
    

    if (!shortCode) {
        return res.status(400).json({

            success: "failure",
            message: "Must have Short Code"
        });
    }

    if (shortCode.length != 7) {
        return res.status(400).json({
            success: "failure",
            message: "Invalid short code"
        });
    }

    const [row] = await urlModel.returnURL(shortCode);

    if (!row) {
        return res.status(404).json({
            success: "failure",
            message: "Short Code not Found"
        });
    }

    const {url_id, shortened_url, original_url, created_at, times_accessed, updated_at} = row;

    res.status(400).json({
        id:url_id,
        url:original_url,
        shortCode,
        created_at,
        updated_at,
        accessCount: times_accessed
    });
}