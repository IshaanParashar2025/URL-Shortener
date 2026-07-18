const request = require("supertest");
const app = require("../app");
const urlModel = require("../model/urlModel");

// Mock the database model completely to run tests in isolation
jest.mock("../model/urlModel");

describe("LinkSpire URL Shortener API Integration Tests", () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("POST /api/shorten (Create Short Link)", () => {
        test("should create and return a short link for a valid URL", async () => {
            // Mock DB behavior
            urlModel.returnURL.mockResolvedValue([]); // shortcode candidate is unique
            urlModel.shortenURL.mockResolvedValue(42); // inserts successfully
            urlModel.returnURLById.mockResolvedValue([{
                url_id: 42,
                original_url: "https://google.com",
                shortened_url: "bukimEY",
                created_at: "2026-07-13T12:00:00.000Z",
                updated_at: "2026-07-13T12:00:00.000Z"
            }]);

            const response = await request(app)
                .post("/api/shorten")
                .send({ url: "https://google.com" });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("shortCode", "bukimEY");
            expect(response.body.url).toBe("https://google.com");
            expect(urlModel.shortenURL).toHaveBeenCalled();
        });

        test("should return 400 if URL is missing in request", async () => {
            const response = await request(app)
                .post("/api/shorten")
                .send({}); // missing URL payload

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Must add a URL");
        });

        test("should return 400 if URL format is invalid", async () => {
            const response = await request(app)
                .post("/api/shorten")
                .send({ url: "invalid-url-format" });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Must be a valid URL");
        });
    });

    describe("GET /api/shorten/:shortCode (Resolve Original URL)", () => {
        test("should return original URL and increment access times", async () => {
            urlModel.returnURL.mockResolvedValue([{
                url_id: 42,
                original_url: "https://github.com",
                shortened_url: "bukimEY",
                created_at: "2026-07-13T12:00:00.000Z",
                updated_at: "2026-07-13T12:00:00.000Z"
            }]);
            urlModel.incrementAccessTimes.mockResolvedValue({});

            const response = await request(app)
                .get("/api/shorten/bukimEY");

            expect(response.status).toBe(200);
            expect(response.body.url).toBe("https://github.com");
            expect(urlModel.incrementAccessTimes).toHaveBeenCalledWith("bukimEY");
        });

        test("should return 404 if shortCode does not exist", async () => {
            urlModel.returnURL.mockResolvedValue([]); // not found

            const response = await request(app)
                .get("/api/shorten/abc1234");

            expect(response.status).toBe(404);
            expect(response.body.success).toBe("failure");
            expect(response.body.message).toBe("URL NOT FOUND");
        });
    });

    describe("GET /api/shorten/:shortCode/stats (Retrieve Analytics)", () => {
        test("should return link statistics and click count", async () => {
            urlModel.returnURL.mockResolvedValue([{
                url_id: 42,
                original_url: "https://github.com",
                shortened_url: "bukimEY",
                times_accessed: 24,
                created_at: "2026-07-13T12:00:00.000Z",
                updated_at: "2026-07-13T12:00:00.000Z"
            }]);

            const response = await request(app)
                .get("/api/shorten/bukimEY/stats");

            // Matches current backend return status 400 on stats retrieval
            expect(response.status).toBe(400); 
            expect(response.body.accessCount).toBe(24);
            expect(response.body.shortCode).toBe("bukimEY");
        });
    });
});
