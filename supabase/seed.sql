-- Insert initial template data
INSERT INTO public.templates (id, name, category, preview_image_url, css_styles, html_structure) VALUES
-- Classic Templates
('classic-01', 'Classic Elegance', 'classic', '/templates/classic-01-preview.jpg', 
 '{"primaryColor": "#8B4513", "secondaryColor": "#F5F5DC", "fontFamily": "serif", "backgroundColor": "#FFFFFF"}',
 '<div class="invitation-container"><h1>{{groomName}} & {{brideName}}</h1><p class="date">{{weddingDate}}</p><p class="venue">{{venueName}}</p><p class="address">{{venueAddress}}</p><div class="message">{{customMessage}}</div></div>'),

('classic-02', 'Traditional Gold', 'classic', '/templates/classic-02-preview.jpg',
 '{"primaryColor": "#FFD700", "secondaryColor": "#8B0000", "fontFamily": "serif", "backgroundColor": "#FFF8DC"}',
 '<div class="invitation-container gold-theme"><h1>{{groomName}} & {{brideName}}</h1><p class="date">{{weddingDate}}</p><p class="venue">{{venueName}}</p><p class="address">{{venueAddress}}</p><div class="message">{{customMessage}}</div></div>'),

('classic-03', 'Vintage Rose', 'classic', '/templates/classic-03-preview.jpg',
 '{"primaryColor": "#CD5C5C", "secondaryColor": "#F0E68C", "fontFamily": "serif", "backgroundColor": "#FFF0F5"}',
 '<div class="invitation-container vintage-theme"><h1>{{groomName}} & {{brideName}}</h1><p class="date">{{weddingDate}}</p><p class="venue">{{venueName}}</p><p class="address">{{venueAddress}}</p><div class="message">{{customMessage}}</div></div>'),

('classic-04', 'Royal Blue', 'classic', '/templates/classic-04-preview.jpg',
 '{"primaryColor": "#4169E1", "secondaryColor": "#F0F8FF", "fontFamily": "serif", "backgroundColor": "#FFFFFF"}',
 '<div class="invitation-container royal-theme"><h1>{{groomName}} & {{brideName}}</h1><p class="date">{{weddingDate}}</p><p class="venue">{{venueName}}</p><p class="address">{{venueAddress}}</p><div class="message">{{customMessage}}</div></div>'),

-- Modern Templates
('modern-01', 'Minimalist White', 'modern', '/templates/modern-01-preview.jpg',
 '{"primaryColor": "#000000", "secondaryColor": "#808080", "fontFamily": "sans-serif", "backgroundColor": "#FFFFFF"}',
 '<div class="invitation-container modern-minimal"><h1>{{groomName}} & {{brideName}}</h1><p class="date">{{weddingDate}}</p><p class="venue">{{venueName}}</p><p class="address">{{venueAddress}}</p><div class="message">{{customMessage}}</div></div>'),

('modern-02', 'Geometric Pattern', 'modern', '/templates/modern-02-preview.jpg',
 '{"primaryColor": "#2C3E50", "secondaryColor": "#E74C3C", "fontFamily": "sans-serif", "backgroundColor": "#ECF0F1"}',
 '<div class="invitation-container geometric-theme"><h1>{{groomName}} & {{brideName}}</h1><p class="date">{{weddingDate}}</p><p class="venue">{{venueName}}</p><p class="address">{{venueAddress}}</p><div class="message">{{customMessage}}</div></div>'),

('modern-03', 'Bold Typography', 'modern', '/templates/modern-03-preview.jpg',
 '{"primaryColor": "#FF6B6B", "secondaryColor": "#4ECDC4", "fontFamily": "sans-serif", "backgroundColor": "#FFFFFF"}',
 '<div class="invitation-container bold-typography"><h1>{{groomName}} & {{brideName}}</h1><p class="date">{{weddingDate}}</p><p class="venue">{{venueName}}</p><p class="address">{{venueAddress}}</p><div class="message">{{customMessage}}</div></div>'),

