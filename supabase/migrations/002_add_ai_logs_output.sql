-- ai_logs 테이블에 output_summary 컬럼 추가
ALTER TABLE ai_logs ADD COLUMN IF NOT EXISTS output_summary TEXT;
