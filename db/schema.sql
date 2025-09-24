-- PostgreSQL schema for Apophenia DigitalOcean integration
-- Optimized for AI-driven narrative game with persistent sessions

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Game sessions table - Core persistent storage
CREATE TABLE game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id VARCHAR(255) NOT NULL,
    session_name VARCHAR(255),
    world_state JSONB NOT NULL,
    story_history JSONB NOT NULL DEFAULT '[]',
    ai_context JSONB DEFAULT '{}',
    genre_config JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_accessed TIMESTAMP DEFAULT NOW()
);

-- AI response cache for performance optimization
CREATE TABLE ai_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_hash VARCHAR(64) UNIQUE NOT NULL,
    response JSONB NOT NULL,
    model_version VARCHAR(100),
    tokens_used INTEGER,
    processing_time INTEGER, -- milliseconds
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '24 hours'
);

-- Player profiles and preferences
CREATE TABLE player_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id VARCHAR(255) UNIQUE NOT NULL,
    preferences JSONB DEFAULT '{}',
    total_sessions INTEGER DEFAULT 0,
    total_playtime INTEGER DEFAULT 0, -- seconds
    favorite_genres JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Image storage references for Spaces integration
CREATE TABLE image_references (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_hash VARCHAR(64) NOT NULL,
    spaces_url VARCHAR(500) NOT NULL,
    cdn_url VARCHAR(500) NOT NULL,
    metadata JSONB DEFAULT '{}',
    file_size INTEGER,
    content_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '30 days'
);

-- Error tracking for monitoring
CREATE TABLE error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    error_type VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    stack_trace TEXT,
    context JSONB DEFAULT '{}',
    user_id VARCHAR(255),
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Performance metrics for monitoring
CREATE TABLE performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC NOT NULL,
    metadata JSONB DEFAULT '{}',
    recorded_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance optimization
-- Game sessions indexes
CREATE INDEX idx_game_sessions_player_id ON game_sessions(player_id);
CREATE INDEX idx_game_sessions_updated_at ON game_sessions(updated_at DESC);
CREATE INDEX idx_game_sessions_last_accessed ON game_sessions(last_accessed DESC);

-- AI response cache indexes
CREATE INDEX idx_ai_responses_hash ON ai_responses(prompt_hash);
CREATE INDEX idx_ai_responses_expires ON ai_responses(expires_at);
CREATE INDEX idx_ai_responses_created ON ai_responses(created_at DESC);

-- Player profiles indexes
CREATE INDEX idx_player_profiles_player_id ON player_profiles(player_id);
CREATE INDEX idx_player_profiles_updated ON player_profiles(updated_at DESC);

-- Image references indexes
CREATE INDEX idx_image_references_hash ON image_references(prompt_hash);
CREATE INDEX idx_image_references_expires ON image_references(expires_at);

-- Error logs indexes
CREATE INDEX idx_error_logs_type ON error_logs(error_type);
CREATE INDEX idx_error_logs_created ON error_logs(created_at DESC);
CREATE INDEX idx_error_logs_user ON error_logs(user_id);

-- Performance metrics indexes
CREATE INDEX idx_performance_metrics_name ON performance_metrics(metric_name);
CREATE INDEX idx_performance_metrics_recorded ON performance_metrics(recorded_at DESC);

-- Functions for maintenance
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM ai_responses WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    DELETE FROM image_references WHERE expires_at < NOW();
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update session access time
CREATE OR REPLACE FUNCTION update_session_access()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_accessed = NOW();
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update access time
CREATE TRIGGER trigger_update_session_access
    BEFORE UPDATE ON game_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_session_access();

-- Sample data for testing (optional)
-- INSERT INTO player_profiles (player_id, preferences) 
-- VALUES ('test-player', '{"theme": "dark", "difficulty": "normal"}');

-- Views for analytics
CREATE VIEW session_analytics AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as sessions_created,
    COUNT(DISTINCT player_id) as unique_players,
    AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_session_duration
FROM game_sessions
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

CREATE VIEW ai_performance AS
SELECT 
    model_version,
    COUNT(*) as requests,
    AVG(processing_time) as avg_response_time,
    AVG(tokens_used) as avg_tokens,
    DATE_TRUNC('hour', created_at) as hour
FROM ai_responses
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY model_version, DATE_TRUNC('hour', created_at)
ORDER BY hour DESC;