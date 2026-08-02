CREATE TABLE `articles` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`title` varchar(255),
	`content` text,
	`is_published` boolean NOT NULL DEFAULT true,
	`published_date` date,
	`created_by_user_id` bigint unsigned NOT NULL,
	`updated_by_user_id` bigint unsigned NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `articles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `class_course_rooms` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`class_id` bigint unsigned NOT NULL,
	`course_id` bigint unsigned NOT NULL,
	`room_id` smallint unsigned NOT NULL,
	`teacher_id` bigint unsigned NOT NULL,
	`week_day_id` tinyint unsigned NOT NULL,
	`week_day_ar` varchar(100) NOT NULL,
	`week_day_de` varchar(100) NOT NULL,
	`course_start` time NOT NULL,
	`course_end` time NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `class_course_rooms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `class_rooms` (
	`id` smallint unsigned AUTO_INCREMENT NOT NULL,
	`label` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `class_rooms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `class_students` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`student_id` bigint unsigned NOT NULL,
	`class_id` bigint unsigned NOT NULL,
	`status_id` smallint unsigned NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `class_students_id` PRIMARY KEY(`id`),
	CONSTRAINT `student_class_unique_idx` UNIQUE(`student_id`,`class_id`)
);
--> statement-breakpoint
CREATE TABLE `classes` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`education_year_id` bigint unsigned,
	`education_level_id` bigint unsigned,
	`max_students` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `classes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `currencies` (
	`id` smallint unsigned AUTO_INCREMENT NOT NULL,
	`code` varchar(100) NOT NULL,
	`label` varchar(255) NOT NULL,
	CONSTRAINT `currencies_id` PRIMARY KEY(`id`),
	CONSTRAINT `currencies_code_idx` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `education_levels` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`label` varchar(255) NOT NULL,
	`description` text,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `education_levels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `education_years` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`label` varchar(255) NOT NULL,
	`start_date` date NOT NULL,
	`end_date` date NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `education_years_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `educational_courses` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`label` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `educational_courses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `enrollment_statuses` (
	`id` smallint unsigned AUTO_INCREMENT NOT NULL,
	`label` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `enrollment_statuses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `genders` (
	`id` tinyint unsigned AUTO_INCREMENT NOT NULL,
	`label` varchar(255) NOT NULL,
	CONSTRAINT `genders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `incoming_transactions` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`amount` decimal(12,2),
	`currency_id` smallint unsigned NOT NULL,
	`transaction_ref` varchar(255),
	`note` text,
	`incoming_type_id` smallint unsigned NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `incoming_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `incoming_types` (
	`id` smallint unsigned AUTO_INCREMENT NOT NULL,
	`label` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `incoming_types_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marital_statuses` (
	`id` tinyint unsigned AUTO_INCREMENT NOT NULL,
	`label` varchar(255) NOT NULL,
	CONSTRAINT `marital_statuses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `membership_statuses` (
	`id` smallint unsigned AUTO_INCREMENT NOT NULL,
	`label` varchar(255) NOT NULL,
	CONSTRAINT `membership_statuses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `membership_types` (
	`id` smallint unsigned AUTO_INCREMENT NOT NULL,
	`label` varchar(255) NOT NULL,
	`description` text,
	`monthly_fee` decimal(10,2),
	`annual_fee` decimal(10,2),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `membership_types_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `memberships` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`membership_type_id` smallint unsigned NOT NULL,
	`membership_status_id` smallint unsigned NOT NULL,
	`start_date` date,
	`end_date` date,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `memberships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchase_categories` (
	`id` smallint unsigned AUTO_INCREMENT NOT NULL,
	`label` varchar(255) NOT NULL,
	`parent_category_id` smallint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `purchase_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchases` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`amount` decimal(12,2),
	`currency_id` smallint unsigned NOT NULL,
	`purchase_category_id` smallint unsigned NOT NULL,
	`note` text,
	`photo_link` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `purchases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `relationship_types` (
	`id` tinyint unsigned AUTO_INCREMENT NOT NULL,
	`label` varchar(255) NOT NULL,
	CONSTRAINT `relationship_types_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `student_guardians` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`student_id` bigint unsigned NOT NULL,
	`relationship_type_id` tinyint unsigned NOT NULL,
	`is_primary` boolean NOT NULL DEFAULT false,
	`can_pickup` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `student_guardians_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_student_unique_idx` UNIQUE(`user_id`,`student_id`)
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`first_name` varchar(255) NOT NULL,
	`last_name` varchar(255) NOT NULL,
	`birth_date` date NOT NULL,
	`notes` text,
	`gender_id` tinyint unsigned NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `students_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teachers` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`specialization` text,
	`qualifications` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `teachers_id` PRIMARY KEY(`id`),
	CONSTRAINT `teachers_user_idx` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`first_name` varchar(255) NOT NULL,
	`last_name` varchar(255) NOT NULL,
	`gender_id` tinyint unsigned NOT NULL,
	`birth_date` date,
	`phone` varchar(100),
	`phone2` varchar(100),
	`address` varchar(255),
	`marital_status_id` tinyint unsigned NOT NULL,
	`bank` varchar(255),
	`iban` varchar(255),
	`bic` varchar(100),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_idx` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `articles` ADD CONSTRAINT `articles_created_by_user_id_users_id_fk` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `articles` ADD CONSTRAINT `articles_updated_by_user_id_users_id_fk` FOREIGN KEY (`updated_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `class_course_rooms` ADD CONSTRAINT `class_course_rooms_class_id_classes_id_fk` FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `class_course_rooms` ADD CONSTRAINT `class_course_rooms_course_id_educational_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `educational_courses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `class_course_rooms` ADD CONSTRAINT `class_course_rooms_room_id_class_rooms_id_fk` FOREIGN KEY (`room_id`) REFERENCES `class_rooms`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `class_course_rooms` ADD CONSTRAINT `class_course_rooms_teacher_id_teachers_id_fk` FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `class_students` ADD CONSTRAINT `class_students_student_id_students_id_fk` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `class_students` ADD CONSTRAINT `class_students_class_id_classes_id_fk` FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `class_students` ADD CONSTRAINT `class_students_status_id_enrollment_statuses_id_fk` FOREIGN KEY (`status_id`) REFERENCES `enrollment_statuses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `classes` ADD CONSTRAINT `classes_education_year_id_education_years_id_fk` FOREIGN KEY (`education_year_id`) REFERENCES `education_years`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `classes` ADD CONSTRAINT `classes_education_level_id_education_levels_id_fk` FOREIGN KEY (`education_level_id`) REFERENCES `education_levels`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `incoming_transactions` ADD CONSTRAINT `incoming_transactions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `incoming_transactions` ADD CONSTRAINT `incoming_transactions_currency_id_currencies_id_fk` FOREIGN KEY (`currency_id`) REFERENCES `currencies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `incoming_transactions` ADD CONSTRAINT `incoming_transactions_incoming_type_id_incoming_types_id_fk` FOREIGN KEY (`incoming_type_id`) REFERENCES `incoming_types`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `memberships` ADD CONSTRAINT `memberships_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `memberships` ADD CONSTRAINT `memberships_membership_type_id_membership_types_id_fk` FOREIGN KEY (`membership_type_id`) REFERENCES `membership_types`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `memberships` ADD CONSTRAINT `memberships_membership_status_id_membership_statuses_id_fk` FOREIGN KEY (`membership_status_id`) REFERENCES `membership_statuses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `purchase_categories` ADD CONSTRAINT `purchase_categories_parent_category_id_purchase_categories_id_fk` FOREIGN KEY (`parent_category_id`) REFERENCES `purchase_categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `purchases` ADD CONSTRAINT `purchases_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `purchases` ADD CONSTRAINT `purchases_currency_id_currencies_id_fk` FOREIGN KEY (`currency_id`) REFERENCES `currencies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `purchases` ADD CONSTRAINT `purchases_purchase_category_id_purchase_categories_id_fk` FOREIGN KEY (`purchase_category_id`) REFERENCES `purchase_categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_guardians` ADD CONSTRAINT `student_guardians_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_guardians` ADD CONSTRAINT `student_guardians_student_id_students_id_fk` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_guardians` ADD CONSTRAINT `student_guardians_relationship_type_id_relationship_types_id_fk` FOREIGN KEY (`relationship_type_id`) REFERENCES `relationship_types`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `students` ADD CONSTRAINT `students_gender_id_genders_id_fk` FOREIGN KEY (`gender_id`) REFERENCES `genders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teachers` ADD CONSTRAINT `teachers_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_gender_id_genders_id_fk` FOREIGN KEY (`gender_id`) REFERENCES `genders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_marital_status_id_marital_statuses_id_fk` FOREIGN KEY (`marital_status_id`) REFERENCES `marital_statuses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `articles_published_idx` ON `articles` (`is_published`);--> statement-breakpoint
CREATE INDEX `articles_created_by_idx` ON `articles` (`created_by_user_id`);--> statement-breakpoint
CREATE INDEX `class_schedule_idx` ON `class_course_rooms` (`class_id`,`week_day_id`);--> statement-breakpoint
CREATE INDEX `teacher_schedule_idx` ON `class_course_rooms` (`teacher_id`,`week_day_id`);--> statement-breakpoint
CREATE INDEX `room_schedule_idx` ON `class_course_rooms` (`room_id`,`week_day_id`);--> statement-breakpoint
CREATE INDEX `class_students_class_idx` ON `class_students` (`class_id`);--> statement-breakpoint
CREATE INDEX `class_students_status_idx` ON `class_students` (`status_id`);--> statement-breakpoint
CREATE INDEX `classes_year_idx` ON `classes` (`education_year_id`);--> statement-breakpoint
CREATE INDEX `classes_level_idx` ON `classes` (`education_level_id`);--> statement-breakpoint
CREATE INDEX `incoming_user_idx` ON `incoming_transactions` (`user_id`);--> statement-breakpoint
CREATE INDEX `incoming_created_at_idx` ON `incoming_transactions` (`created_at`);--> statement-breakpoint
CREATE INDEX `incoming_type_idx` ON `incoming_transactions` (`incoming_type_id`);--> statement-breakpoint
CREATE INDEX `memberships_user_idx` ON `memberships` (`user_id`);--> statement-breakpoint
CREATE INDEX `memberships_status_idx` ON `memberships` (`membership_status_id`);--> statement-breakpoint
CREATE INDEX `purchase_category_parent_idx` ON `purchase_categories` (`parent_category_id`);--> statement-breakpoint
CREATE INDEX `purchases_user_idx` ON `purchases` (`user_id`);--> statement-breakpoint
CREATE INDEX `purchases_category_idx` ON `purchases` (`purchase_category_id`);--> statement-breakpoint
CREATE INDEX `purchases_created_at_idx` ON `purchases` (`created_at`);--> statement-breakpoint
CREATE INDEX `student_guardians_student_idx` ON `student_guardians` (`student_id`);--> statement-breakpoint
CREATE INDEX `students_gender_idx` ON `students` (`gender_id`);--> statement-breakpoint
CREATE INDEX `students_name_idx` ON `students` (`last_name`,`first_name`);--> statement-breakpoint
CREATE INDEX `users_gender_idx` ON `users` (`gender_id`);--> statement-breakpoint
CREATE INDEX `users_marital_status_idx` ON `users` (`marital_status_id`);