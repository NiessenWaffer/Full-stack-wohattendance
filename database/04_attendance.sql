USE woh_attendance;

CREATE TABLE IF NOT EXISTS attendance (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  member_id       INT NOT NULL,
  attendance_date DATE NOT NULL,
  attendance_time TIME NOT NULL,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_attendance_member
    FOREIGN KEY (member_id)
    REFERENCES members(id)
);

CREATE TABLE IF NOT EXISTS events (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  event_name VARCHAR(150) NOT NULL,
  event_date DATE NOT NULL,
  event_type ENUM('Sunday Service','Youth Night','Prayer Meeting','Outreach','Special') NOT NULL,
  notes      TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
