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
    OUT onew_user_id INTEGER
)
BEGIN
    INSERT INTO Users( `fullname`, `username`, `email`, `password`)
        VALUES( ifullname, iusername, iemail, ipassword);
    SET onew_user_id = LAST_INSERT_ID();
    INSERT INTO Carts(`user_id`) VALUES( onew_user_id );
END;
//

CREATE PROCEDURE `User_delete`(
    IN iuser_id INTEGER
)
BEGIN
    DELETE FROM Notifications WHERE user_id = iuser_id;
    DELETE FROM Announcements WHERE user_id = iuser_id;
    DELETE FROM Orders WHERE user_id = iuser_id;
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
    OUT onew_order_id INTEGER
)
BEGIN
    INSERT INTO Orders(`user_id`, `payment_due`)
        VALUES(iuser_id, DATE_ADD(NOW(), INTERVAL 3 DAY));
    SET onew_order_id = LAST_INSERT_ID();
    INSERT INTO Transactions(`order_id` `invoice_number`, `method`, `total_price`, `total_items`) 
        VALUES(onew_order_id, iinvoice_number, imethod, itotal_price, itotal_items);
    SELECT onew_order_id AS insertId;
END;
//

CREATE PROCEDURE `Order_delete`(
    IN iorder_id INTEGER
)
BEGIN
    DELETE FROM `Transactions` WHERE `order_id` = iorder_id;
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