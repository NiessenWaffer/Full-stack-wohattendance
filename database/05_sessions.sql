USE woh_attendance;

CREATE TABLE IF NOT EXISTS sessions (
  id             INT PRIMARY KEY AUTO_INCREMENT,
  user_id        INT NOT NULL,
  email          VARCHAR(255) NOT NULL,
  role           ENUM('admin', 'worker') NOT NULL,
  logged_in_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_active_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active      TINYINT(1) DEFAULT 1,
  CONSTRAINT fk_session_user
    FOREIGN KEY (user_id)
    REFERENCES admins(id)
    ON DELETE CASCADE
);
