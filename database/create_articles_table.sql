CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    title_de VARCHAR(255) NOT NULL,
    title_fr VARCHAR(255) NOT NULL,
    title_ar VARCHAR(255) NOT NULL,
    content_de TEXT NOT NULL,
    content_fr TEXT NOT NULL,
    content_ar TEXT NOT NULL,
    image_url VARCHAR(500),
    status VARCHAR(20) CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
    author_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP NULL
);