('modern-04', 'Gradient Sunset', 'modern', '/templates/modern-04-preview.jpg',
 '{"primaryColor": "#FF7F50", "secondaryColor": "#FFB6C1", "fontFamily": "sans-serif", "backgroundColor": "#FFF5EE"}',
 '<div class="invitation-container gradient-theme"><h1>{{groomName}} & {{brideName}}</h1><p class="date">{{weddingDate}}</p><p class="venue">{{venueName}}</p><p class="address">{{venueAddress}}</p><div class="message">{{customMessage}}</div></div>'),

-- Romantic Templates
('romantic-01', 'Pink Blush', 'romantic', '/templates/romantic-01-preview.jpg',
 '{"primaryColor": "#FFB6C1", "secondaryColor": "#FFC0CB", "fontFamily": "cursive", "backgroundColor": "#FFF0F5"}',
 '<div class="invitation-container romantic-pink"><h1>{{groomName}} & {{brideName}}</h1><p class="date">{{weddingDate}}</p><p class="venue">{{venueName}}</p><p class="address">{{venueAddress}}</p><div class="message">{{customMessage}}</div></div>'),

('romantic-02', 'Lavender Dreams', 'romantic', '/templates/romantic-02-preview.jpg',
 '{"primaryColor": "#9370DB", "secondaryColor": "#E6E6FA", "fontFamily": "cursive", "backgroundColor": "#F8F8FF"}',
 '<div class="invitation-container lavender-theme"><h1>{{groomName}} & {{brideName}}</h1><p class="date">{{weddingDate}}</p><p class="venue">{{venueName}}</p><p class="address">{{venueAddress}}</p><div class="message">{{customMessage}}</div></div>'),

('romantic-03', 'Coral Garden', 'romantic', '/templates/romantic-03-preview.jpg',
 '{"primaryColor": "#FF7F50", "secondaryColor": "#FFEFD5", "fontFamily": "cursive", "backgroundColor": "#FFF8DC"}',
 '<div class="invitation-container coral-theme"><h1>{{groomName}} & {{brideName}}</h1><p class="date">{{weddingDate}}</p><p class="venue">{{venueName}}</p><p class="address">{{venueAddress}}</p><div class="message">{{customMessage}}</div></div>'),

('romantic-04', 'Peach Blossom', 'romantic', '/templates/romantic-04-preview.jpg',
 '{"primaryColor": "#FFCBA4", "secondaryColor": "#FFE4E1", "fontFamily": "cursive", "backgroundColor": "#FFF5EE"}',
 '<div class="invitation-container peach-theme"><h1>{{groomName}} & {{brideName}}</h1><p class="date">{{weddingDate}}</p><p class="venue">{{venueName}}</p><p class="address">{{venueAddress}}</p><div class="message">{{customMessage}}</div></div>'),

-- Minimal Templates
('minimal-01', 'Pure White', 'minimal', '/templates/minimal-01-preview.jpg',
 '{"primaryColor": "#333333", "secondaryColor": "#666666", "fontFamily": "sans-serif", "backgroundColor": "#FFFFFF"}',
 '<div class="invitation-container minimal-pure"><h1>{{groomName}} & {{brideName}}</h1><p class="date">{{weddingDate}}</p><p class="venue">{{venueName}}</p><p class="address">{{venueAddress}}</p><div class="message">{{customMessage}}</div></div>'),

('minimal-02', 'Black & White', 'minimal', '/templates/minimal-02-preview.jpg',
 '{"primaryColor": "#000000", "secondaryColor": "#FFFFFF", "fontFamily": "sans-serif", "backgroundColor": "#F5F5F5"}',
 '<div class="invitation-container minimal-bw"><h1>{{groomName}} & {{brideName}}</h1><p class="date">{{weddingDate}}</p><p class="venue">{{venueName}}</p><p class="address">{{venueAddress}}</p><div class="message">{{customMessage}}</div></div>'),

('minimal-03', 'Soft Gray', 'minimal', '/templates/minimal-03-preview.jpg',
 '{"primaryColor": "#708090", "secondaryColor": "#D3D3D3", "fontFamily": "sans-serif", "backgroundColor": "#F8F8FF"}',
 '<div class="invitation-container minimal-gray"><h1>{{groomName}} & {{brideName}}</h1><p class="date">{{weddingDate}}</p><p class="venue">{{venueName}}</p><p class="address">{{venueAddress}}</p><div class="message">{{customMessage}}</div></div>')

ON CONFLICT (id) DO NOTHING;