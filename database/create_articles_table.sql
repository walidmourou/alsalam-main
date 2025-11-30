CREATE TABLE articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title_de VARCHAR(255) NOT NULL,
    title_fr VARCHAR(255) NOT NULL,
    title_ar VARCHAR(255) NOT NULL,
    content_de LONGTEXT NOT NULL,
    content_fr LONGTEXT NOT NULL,
    content_ar LONGTEXT NOT NULL,
    image_url VARCHAR(500),
    status ENUM('draft', 'published') DEFAULT 'draft',
    author_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at TIMESTAMP NULL
);