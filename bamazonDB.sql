DROP DATABASE IF EXISTS bamazonDB;

CREATE DATABASE bamazonDB;

USE bamazonDB;


CREATE TABLE products (
  id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(100) NULL,
  description VARCHAR(100) NULL,
  price INT(10),
  stock_quantity INT(10)
);


SELECT * FROM products;

UPDATE products SET stock_quantity = -1 WHERE product_name = "Dog Treats";
-- SELECT * FROM top5000 WHERE Artist="Eminem";
