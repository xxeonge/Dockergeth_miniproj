create database blue_auction;
use blue_auction;

CREATE TABLE `item_categories` (
  `category_code` int NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL,
  PRIMARY KEY (`category_code`)
);

CREATE TABLE `item_status` (
  `status_code` int NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL,
  PRIMARY KEY (`status_code`)
);

CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `id` varchar(20) NOT NULL,
  `pw` varchar(100) NOT NULL,
  `balance` int DEFAULT '1000000',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `user_uk` (`id`)
);

CREATE TABLE `auction_items` (
  `item_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `category_code` int NOT NULL,
  `status_code` int NOT NULL,
  `name` varchar(45) NOT NULL,
  `start_date` datetime NOT NULL,
  `close_date` datetime NOT NULL,
  `reserve_price` int DEFAULT NULL,
  `img_url` varchar(500) DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `contract` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `fk_category_idx` (`category_code`),
  KEY `fk_status_idx` (`status_code`),
  KEY `fk_item_user_idx` (`user_id`),
  CONSTRAINT `fk_item_category` FOREIGN KEY (`category_code`) REFERENCES `item_categories` (`category_code`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_item_status` FOREIGN KEY (`status_code`) REFERENCES `item_status` (`status_code`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_item_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE `participants` (
  `participant_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `item_id` int NOT NULL,
  `refund_flag` int NOT NULL DEFAULT '0',
  `address` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`participant_id`),
  KEY `fk_participant_item_idx` (`item_id`),
  KEY `fk_participant_user_idx` (`user_id`),
  CONSTRAINT `fk_participant_item` FOREIGN KEY (`item_id`) REFERENCES `auction_items` (`item_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_participant_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE `bids` (
  `bid_id` int NOT NULL AUTO_INCREMENT,
  `timestamp` datetime NOT NULL,
  `user_id` int NOT NULL,
  `item_id` int NOT NULL,
  `participant_id` int NOT NULL,
  `value` int NOT NULL,
  PRIMARY KEY (`bid_id`),
  KEY `fk_user_idx` (`user_id`),
  KEY `fk_item_idx` (`item_id`),
  KEY `fk_bid_participant_idx` (`participant_id`),
  CONSTRAINT `fk_bid_item` FOREIGN KEY (`item_id`) REFERENCES `auction_items` (`item_id`),
  CONSTRAINT `fk_bid_participant` FOREIGN KEY (`participant_id`) REFERENCES `participants` (`participant_id`),
  CONSTRAINT `fk_bid_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
);


CREATE TABLE `interests` (
  `interest_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `item_id` int NOT NULL,
  PRIMARY KEY (`interest_id`),
  KEY `fk_interest_user_idx` (`user_id`),
  KEY `fk_interest_item_idx` (`item_id`),
  CONSTRAINT `fk_interest_item` FOREIGN KEY (`item_id`) REFERENCES `auction_items` (`item_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_interest_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
);



CREATE TABLE `sellers` (
  `seller_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `item_id` int NOT NULL,
  `address` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`seller_id`),
  KEY `fk_user_idx` (`user_id`),
  CONSTRAINT `fk_seller_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE `transactions` (
  `transaction_id` int NOT NULL,
  `to_id` int NOT NULL,
  `from_id` int NOT NULL,
  `value` int DEFAULT NULL,
  `timestamp` datetime NOT NULL,
  `address` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`transaction_id`),
  KEY `fk_trans_fromusr_idx` (`from_id`),
  KEY `fk_trans_tousr_idx` (`to_id`),
  CONSTRAINT `fk_trans_fromusr` FOREIGN KEY (`from_id`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_trans_tousr` FOREIGN KEY (`to_id`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE `highests` (
  `user_id` int NOT NULL,
  `item_id` int NOT NULL,
  `participant_id` int NOT NULL,
  `timestamp` datetime NOT NULL,
  `value` int NOT NULL DEFAULT '0',
  `winning_flag` int NOT NULL DEFAULT '0',
  KEY `fk_highest_user_idx` (`user_id`),
  KEY `fk_highest_item_idx` (`item_id`),
  KEY `fk_highest_participant_idx` (`participant_id`),
  CONSTRAINT `fk_highest_item` FOREIGN KEY (`item_id`) REFERENCES `auction_items` (`item_id`),
  CONSTRAINT `fk_highest_participant` FOREIGN KEY (`participant_id`) REFERENCES `participants` (`participant_id`),
  CONSTRAINT `fk_highest_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
);



INSERT INTO `item_categories` VALUES (1,'Electronics'),(2,'Fashion'),(3,'Health & Beauty'),(4,'Motors'),(5,'Collectibles'),(6,'Sports'),(7,'Home & Garden');
INSERT INTO `item_status` VALUES (1,'ongoing'),(2,'closed'),(3,'ended'),(4,'corrupted');
    	
    	
DROP PROCEDURE IF EXISTS whileProc;

DELIMITER $$ 
CREATE PROCEDURE whileProc()
BEGIN
	DECLARE i INT;
	SET i = 1;
	WHILE (i < 111) DO
		insert into users (id, pw, balance) value (i, i, 100000);   
		SET i = i+1;
	END WHILE;
END$$

DELIMITER ;

call whileProc();

select * from users;
