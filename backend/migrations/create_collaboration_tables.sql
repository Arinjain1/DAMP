-- 1. Create collab_rooms table
CREATE TABLE IF NOT EXISTS collab_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    broker_1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    broker_2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    broker_1_role VARCHAR(50) NOT NULL, -- 'Property-side' | 'Client-side'
    broker_2_role VARCHAR(50) NOT NULL, -- 'Property-side' | 'Client-side'
    commission_split VARCHAR(50) DEFAULT '50/50',
    stage VARCHAR(50) DEFAULT 'Matched', -- 'Matched' | 'Accepted' | 'Visit' | 'Deal' | 'Closed'
    commission_status VARCHAR(50) DEFAULT 'Pending', -- 'Pending' | 'Paid' | 'Disputed'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create collab_tasks table
CREATE TABLE IF NOT EXISTS collab_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES collab_rooms(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    visibility VARCHAR(50) DEFAULT 'Shared', -- 'Shared' | 'Private'
    note TEXT,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create collab_visits table
CREATE TABLE IF NOT EXISTS collab_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES collab_rooms(id) ON DELETE CASCADE,
    scheduled_time TIMESTAMP NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Confirmed', -- 'Confirmed' | 'Completed' | 'Cancelled'
    outcome_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Add latitude and longitude to properties and contacts (clients) tables
ALTER TABLE properties ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

ALTER TABLE contacts ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
