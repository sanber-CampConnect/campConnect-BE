USE campConnect;
DROP PROCEDURE IF EXISTS `User_add`;
DROP PROCEDURE IF EXISTS `User_delete`;
DROP PROCEDURE IF EXISTS `Order_add`;
DROP PROCEDURE IF EXISTS `Order_delete`;
DROP PROCEDURE IF EXISTS `Product_delete`;


DELIMITER //

CREATE PROCEDURE `User_add`(
    IN ifullname VARCHAR(64),
    IN iusername VARCHAR(32),
    IN iemail VARCHAR(64),
    IN ipassword VARCHAR(64),
    OUT onew_user_id INTEGER,
    OUT onew_cart_id INTEGER
)
BEGIN
    INSERT INTO Users( `fullname`, `username`, `email`, `password`)
        VALUES( ifullname, iusername, iemail, ipassword);
    SET onew_user_id = LAST_INSERT_ID();
    INSERT INTO Carts(`user_id`) VALUES( onew_user_id );
    SET onew_cart_id = LAST_INSERT_ID();
    SELECT 
        onew_user_id AS userInsertId,
        onew_cart_id AS cartInsertId;
END;
//

CREATE PROCEDURE `User_delete`(
    IN iuser_id INTEGER
)
BEGIN
    DECLARE temp INT;

    DELETE FROM Notifications WHERE user_id = iuser_id;
    DELETE FROM Announcements WHERE user_id = iuser_id;

    /* DELETE orders made by this user */   
    SELECT id INTO temp FROM Orders WHERE user_id = iuser_id;
    CALL Order_delete(temp);

    /* DELETE this user's cart*/   
    SELECT id INTO temp FROM Carts WHERE user_id = iuser_id;
    DELETE FROM CartItems WHERE cart_id = temp;
    DELETE FROM Carts WHERE user_id = iuser_id;

    DELETE FROM Users WHERE id = iuser_id;
END;
//

CREATE PROCEDURE `Order_add`(
    IN iuser_id INTEGER,
    IN iinvoice_number VARCHAR(32),
    IN imethod VARCHAR(8),
    IN itotal_items INTEGER UNSIGNED,
    IN itotal_price INTEGER UNSIGNED,
    IN irent_start DATETIME,
    OUT onew_order_id INTEGER
)
BEGIN
    INSERT INTO Orders(`user_id`, `payment_due`, `rent_start`)
        VALUES(iuser_id, DATE_ADD(NOW(), INTERVAL 3 DAY), irent_start);
    SET onew_order_id = LAST_INSERT_ID();
    INSERT INTO Transactions(`order_id`, `invoice_number`, `method`, `total_price`, `total_items`) 
        VALUES(onew_order_id, iinvoice_number, imethod, itotal_price, itotal_items);
    SELECT onew_order_id AS insertId;
END;
//

CREATE PROCEDURE `Order_delete`(
    IN iorder_id INTEGER
)
BEGIN
    DELETE FROM `Transactions` WHERE `order_id` = iorder_id;
    DELETE FROM `Rents` WHERE `orderItem_id` IN (SELECT `id` FROM `OrderItems` WHERE `order_id` = iorder_id);
    DELETE FROM `OrderItems` WHERE `order_id` = iorder_id;
    DELETE FROM `Reviews` WHERE `order_id` = iorder_id;
    DELETE FROM `Orders` WHERE `id` = iorder_id;
END;
//


CREATE PROCEDURE `Product_delete`(
    IN iproduct_id INTEGER
)
BEGIN 
    DELETE FROM `Variants` WHERE `product_id` = iproduct_id;
    DELETE FROM `Products` WHERE `id` = iproduct_id;
END;
//

DELIMITER ;