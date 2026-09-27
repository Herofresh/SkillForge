CREATE TABLE `progression_overlay` (
	`id` integer PRIMARY KEY NOT NULL,
	`revision` integer NOT NULL,
	`saved_at` integer NOT NULL,
	`body` text NOT NULL
);
