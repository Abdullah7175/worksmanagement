-- Create final_videos table with same structure as videos table
CREATE TABLE public.final_videos (
	id serial4 NOT NULL,
	link text NOT NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	work_request_id int4 NULL,
	description text NULL,
	geo_tag public.geometry NULL,
	creator_id int4 NULL,
	creator_type text NULL,
	CONSTRAINT final_videos_pkey PRIMARY KEY (id)
);

-- Create index for work_request_id
CREATE INDEX idx_final_videos_work_request_id ON public.final_videos USING btree (work_request_id);

-- Create index for creator_id and creator_type
CREATE INDEX idx_final_videos_creator ON public.final_videos USING btree (creator_id, creator_type);

-- Add foreign key constraint
ALTER TABLE public.final_videos ADD CONSTRAINT final_videos_work_request_id_fkey FOREIGN KEY (work_request_id) REFERENCES public.work_requests(id) ON DELETE CASCADE;

-- Add comments for documentation
COMMENT ON TABLE public.final_videos IS 'Final videos created by content creators and video editors from multiple source videos';
COMMENT ON COLUMN public.final_videos.creator_id IS 'ID of the user who created the final video (content creator or video editor)';
COMMENT ON COLUMN public.final_videos.creator_type IS 'Type of creator: content_creator or video_editor'; 