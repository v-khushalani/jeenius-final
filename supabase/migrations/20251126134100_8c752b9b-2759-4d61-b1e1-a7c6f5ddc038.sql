-- Create extracted_questions_queue table for storing questions pending review
CREATE TABLE public.extracted_questions_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_file TEXT NOT NULL,
  source_file_url TEXT,
  page_number INTEGER,
  raw_text TEXT,
  parsed_question JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  reviewed_by UUID REFERENCES auth.users(id),
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_extracted_questions_status ON public.extracted_questions_queue(status);
CREATE INDEX idx_extracted_questions_source ON public.extracted_questions_queue(source_file);

-- Enable RLS
ALTER TABLE public.extracted_questions_queue ENABLE ROW LEVEL SECURITY;

-- Only admins can access this table
CREATE POLICY "Admins can manage extracted questions"
ON public.extracted_questions_queue
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for PDF uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pdf-uploads', 'pdf-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policy for admins only
CREATE POLICY "Admins can upload PDFs"
ON storage.objects
FOR ALL
USING (bucket_id = 'pdf-uploads' AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (bucket_id = 'pdf-uploads' AND has_role(auth.uid(), 'admin'::app_role));