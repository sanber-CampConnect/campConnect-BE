/* Clear all table first*/
DROP DATABASE IF EXISTS campConnect;
CREATE DATABASE campConnect;

USE campConnect;

/* Make migration */
CREATE TABLE Users(
    `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
    `fullname` VARCHAR(64) NOT NULL,
    `username` VARCHAR(32) NOT NULL,
    `email` VARCHAR(64) UNIQUE NOT NULL,
    `password` VARCHAR(64) NOT NULL,
    `phone` VARCHAR(16) DEFAULT NULL,
    `role` ENUM("customer", "admin") NOT NULL DEFAULT "customer",
    `image` VARCHAR(64) DEFAULT NULL,
    `is_verified` BOOLEAN NOT NULL DEFAULT False
);

CREATE TABLE Products(
    `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
    `category_id` INTEGER NOT NULL,
    `name` VARCHAR(64) NOT NULL,
    `image` VARCHAR(64) DEFAULT NULL,
    `description` VARCHAR(2048) NOT NULL,
    `price` INTEGER UNSIGNED NOT NULL,
    `date_added` DATETIME DEFAULT NOW(),

    FOREIGN KEY (category_id) 
        REFERENCES Categories(id)
);

CREATE TABLE Variants(
    `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `name` VARCHAR(32) NOT NULL,
    `stock` INTEGER UNSIGNED NOT NULL,

    FOREIGN KEY (product_id)
        REFERENCES Products(id)
);

CREATE TABLE Announcements(
    `id` INTEGER PRIMARY KEY AUTO_INCREMENT, 
    `user_id` INTEGER NOT NULL,
    `title` VARCHAR(32) NOT NULL,
    `image` VARCHAR(64) DEFAULT NULL,
    `content` VARCHAR(4096) NOT NULL,

    FOREIGN KEY (user_id)
        REFERENCES Users(id)
);

CREATE TABLE Notifications(
    `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `message` VARCHAR(512) NOT NULL,
    `send_date` DATETIME NOT NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT False,

    FOREIGN KEY (user_id)
        REFERENCES Users(id)
); 

CREATE TABLE Carts(
    `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL UNIQUE,

    FOREIGN KEY (user_id)
        REFERENCES Users(id)
);

CREATE TABLE Orders(
    `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `payment_due` DATETIME NOT NULL,
    `status` ENUM("belum_bayar", "sedang_disewa", "selesai", "dibatalkan") NOT NULL DEFAULT "belum_bayar",
    `last_update` DATETIME NOT NULL DEFAULT NOW(),

    FOREIGN KEY (user_id)
        REFERENCES Users(id),
);

CREATE TABLE Transactions(
    `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
    `order_id` INTEGER,
    `invoice_number` VARCHAR(32) NOT NULL UNIQUE,
    `evidence_image` VARCHAR(64) DEFAULT NULL,
    `status` ENUM("disetujui", "diproses", "ditolak") DEFAULT "diproses",
    `note` VARCHAR(1024),
    `method` ENUM("tunai", "transfer") NOT NULL,
    `total_items` INTEGER UNSIGNED NOT NULL,
    `total_price` INTEGER UNSIGNED NOT NULL,
    `last_update` DATETIME NOT NULL DEFAULT NOW()

    FOREIGN KEY (order_id)
        REFERENCES Orders(id)
);


CREATE TABLE Reviews(
    `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
    `order_id` INTEGER NOT NULL UNIQUE,
    `title` VARCHAR(32) NOT NULL,
    `comment` VARCHAR(1024) NOT NULL,

    FOREIGN key (order_id)
        REFERENCES Orders(id)
); 

CREATE TABLE CartItems(
    `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
    `cart_id` INTEGER NOT NULL, 
    `variant_id` INTEGER,
    `count` INTEGER UNSIGNED NOT NULL,
    `rent_duration` INTEGER UNSIGNED NOT NULL,
    `subtotal` INTEGER NOT NULL,

    FOREIGN KEY (cart_id)
        REFERENCES Carts(id),
    FOREIGN KEY (variant_id)
        REFERENCES Variants(id)
        ON DELETE SET NULL
);

CREATE TABLE OrderItems(
    `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
    `order_id` INTEGER,
    `variant_id` INTEGER,
    `count` INTEGER UNSIGNED NOT NULL,
    `rent_duration` INTEGER UNSIGNED NOT NULL,
    `subtotal` INTEGER UNSIGNED NOT NULL,

    FOREIGN KEY (order_id)
        REFERENCES Orders(id)
        ON DELETE SET NULL,
    FOREIGN KEY (variant_id)
        REFERENCES Variants(id)
        ON DELETE SET NULL
);

CREATE TABLE Rents(
    `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
    `orderItem_id` INTEGER NOT NULL UNIQUE,
    `rent_start` DATETIME NOT NULL,
    `rent_due` DATETIME NOT NULL,
    `return_date` DATETIME
);
