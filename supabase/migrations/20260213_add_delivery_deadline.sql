-- Migration: add delivery_deadline column to documents
-- Date: 2026-02-13

-- Add a nullable text column `delivery_deadline` to the `documents` table
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS delivery_deadline text;

-- You can rollback with:
-- ALTER TABLE public.documents DROP COLUMN IF EXISTS delivery_deadline;
