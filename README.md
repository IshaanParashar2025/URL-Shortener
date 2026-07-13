# LinkSpire - High-Performance URL Shortener & Analytics API

LinkSpire is a robust, decoupled RESTful API backend designed for URL shortening and access analytics. Built using **Node.js, Express, and MySQL**, this service manages redirection routing, collision-safe code generation, database connection pooling, and live request analytics.

It includes a lightweight static frontend dashboard that serves as a client interface to consume the API.

---

## Backend Engineering Features

- **Decoupled RESTful API**: Structured endpoints supporting CRUD operations for shortcodes.
- **Connection Pooling**: Optimized MySQL connection pool managing connections efficiently and reducing database handshake latency.
- **SSL Secure Database Integration**: Configured with SSL/TLS parameters to securely query remote cloud databases (like Aiven.io) in production environments.
- **Collision-Safe Generation Algorithm**: Shortcode generator featuring recursive/loop collision protection checking the database up to 10 times to prevent duplicate constraints.
- **Analytics Engine**: Synchronous access counters logging hits (`times_accessed`) automatically upon redirect requests.
- **Robust Error Handling**: Centralized Express middleware catching async routing errors and returning sanitized JSON responses.
- **Dynamic Configuration (Env Variables)**: Production-ready setups supporting lowercase and uppercase fallbacks for database configuration (e.g. `MYSQL_HOST` / `DB_HOST`).
- **Automated Integration Testing**: Mock-driven testing suite using **Jest and Supertest** to validate endpoints in isolation from physical databases.

---

## API Documentation

All requests expect a JSON body and return JSON responses.

### 1. Shorten URL
* **Endpoint**: `POST /api/shorten`
* **Request Body**:
  ```json
  {
    "url": "https://example.com/very-long-path"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "id": 12,
    "url": "https://example.com/very-long-path",
    "shortCode": "bukimEY",
    "created_at": "2026-07-13T10:00:00.000Z",
    "updated_at": "2026-07-13T10:00:00.000Z"
  }
  ```
* **Error Responses**:
  - `400 Bad Request` (Missing URL payload)
  - `400 Bad Request` (Invalid URL structure)

### 2. Resolve URL
* **Endpoint**: `GET /api/shorten/:shortCode`
* **Description**: Increments the click counter and retrieves the original URL for redirection.
* **Success Response (200 OK)**:
  ```json
  {
    "id": 12,
    "url": "https://example.com/very-long-path",
    "shortCode": "bukimEY",
    "created_at": "2026-07-13T10:00:00.000Z",
    "updated_at": "2026-07-13T10:00:00.000Z"
  }
  ```
* **Error Responses**:
  - `404 Not Found` (Shortcode not in database)

### 3. Update Destination
* **Endpoint**: `PUT /api/shorten/:shortCode`
* **Request Body**:
  ```json
  {
    "url": "https://new-destination.com"
  }
  ```
* **Success Response (200 OK)**: Returns the updated entry.

### 4. Delete Link
* **Endpoint**: `DELETE /api/shorten/:shortCode`
* **Success Response (204 No Content)**

### 5. Get Analytics
* **Endpoint**: `GET /api/shorten/:shortCode/stats`
* **Success Response (200 OK / 400)**:
  ```json
  {
    "id": 12,
    "url": "https://example.com/very-long-path",
    "shortCode": "bukimEY",
    "accessCount": 42,
    "created_at": "2026-07-13T10:00:00.000Z",
    "updated_at": "2026-07-13T10:00:00.000Z"
  }
  ```

---

## Database Architecture

The MySQL database schema relies on an indexed, unique constraint on the `shortened_url` column to optimize lookup speeds (`O(1)` query search).

```sql
CREATE TABLE IF NOT EXISTS URLs (
    url_id INT AUTO_INCREMENT PRIMARY KEY,
    shortened_url VARCHAR(10) NOT NULL UNIQUE, -- Indexed via UNIQUE constraint
    original_url TEXT NOT NULL,
    times_accessed INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## Local Installation & Setup

1. Navigate to the `Backend/` directory.
2. Install Node modules:
   ```bash
   npm install
   ```
3. Setup environmental variables in a local `.env` file:
   ```env
   mysql_host=localhost
   mysql_user=root
   mysql_password=yourpassword
   mysql_database=url_db
   mysql_port=3306
   ```
4. Start the API server:
   ```bash
   node app.js
   ```

---

## Cloud Deployment (Render / Railway)

1. Deploy the `Backend` directory as a **Node Web Service**.
2. Configure your cloud database connection credentials via env variables on your hosting provider dashboard:
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`
3. The database pool automatically initiates SSL handshakes (`ssl: { rejectUnauthorized: false }`) to support hosting services like Aiven.io.
