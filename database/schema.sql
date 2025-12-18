-- Todo App Database Schema
-- PostgreSQL 14+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE "User" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE "Project" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3b82f6',
    icon VARCHAR(10) DEFAULT '📁',
    is_favorite BOOLEAN DEFAULT false,
    user_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE "Task" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
    due_date TIMESTAMP,
    completed_at TIMESTAMP,
    reminder TIMESTAMP,
    is_recurring BOOLEAN DEFAULT false,
    recurring_pattern VARCHAR(20) CHECK (recurring_pattern IN ('daily', 'weekly', 'monthly', 'yearly')),
    tags TEXT[],
    attachments JSONB DEFAULT '[]'::jsonb,
    user_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    project_id UUID REFERENCES "Project"(id) ON DELETE SET NULL,
    parent_task_id UUID REFERENCES "Task"(id) ON DELETE CASCADE,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_task_user_id ON "Task"(user_id);
CREATE INDEX idx_task_project_id ON "Task"(project_id);
CREATE INDEX idx_task_status ON "Task"(status);
CREATE INDEX idx_task_due_date ON "Task"(due_date);
CREATE INDEX idx_task_priority ON "Task"(priority);
CREATE INDEX idx_project_user_id ON "Project"(user_id);
CREATE INDEX idx_user_email ON "User"(email);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_updated_at BEFORE UPDATE ON "Project"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_updated_at BEFORE UPDATE ON "Task"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data (optional)
-- Uncomment to insert sample data

-- INSERT INTO "User" (name, email, password, avatar) VALUES
-- ('Denise Martin', 'denise@example.com', '$2a$10$YourHashedPasswordHere', NULL);

-- INSERT INTO "Project" (name, description, color, icon, user_id) VALUES
-- ('Sport', 'Fitness and workout tasks', '#ef4444', '💪', (SELECT id FROM "User" WHERE email = 'denise@example.com')),
-- ('Liste de courses', 'Shopping list', '#10b981', '🛒', (SELECT id FROM "User" WHERE email = 'denise@example.com')),
-- ('Rendez-vous', 'Appointments and meetings', '#3b82f6', '📅', (SELECT id FROM "User" WHERE email = 'denise@example.com'));
