-- Create communication_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS `communication_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `sender_id` INT NOT NULL,
  `recipient_id` INT NOT NULL,
  `event_id` INT NOT NULL,
  `type` ENUM('email', 'sms', 'notification') NOT NULL DEFAULT 'email',
  `subject` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL,
  FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`recipient_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS `idx_comm_sender` ON `communication_logs` (`sender_id`);
CREATE INDEX IF NOT EXISTS `idx_comm_recipient` ON `communication_logs` (`recipient_id`);
CREATE INDEX IF NOT EXISTS `idx_comm_event` ON `communication_logs` (`event_id`);
CREATE INDEX IF NOT EXISTS `idx_comm_created_at` ON `communication_logs` (`created_at`); 