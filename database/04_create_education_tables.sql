-- Education system tables
-- Teachers, classes, enrollment, attendance, and schedules
-- Teachers table
CREATE TABLE IF NOT EXISTS teachers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    specialization VARCHAR(200),
    qualifications TEXT,
    bio TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Classes table
CREATE TABLE IF NOT EXISTS classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    teacher_id INTEGER REFERENCES teachers(id),
    education_year_id INTEGER NOT NULL REFERENCES education_years(id),
    education_level_id INTEGER NOT NULL REFERENCES education_levels(id),
    room VARCHAR(50),
    max_students INTEGER DEFAULT 20,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Class schedules (junction table for multiple days per week)
CREATE TABLE IF NOT EXISTS class_schedules (
    id SERIAL PRIMARY KEY,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    schedule_day_id INTEGER NOT NULL REFERENCES schedule_days(id),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    UNIQUE(class_id, schedule_day_id)
);
-- Class students enrollment (junction table)
CREATE TABLE IF NOT EXISTS class_students (
    id SERIAL PRIMARY KEY,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    enrollment_status_id INTEGER NOT NULL REFERENCES enrollment_statuses(id),
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    completion_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(class_id, student_id)
);
-- Attendance tracking
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    class_id INTEGER NOT NULL REFERENCES classes(id),
    student_id INTEGER NOT NULL REFERENCES students(id),
    attendance_date DATE NOT NULL,
    attendance_status_id INTEGER NOT NULL REFERENCES attendance_statuses(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(class_id, student_id, attendance_date)
);
-- Create indexes for teachers
CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON teachers(user_id);
CREATE INDEX IF NOT EXISTS idx_teachers_is_active ON teachers(is_active);
-- Create indexes for classes
CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_education_year_id ON classes(education_year_id);
CREATE INDEX IF NOT EXISTS idx_classes_education_level_id ON classes(education_level_id);
CREATE INDEX IF NOT EXISTS idx_classes_is_active ON classes(is_active);
-- Create indexes for class_schedules
CREATE INDEX IF NOT EXISTS idx_class_schedules_class_id ON class_schedules(class_id);
CREATE INDEX IF NOT EXISTS idx_class_schedules_schedule_day_id ON class_schedules(schedule_day_id);
-- Create indexes for class_students
CREATE INDEX IF NOT EXISTS idx_class_students_class_id ON class_students(class_id);
CREATE INDEX IF NOT EXISTS idx_class_students_student_id ON class_students(student_id);
CREATE INDEX IF NOT EXISTS idx_class_students_enrollment_status_id ON class_students(enrollment_status_id);
CREATE INDEX IF NOT EXISTS idx_class_students_enrollment_date ON class_students(enrollment_date);
-- Create indexes for attendance
CREATE INDEX IF NOT EXISTS idx_attendance_class_id ON attendance(class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_status_id ON attendance(attendance_status_id);
-- Create triggers
CREATE TRIGGER update_teachers_updated_at BEFORE
UPDATE ON teachers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE
UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_updated_at BEFORE
UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Create useful views
-- View for classes with teacher info
CREATE OR REPLACE VIEW vw_classes_with_details AS
SELECT c.id,
    c.name,
    c.room,
    c.max_students,
    c.is_active,
    t.id as teacher_id,
    u.first_name as teacher_first_name,
    u.last_name as teacher_last_name,
    ey.year_label,
    ey.is_current as is_current_year,
    el.code as level_code,
    el.label_de as level_label_de,
    el.label_ar as level_label_ar,
    el.label_fr as level_label_fr,
    COUNT(DISTINCT cs.student_id) as enrolled_students
FROM classes c
    LEFT JOIN teachers t ON c.teacher_id = t.id
    LEFT JOIN users u ON t.user_id = u.id
    JOIN education_years ey ON c.education_year_id = ey.id
    JOIN education_levels el ON c.education_level_id = el.id
    LEFT JOIN class_students cs ON c.id = cs.class_id
WHERE c.is_active = TRUE
GROUP BY c.id,
    c.name,
    c.room,
    c.max_students,
    c.is_active,
    t.id,
    u.first_name,
    u.last_name,
    ey.year_label,
    ey.is_current,
    el.code,
    el.label_de,
    el.label_ar,
    el.label_fr;
-- View for class schedules with day labels
CREATE OR REPLACE VIEW vw_class_schedules_with_labels AS
SELECT cs.id,
    cs.class_id,
    c.name as class_name,
    sd.code as day_code,
    sd.day_number,
    sd.label_de as day_label_de,
    sd.label_ar as day_label_ar,
    sd.label_fr as day_label_fr,
    cs.start_time,
    cs.end_time
FROM class_schedules cs
    JOIN classes c ON cs.class_id = c.id
    JOIN schedule_days sd ON cs.schedule_day_id = sd.id
ORDER BY c.name,
    sd.day_number,
    cs.start_time;
-- View for student enrollment with status
CREATE OR REPLACE VIEW vw_student_enrollments AS
SELECT cs.id,
    s.id as student_id,
    s.first_name as student_first_name,
    s.last_name as student_last_name,
    s.birth_date,
    c.id as class_id,
    c.name as class_name,
    el.code as level_code,
    es.code as enrollment_status,
    cs.enrollment_date,
    cs.completion_date,
    ey.year_label
FROM class_students cs
    JOIN students s ON cs.student_id = s.id
    JOIN classes c ON cs.class_id = c.id
    JOIN education_levels el ON c.education_level_id = el.id
    JOIN enrollment_statuses es ON cs.enrollment_status_id = es.id
    JOIN education_years ey ON c.education_year_id = ey.id
WHERE s.deleted_at IS NULL;
-- View for attendance summary
CREATE OR REPLACE VIEW vw_attendance_summary AS
SELECT s.id as student_id,
    s.first_name,
    s.last_name,
    c.id as class_id,
    c.name as class_name,
    DATE_TRUNC('month', a.attendance_date) as month,
    COUNT(*) as total_sessions,
    COUNT(*) FILTER (
        WHERE ast.code = 'present'
    ) as present_count,
    COUNT(*) FILTER (
        WHERE ast.code = 'absent'
    ) as absent_count,
    COUNT(*) FILTER (
        WHERE ast.code = 'excused'
    ) as excused_count,
    COUNT(*) FILTER (
        WHERE ast.code = 'late'
    ) as late_count,
    ROUND(
        100.0 * COUNT(*) FILTER (
            WHERE ast.code = 'present'
        ) / COUNT(*),
        2
    ) as attendance_rate
FROM attendance a
    JOIN students s ON a.student_id = s.id
    JOIN classes c ON a.class_id = c.id
    JOIN attendance_statuses ast ON a.attendance_status_id = ast.id
GROUP BY s.id,
    s.first_name,
    s.last_name,
    c.id,
    c.name,
    DATE_TRUNC('month', a.attendance_date);
-- Comments
COMMENT ON TABLE teachers IS 'Teachers in education programs - linked to users table';
COMMENT ON TABLE classes IS 'Education classes offered each year';
COMMENT ON TABLE class_schedules IS 'Weekly schedule for classes - supports multiple days per week';
COMMENT ON TABLE class_students IS 'Student enrollment in classes';
COMMENT ON TABLE attendance IS 'Daily attendance tracking for students';