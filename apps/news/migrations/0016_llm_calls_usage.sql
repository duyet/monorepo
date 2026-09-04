-- Prompt / completion / cache breakdown for llm_calls observability.
-- Anyrouter streams expose cachedTokens in anyrouter_metadata.usage; we
-- previously only stored total tokens. Additive columns stay nullable so
-- older rows (and pre-migration DBs) remain readable.

ALTER TABLE llm_calls ADD COLUMN prompt_tokens INTEGER;
ALTER TABLE llm_calls ADD COLUMN completion_tokens INTEGER;
ALTER TABLE llm_calls ADD COLUMN cached_tokens INTEGER;
