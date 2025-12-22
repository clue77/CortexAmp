-- Insert Tracks
INSERT INTO tracks (slug, title, description, sort_order, is_active) VALUES
('prompt-engineering', 'Prompt Engineering', 'Master the art of communicating with AI to get exactly what you need', 1, true),
('automation', 'Automation', 'Build AI-powered workflows that save time and eliminate repetitive tasks', 2, true),
('business', 'Business Applications', 'Apply AI to real business problems: marketing, sales, and operations', 3, true),
('creativity', 'Creative AI', 'Explore AI for content creation, design, and creative problem-solving', 4, true),
('data-analysis', 'Data Analysis', 'Use AI to extract insights and make data-driven decisions', 5, true);

-- Get track IDs for reference
DO $$
DECLARE
  prompt_eng_id uuid;
  automation_id uuid;
  business_id uuid;
  creativity_id uuid;
  data_id uuid;
  base_date date := CURRENT_DATE;
BEGIN
  SELECT id INTO prompt_eng_id FROM tracks WHERE slug = 'prompt-engineering';
  SELECT id INTO automation_id FROM tracks WHERE slug = 'automation';
  SELECT id INTO business_id FROM tracks WHERE slug = 'business';
  SELECT id INTO creativity_id FROM tracks WHERE slug = 'creativity';
  SELECT id INTO data_id FROM tracks WHERE slug = 'data-analysis';

  -- Week 1: Days 1-7
  -- Day 1: Beginner Prompt Engineering
  INSERT INTO challenges (track_id, difficulty, title, scenario, instructions, success_criteria, day_date, is_published) VALUES
  (prompt_eng_id, 'beginner', 'Write a Product Description', 
   'You work for an e-commerce store selling eco-friendly water bottles. You need to create a compelling product description.',
   'Write a prompt that instructs an AI to generate a product description for a stainless steel, insulated water bottle that keeps drinks cold for 24 hours. The description should be 100-150 words, highlight sustainability, and appeal to active lifestyle customers.',
   'Prompt should specify: product features, target audience, tone, word count, and key benefits to emphasize.',
   base_date, true);

  -- Day 1: Intermediate Automation
  INSERT INTO challenges (track_id, difficulty, title, scenario, instructions, success_criteria, day_date, is_published) VALUES
  (automation_id, 'intermediate', 'Email Categorization System',
   'Your inbox receives 50+ emails daily. You need an AI system to automatically categorize them.',
   'Design a prompt-based workflow that categorizes incoming emails into: Urgent, Important, Newsletter, Spam, and Personal. Describe the criteria for each category and how the AI should handle edge cases.',
   'Solution should include clear categorization rules, handling of ambiguous emails, and a suggested action for each category.',
   base_date, true);

  -- Day 1: Advanced Business
  INSERT INTO challenges (track_id, difficulty, title, scenario, instructions, success_criteria, day_date, is_published) VALUES
  (business_id, 'advanced', 'Competitive Analysis Framework',
   'You''re launching a new SaaS product and need to understand your competitive landscape.',
   'Create a comprehensive AI-assisted competitive analysis framework. Include what data to gather, how to prompt AI for insights, and what metrics to track. Focus on a project management tool entering a crowded market.',
   'Framework should cover: data sources, specific prompts for analysis, key differentiators to identify, and actionable insights format.',
   base_date, true);

  -- Day 2
  INSERT INTO challenges (track_id, difficulty, title, scenario, instructions, success_criteria, day_date, is_published) VALUES
  (creativity_id, 'beginner', 'Social Media Caption Generator',
   'You manage social media for a local coffee shop and need engaging captions for Instagram posts.',
   'Write a prompt that generates 3 different Instagram captions for a photo of a new seasonal latte. Captions should be casual, include relevant hashtags, and encourage engagement.',
   'Prompt should specify tone, length, hashtag requirements, and call-to-action elements.',
   base_date + 1, true);

  INSERT INTO challenges (track_id, difficulty, title, scenario, instructions, success_criteria, day_date, is_published) VALUES
  (prompt_eng_id, 'intermediate', 'Customer Support Response Template',
   'Your customer support team needs consistent, empathetic responses to common issues.',
   'Create a prompt template that generates professional support responses for delayed shipments. The response should acknowledge the issue, provide a solution, and maintain brand voice.',
   'Template should handle variable information (order number, delay reason, new ETA) and maintain empathetic tone.',
   base_date + 1, true);

  INSERT INTO challenges (track_id, difficulty, title, scenario, instructions, success_criteria, day_date, is_published) VALUES
  (data_id, 'advanced', 'Sales Data Insight Extraction',
   'You have quarterly sales data and need to identify trends and opportunities.',
   'Design an AI-assisted analysis approach for sales data showing: product categories, regions, and time periods. Describe how to structure prompts to uncover hidden patterns and actionable recommendations.',
   'Approach should include data preparation steps, specific analytical prompts, and format for presenting insights to executives.',
   base_date + 1, true);

  -- Day 3
  INSERT INTO challenges (track_id, difficulty, title, scenario, instructions, success_criteria, day_date, is_published) VALUES
  (automation_id, 'beginner', 'Meeting Notes Summarizer',
   'After each team meeting, you need to create concise summaries and action items.',
   'Write a prompt that takes raw meeting notes and generates: a brief summary, key decisions made, and a list of action items with owners.',
   'Prompt should extract structured information and format output clearly for team distribution.',
   base_date + 2, true);

  INSERT INTO challenges (track_id, difficulty, title, scenario, instructions, success_criteria, day_date, is_published) VALUES
  (business_id, 'intermediate', 'Market Research Survey Design',
   'You''re validating a new product idea and need to design an effective customer survey.',
   'Use AI to help design a 10-question survey for potential customers of a meal planning app. Questions should uncover pain points, willingness to pay, and feature priorities.',
   'Survey should include mix of question types, avoid leading questions, and provide actionable insights.',
   base_date + 2, true);

  INSERT INTO challenges (track_id, difficulty, title, scenario, instructions, success_criteria, day_date, is_published) VALUES
  (creativity_id, 'advanced', 'Brand Voice Development',
   'A startup needs to establish a consistent brand voice across all communications.',
   'Create an AI-assisted process to develop and document a brand voice. Include example prompts that demonstrate the voice in different contexts (social media, email, website, support).',
   'Process should define voice attributes, provide clear examples, and include testing methodology.',
   base_date + 2, true);

  -- Day 4
  INSERT INTO challenges (track_id, difficulty, title, scenario, instructions, success_criteria, day_date, is_published) VALUES
  (prompt_eng_id, 'beginner', 'Blog Post Outline Creator',
   'You need to write a blog post about remote work productivity tips.',
   'Write a prompt that generates a detailed outline for a 1500-word blog post on "10 Productivity Tips for Remote Workers". Include main sections, key points, and suggested examples.',
   'Outline should be well-structured, actionable, and include introduction and conclusion guidance.',
   base_date + 3, true);

  INSERT INTO challenges (track_id, difficulty, title, scenario, instructions, success_criteria, day_date, is_published) VALUES
  (data_id, 'intermediate', 'Customer Feedback Analysis',
   'You have 200 customer reviews and need to identify common themes and sentiment.',
   'Design a prompt-based approach to analyze customer feedback at scale. Describe how to categorize feedback, measure sentiment, and prioritize issues for product team.',
   'Approach should handle volume, identify patterns, and produce executive summary with priorities.',
   base_date + 3, true);

  INSERT INTO challenges (track_id, difficulty, title, scenario, instructions, success_criteria, day_date, is_published) VALUES
  (automation_id, 'advanced', 'Content Repurposing Workflow',
   'You publish a weekly podcast and want to repurpose content across multiple platforms.',
   'Design an AI-powered workflow that takes a podcast transcript and creates: LinkedIn post, Twitter thread, blog summary, and email newsletter excerpt. Detail each transformation step.',
   'Workflow should maintain key messages, adapt tone for each platform, and be efficient to execute.',
   base_date + 3, true);

  -- Day 5
  INSERT INTO challenges (track_id, difficulty, title, scenario, instructions, success_criteria, day_date, is_published) VALUES
  (business_id, 'beginner', 'Job Description Writer',
   'Your company is hiring a Marketing Manager and needs an attractive job posting.',
   'Create a prompt that generates a compelling job description including: role summary, responsibilities, requirements, and company culture. Make it appealing to top talent.',
   'Job description should be clear, inclusive, and highlight growth opportunities.',
   base_date + 4, true);

  INSERT INTO challenges (track_id, difficulty, title, scenario, instructions, success_criteria, day_date, is_published) VALUES
  (creativity_id, 'intermediate', 'Video Script Development',
   'You''re creating a 60-second explainer video for a mobile app.',
   'Write a prompt that generates a video script for an app that helps users track their carbon footprint. Script should hook viewers in first 5 seconds and end with clear CTA.',
   'Script should include visual suggestions, timing notes, and compelling narrative arc.',
   base_date + 4, true);

  INSERT INTO challenges (track_id, difficulty, title, scenario, instructions, success_criteria, day_date, is_published) VALUES
  (prompt_eng_id, 'advanced', 'Multi-Step Reasoning Prompt',
   'You need AI to solve complex problems that require multiple reasoning steps.',
   'Design a prompt that guides AI through analyzing whether a business should expand to a new market. The prompt should enforce step-by-step analysis of: market size, competition, resources needed, and risk assessment.',
   'Prompt should structure reasoning process, prevent premature conclusions, and produce balanced recommendation.',
   base_date + 4, true);

  -- Day 6
  INSERT INTO challenges (track_id, difficulty, title, scenario, instructions, success_criteria, day_date, is_published) VALUES
  (automation_id, 'beginner', 'FAQ Response Generator',
   'Your website needs an FAQ section for common customer questions.',
   'Create a prompt that generates clear, helpful FAQ entries. Provide 5 common questions about a subscription box service and have AI generate concise answers.',
   'Answers should be friendly, informative, and anticipate follow-up questions.',
   base_date + 5, true);

  INSERT INTO challenges (track_id, difficulty, title, scenario, instructions, success_criteria, day_date, is_published) VALUES
  (data_id, 'intermediate', 'A/B Test Results Interpreter',
   'You ran an A/B test on email subject lines and need to analyze results.',
   'Design prompts to help interpret A/B test data: Version A (1000 sends, 180 opens), Version B (1000 sends, 220 opens). Extract insights and recommendations for future campaigns.',
   'Analysis should include statistical significance, practical implications, and next steps.',
   base_date + 5, true);

  INSERT INTO challenges (track_id, difficulty, title, scenario, instructions, success_criteria, day_date, is_published) VALUES
  (business_id, 'advanced', 'Crisis Communication Plan',
   'A product defect was discovered and you need to communicate with customers.',
   'Develop an AI-assisted crisis communication strategy. Include prompts for: internal announcement, customer email, social media response, and press statement. Ensure consistency and appropriate tone.',
   'Strategy should prioritize transparency, provide clear timeline, and maintain trust.',
   base_date + 5, true);

  -- Day 7
  INSERT INTO challenges (track_id, difficulty, title, scenario, instructions, success_criteria, day_date, is_published) VALUES
  (creativity_id, 'beginner', 'Newsletter Content Ideas',
   'You send a weekly newsletter and need fresh content ideas.',
   'Write a prompt that generates 5 newsletter topic ideas for a personal finance blog. Topics should be timely, actionable, and appeal to millennials.',
   'Ideas should be specific, relevant to current events, and include angle for each topic.',
   base_date + 6, true);

  INSERT INTO challenges (track_id, difficulty, title, scenario, instructions, success_criteria, day_date, is_published) VALUES
  (prompt_eng_id, 'intermediate', 'Technical Documentation Simplifier',
   'You need to explain complex technical concepts to non-technical stakeholders.',
   'Create a prompt that takes technical API documentation and rewrites it for business users. Focus on what it does, why it matters, and how to use it - without jargon.',
   'Output should be clear, use analogies, and include practical examples.',
   base_date + 6, true);

  INSERT INTO challenges (track_id, difficulty, title, scenario, instructions, success_criteria, day_date, is_published) VALUES
  (automation_id, 'advanced', 'Personalized Onboarding Email Sequence',
   'New users need personalized onboarding based on their role and goals.',
   'Design an AI-driven email sequence (5 emails over 2 weeks) that adapts to user type: Freelancer, Small Business, or Enterprise. Each path should address specific needs and drive activation.',
   'Sequence should include triggers, personalization variables, and success metrics for each email.',
   base_date + 6, true);

END $$;
