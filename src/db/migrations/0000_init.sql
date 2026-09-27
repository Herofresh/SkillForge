CREATE TABLE `equipment_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`tags` text NOT NULL,
	`position` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `goals` (
	`node_id` text PRIMARY KEY NOT NULL,
	`position` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `meta` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `node_progress` (
	`node_id` text PRIMARY KEY NOT NULL,
	`xp` real NOT NULL,
	`level` integer NOT NULL,
	`trial_passed` integer NOT NULL,
	`trial_passed_at` integer,
	`first_trained_at` integer,
	`last_trained_at` integer,
	`self_unlocked_at` integer
);
--> statement-breakpoint
CREATE TABLE `profile` (
	`id` integer PRIMARY KEY NOT NULL,
	`hero_name` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `session_sets` (
	`session_id` text NOT NULL,
	`set_index` integer NOT NULL,
	`node_id` text NOT NULL,
	`metric` text NOT NULL,
	`prescribed_value` real NOT NULL,
	`prescribed_reps` integer,
	`actual_value` real NOT NULL,
	`actual_reps` integer,
	`is_trial` integer NOT NULL,
	`timestamp` integer NOT NULL,
	PRIMARY KEY(`session_id`, `set_index`),
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `session_sets_node_idx` ON `session_sets` (`node_id`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`started_at` integer NOT NULL,
	`ended_at` integer,
	`equipment_profile_id` text
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_actions` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`node_id` text NOT NULL,
	`at` integer NOT NULL
);
