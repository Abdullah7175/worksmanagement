-- Create user_actions table to track all user activities
CREATE TABLE IF NOT EXISTS public.user_actions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    user_type VARCHAR(50) NOT NULL, -- 'user', 'agent', 'socialmediaperson'
    user_role INTEGER NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    action_type VARCHAR(100) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN', 'LOGOUT', 'UPLOAD', 'DOWNLOAD'
    entity_type VARCHAR(100) NOT NULL, -- 'request', 'image', 'video', 'user', 'agent', 'socialmediaperson', 'town', 'district', 'subtown', 'complaint_type', 'complaint_subtype'
    entity_id INTEGER,
    entity_name VARCHAR(255),
    details JSONB, -- Store additional details about the action
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_actions_user_id ON public.user_actions USING btree (user_id);
CREATE INDEX idx_user_actions_user_type ON public.user_actions USING btree (user_type);
CREATE INDEX idx_user_actions_action_type ON public.user_actions USING btree (action_type);
CREATE INDEX idx_user_actions_entity_type ON public.user_actions USING btree (entity_type);
CREATE INDEX idx_user_actions_entity_id ON public.user_actions USING btree (entity_id);
CREATE INDEX idx_user_actions_created_at ON public.user_actions USING btree (created_at);
CREATE INDEX idx_user_actions_user_type_role ON public.user_actions USING btree (user_type, user_role);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_actions_updated_at 
    BEFORE UPDATE ON public.user_actions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE public.user_actions IS 'Tracks all user actions across the system for audit purposes';
COMMENT ON COLUMN public.user_actions.user_type IS 'Type of user: user, agent, socialmediaperson';
COMMENT ON COLUMN public.user_actions.user_role IS 'Role ID of the user';
COMMENT ON COLUMN public.user_actions.action_type IS 'Type of action performed: CREATE, UPDATE, DELETE, VIEW, LOGIN, LOGOUT, UPLOAD, DOWNLOAD';
COMMENT ON COLUMN public.user_actions.entity_type IS 'Type of entity being acted upon: request, image, video, user, agent, etc.';
COMMENT ON COLUMN public.user_actions.entity_id IS 'ID of the entity being acted upon';
COMMENT ON COLUMN public.user_actions.details IS 'JSON object containing additional details about the action';
COMMENT ON COLUMN public.user_actions.ip_address IS 'IP address of the user performing the action';
COMMENT ON COLUMN public.user_actions.user_agent IS 'User agent string of the browser/client';
