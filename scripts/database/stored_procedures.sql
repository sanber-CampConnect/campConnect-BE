USE campConnect;
DROP PROCEDURE IF EXISTS `Product_add`;
DROP PROCEDURE IF EXISTS `Product_delete`;


DELIMITER //
CREATE PROCEDURE `Product_delete`(
        IN iproduct_id INTEGER
    )
BEGIN 
    DELETE FROM Variants WHERE product_id = iproduct_id;
    DELETE FROM Products WHERE id = iproduct_id;
END;
//
DELIMITER ;