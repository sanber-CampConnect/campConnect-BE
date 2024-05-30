CREATE TABLE Users(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(64) NOT NULL,
    email VARCHAR(64) UNIQUE NOT NULL,
    password VARCHAR(64) NOT NULL,
    phone VARCHAR(16) NOT NULL,
    role ENUM("customer", "admin") NOT NULL,
    image VARCHAR(64),
    is_verified BOOLEAN NOT NULL
);

CREATE TABLE Categories(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(32) NOT NULL
);

CREATE TABLE Transactions(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    invoice_number VARCHAR(32) NOT NULL,
    evidence_image VARCHAR(64),
    method ENUM("tunai", "transfer") NOT NULL,
    is_paid BOOLEAN NOT NULL,
    total_items INTEGER UNSIGNED NOT NULL,
    total_price INTEGER UNSIGNED NOT NULL,
);

CREATE TABLE Products(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    category_id INTEGER NOT NULL,
    name VARCHAR(64) NOT NULL,
    image VARCHAR(64) NOT NULL,
    description VARCHAR(2048) NOT NULL,
    care_procedure VARCHAR(2048) NOT NULL,
    date_added DATE DEFAULT CURRENT_DATE(),

    FOREIGN KEY (category_id) 
        REFERENCES Categories(id)
);

CREATE TABLE Variants(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    product_id INTEGER NOT NULL,
    name VARCHAR(32) NOT NULL,
    price INTEGER UNSIGNED NOT NULL,
    stock INTEGER UNSIGNED NOT NULL,

    FOREIGN KEY (product_id)
        REFERENCES Products(id)
);

CREATE TABLE Announcements(
    id INTEGER PRIMARY KEY AUTO_INCREMENT, 
    user_id INTEGER NOT NULL,
    title VARCHAR(32) NOT NULL,
    image VARCHAR(64),
    content VARCHAR(4096) NOT NULL,

    FOREIGN KEY (user_id)
        REFERENCES Users(id),
);

CREATE TABLE Notifications(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER NOT NULL,
    message VARCHAR(512) NOT NULL,
    send_date DATE NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT False,

    FOREIGN KEY (user_id)
        REFERENCES Users(id),
); 

CREATE TABLE Carts(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER NOT NULL,

    FOREIGN KEY (user_id)
        REFERENCES Users(id),
);

CREATE TABLE UseProcedures(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    product_id INTEGER NOT NULL,
    description VARCHAR(512) NOT NULL,
    step INTEGER NOT NULL,

    FOREIGN KEY product_id
        REFERENCES Products(id),
);

CREATE TABLE Orders(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER NOT NULL,
    transaction_id INTEGER NOT NULL,
    payment_due DATE NOT NULL,
    status ENUM("belum_bayar", "sedang_disewa", "selesai", "dibatalkan") NOT NULL DEFAULT "belum_bayar",
    last_update DATE NOT NULL DEFAULT CURRENT_DATE(),

    FOREIGN KEY user_id
        REFERENCES Users(id),
    FOREIGN KEY transaction_id
        REFERENCES Transactions(id)
);

CREATE TABLE Reviews(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    order_id INTEGER NOT NULL,
    title VARCHAR(32) NOT NULL,
    comment VARCHAR(1024) NOT NULL,

    FOREIGN key order_id
        REFERENCES Orders(id)
); 

CREATE TABLE CartItems(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    cart_id INTEGER NOT NULL, 
    product_id INTEGER NOT NULL,
    marked_ordered BOOLEAN NOT NULL,
    rent_duration INTEGER UNISIGNED NOT NULL

    FOREIGN KEY cart_id
        REFERENCES Carts(id),
    FOREIGN KEY product_id
        REFERENCES Products(id)
);

CREATE TABLE OrderItems(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    product_id INTEGER NOT NULL,
    order_id INTEGER NOT NULL,
    rent_duration INTEGER UNSIGNED NOT NULL,

    FOREIGN KEY product_id
        REFERENCES Products(id),
    FOREIGN KEY order_id
        REFERENCES Orders(id)
);

CREATE TABLE Rents(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    orderItem_id INTEGER NOT NULL,
    rent_start DATE NOT NULL,
    rent_due DATE NOT NULL,
    return_date DATE
);
