-- Script para insertar 20 locales con datos aleatorios
-- Primero insertar los usuarios

INSERT INTO users (name, email, password, role, city, province, bio, avatar, phone) VALUES
-- Venues/Locales
('La Sala Roja', 'info@lasalaroja.es', '$2b$10$rQ8K3tOjG5Pf2zG4hW1Lb.vX2mJ9nK5oP6qR7sT8uV9wX0yZ1aB2c', 'Local', 'Madrid', 'Madrid', 'Un espacio íntimo y acogedor perfecto para conciertos acústicos y presentaciones. Con una decoración vintage y un ambiente cálido.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=lasalaroja', '+34 915 123 456'),

('El Búnker Music Club', 'contacto@elbunkerclub.com', '$2b$10$rQ8K3tOjG5Pf2zG4hW1Lb.vX2mJ9nK5oP6qR7sT8uV9wX0yZ1aB2c', 'Local', 'Barcelona', 'Cataluña', 'Club underground con los mejores equipos de sonido. Especializado en música electrónica y rock alternativo.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=bunkerclub', '+34 934 567 890'),

('Café Central Live', 'eventos@cafecentral.es', '$2b$10$rQ8K3tOjG5Pf2zG4hW1Lb.vX2mJ9nK5oP6qR7sT8uV9wX0yZ1aB2c', 'Local', 'Valencia', 'Valencia', 'Café con escenario en vivo, perfecto para artistas emergentes. Ambiente bohemio y público conocedor de buena música.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=cafecentral', '+34 963 789 123'),

('Teatro Indie Valencia', 'reservas@teatroindievalencia.com', '$2b$10$rQ8K3tOjG5Pf2zG4hW1Lb.vX2mJ9nK5oP6qR7sT8uV9wX0yZ1aB2c', 'Local', 'Valencia', 'Valencia', 'Teatro adaptado para conciertos indie y rock. Acústica excepcional y ambiente teatral único.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=teatroindie', '+34 963 456 789'),

('La Cueva del Jazz', 'info@lacuevajazz.es', '$2b$10$rQ8K3tOjG5Pf2zG4hW1Lb.vX2mJ9nK5oP6qR7sT8uV9wX0yZ1aB2c', 'Local', 'Sevilla', 'Andalucía', 'Local especializado en jazz y blues. Decoración vintage, iluminación tenue y los mejores cócteles de la ciudad.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=cuevajazz', '+34 954 321 654'),

('Rock Palace Arena', 'booking@rockpalace.es', '$2b$10$rQ8K3tOjG5Pf2zG4hW1Lb.vX2mJ9nK5oP6qR7sT8uV9wX0yZ1aB2c', 'Local', 'Bilbao', 'País Vasco', 'Gran sala de conciertos con capacidad para 800 personas. Especializada en rock, metal y música alternativa.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=rockpalace', '+34 944 111 222'),

('El Rincón Acústico', 'eventos@rinconacustico.com', '$2b$10$rQ8K3tOjG5Pf2zG4hW1Lb.vX2mJ9nK5oP6qR7sT8uV9wX0yZ1aB2c', 'Local', 'Granada', 'Andalucía', 'Espacio íntimo para música acústica y folk. Ambiente relajado con decoración artesanal.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=rinconacustico', '+34 958 777 888'),

('Beats Underground', 'info@beatsunderground.es', '$2b$10$rQ8K3tOjG5Pf2zG4hW1Lb.vX2mJ9nK5oP6qR7sT8uV9wX0yZ1aB2c', 'Local', 'Zaragoza', 'Aragón', 'Club nocturno especializado en electrónica y techno. Sistema de sonido profesional y pista de baile amplia.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=beatsunder', '+34 976 333 444'),

('La Taberna Musical', 'contacto@tabernamusical.es', '$2b$10$rQ8K3tOjG5Pf2zG4hW1Lb.vX2mJ9nK5oP6qR7sT8uV9wX0yZ1aB2c', 'Local', 'Salamanca', 'Castilla y León', 'Taberna tradicional con escenario para música folk y tradicional. Ambiente familiar y acogedor.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=taberna', '+34 923 555 666'),

('Estadio Mini Arena', 'eventos@miniarena.com', '$2b$10$rQ8K3tOjG5Pf2zG4hW1Lb.vX2mJ9nK5oP6qR7sT8uV9wX0yZ1aB2c', 'Local', 'Murcia', 'Murcia', 'Pabellón adaptado para conciertos de gran formato. Capacidad para 1200 personas con excelente acústica.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=miniarena', '+34 968 999 000'),

('Blues & Bourbon Bar', 'reservas@bluesbar.es', '$2b$10$rQ8K3tOjG5Pf2zG4hW1Lb.vX2mJ9nK5oP6qR7sT8uV9wX0yZ1aB2c', 'Local', 'Córdoba', 'Andalucía', 'Bar temático especializado en blues y country. Decoración americana y whiskies premium.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=bluesbar', '+34 957 123 789'),

('El Loft Cultural', 'info@loftcultural.es', '$2b$10$rQ8K3tOjG5Pf2zG4hW1Lb.vX2mJ9nK5oP6qR7sT8uV9wX0yZ1aB2c', 'Local', 'Alicante', 'Valencia', 'Espacio cultural multidisciplinar. Perfecto para conciertos íntimos, presentaciones y eventos artísticos.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=loftcultural', '+34 965 444 555'),

('Garage Rock Club', 'booking@garagerock.es', '$2b$10$rQ8K3tOjG5Pf2zG4hW1Lb.vX2mJ9nK5oP6qR7sT8uV9wX0yZ1aB2c', 'Local', 'Gijón', 'Asturias', 'Club de rock en un antiguo garaje. Ambiente auténtico y público fiel al rock clásico.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=garagerock', '+34 985 666 777'),

('Sala Indie Pop', 'eventos@salapop.com', '$2b$10$rQ8K3tOjG5Pf2zG4hW1Lb.vX2mJ9nK5oP6qR7sT8uV9wX0yZ1aB2c', 'Local', 'Santander', 'Cantabria', 'Sala moderna especializada en indie pop y música alternativa. Decoración minimalista y sonido crystal clear.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=salapop', '+34 942 888 999'),

('El Sótano Sessions', 'info@sotanosessions.es', '$2b$10$rQ8K3tOjG5Pf2zG4hW1Lb.vX2mJ9nK5oP6qR7sT8uV9wX0yZ1aB2c', 'Local', 'León', 'Castilla y León', 'Espacio underground en el sótano de un edificio histórico. Atmósfera única para conciertos íntimos.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sotano', '+34 987 111 333'),

('Arena Urbana', 'contacto@arenaurbana.es', '$2b$10$rQ8K3tOjG5Pf2zG4hW1Lb.vX2mJ9nK5oP6qR7sT8uV9wX0yZ1aB2c', 'Local', 'Pamplona', 'Navarra', 'Complejo de entretenimiento urbano. Múltiples espacios para diferentes estilos musicales.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=arenaurbana', '+34 948 222 444'),

('La Factoría del Sonido', 'booking@factoriasonido.com', '$2b$10$rQ8K3tOjG5Pf2zG4hW1Lb.vX2mJ9nK5oP6qR7sT8uV9wX0yZ1aB2c', 'Local', 'Badajoz', 'Extremadura', 'Antigua fábrica convertida en sala de conciertos. Espacios amplios con decoración industrial.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=factoria', '+34 924 555 777'),

('Vintage Music Hall', 'eventos@vintagemusic.es', '$2b$10$rQ8K3tOjG5Pf2zG4hW1Lb.vX2mJ9nK5oP6qR7sT8uV9wX0yZ1aB2c', 'Local', 'Cáceres', 'Extremadura', 'Salón de música con decoración de los años 50. Especializado en swing, jazz y música vintage.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=vintagemusic', '+34 927 666 888'),

('Electronic Playground', 'info@electronicplay.es', '$2b$10$rQ8K3tOjG5Pf2zG4hW1Lb.vX2mJ9nK5oP6qR7sT8uV9wX0yZ1aB2c', 'Local', 'Logroño', 'La Rioja', 'Club de música electrónica con las últimas tecnologías. Lighting show y sistema de sonido inmersivo.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=electronic', '+34 941 777 999'),

('Acústica Premium', 'reservas@acusticapremium.com', '$2b$10$rQ8K3tOjG5Pf2zG4hW1Lb.vX2mJ9nK5oP6qR7sT8uV9wX0yZ1aB2c', 'Local', 'Toledo', 'Castilla-La Mancha', 'Sala premium para música clásica y acústica. Acústica natural excepcional en edificio histórico.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=acustica', '+34 925 000 111');

-- Obtener los IDs de los usuarios creados para los perfiles
-- Ahora insertar los perfiles de venue correspondientes

INSERT INTO venue_profiles (user_id, capacity, amenities, opening_time, closing_time, address, map_url, phone, gallery)
SELECT 
    u.id as user_id,
    CASE u.name
        WHEN 'La Sala Roja' THEN 80
        WHEN 'El Búnker Music Club' THEN 250
        WHEN 'Café Central Live' THEN 60
        WHEN 'Teatro Indie Valencia' THEN 180
        WHEN 'La Cueva del Jazz' THEN 100
        WHEN 'Rock Palace Arena' THEN 800
        WHEN 'El Rincón Acústico' THEN 50
        WHEN 'Beats Underground' THEN 300
        WHEN 'La Taberna Musical' THEN 70
        WHEN 'Estadio Mini Arena' THEN 1200
        WHEN 'Blues & Bourbon Bar' THEN 90
        WHEN 'El Loft Cultural' THEN 120
        WHEN 'Garage Rock Club' THEN 150
        WHEN 'Sala Indie Pop' THEN 200
        WHEN 'El Sótano Sessions' THEN 40
        WHEN 'Arena Urbana' THEN 500
        WHEN 'La Factoría del Sonido' THEN 400
        WHEN 'Vintage Music Hall' THEN 130
        WHEN 'Electronic Playground' THEN 350
        WHEN 'Acústica Premium' THEN 110
    END as capacity,
    CASE u.name
        WHEN 'La Sala Roja' THEN 'WiFi gratis,Bar completo,Aire acondicionado,Sistema de sonido,Iluminación LED'
        WHEN 'El Búnker Music Club' THEN 'WiFi gratis,Bar,Pista de baile,Sistema de sonido profesional,Iluminación espectáculo,Zona VIP,Parking'
        WHEN 'Café Central Live' THEN 'WiFi gratis,Cafetería,Terraza,Sistema de sonido,Piano acústico'
        WHEN 'Teatro Indie Valencia' THEN 'Escenario teatral,Sistema de sonido profesional,Iluminación teatral,Butacas,Aire acondicionado'
        WHEN 'La Cueva del Jazz' THEN 'Bar especializado,Piano de cola,Sistema de sonido jazz,Iluminación tenue,Zona fumadores'
        WHEN 'Rock Palace Arena' THEN 'Escenario grande,Sistema de sonido profesional,Iluminación espectáculo,Bar múltiple,Zona VIP,Parking,Seguridad'
        WHEN 'El Rincón Acústico' THEN 'Ambiente íntimo,Instrumentos disponibles,Sistema acústico,Decoración artesanal'
        WHEN 'Beats Underground' THEN 'Pista de baile,Sistema sonido DJ,Luces láser,Bar,Zona chill-out'
        WHEN 'La Taberna Musical' THEN 'Ambiente familiar,Comida tradicional,Bar,Instrumentos folk,Chimenea'
        WHEN 'Estadio Mini Arena' THEN 'Escenario principal,Sistema sonido arena,Pantallas LED,Múltiples barras,Parking amplio,Seguridad'
        WHEN 'Blues & Bourbon Bar' THEN 'Decoración americana,Bar whisky,Sistema sonido blues,Billar,Zona fumadores'
        WHEN 'El Loft Cultural' THEN 'Espacio versátil,Galería arte,WiFi gratis,Proyector,Sistema sonido'
        WHEN 'Garage Rock Club' THEN 'Ambiente auténtico,Bar cerveza,Sistema sonido rock,Decoración vintage'
        WHEN 'Sala Indie Pop' THEN 'Diseño moderno,Sistema crystal clear,Iluminación LED,Bar cócteles,WiFi gratis'
        WHEN 'El Sótano Sessions' THEN 'Atmósfera underground,Ambiente íntimo,Sistema acústico,Bar pequeño'
        WHEN 'Arena Urbana' THEN 'Múltiples espacios,Sistemas diversos,Barras múltiples,Parking,WiFi gratis'
        WHEN 'La Factoría del Sonido' THEN 'Espacios amplios,Decoración industrial,Sistema profesional,Bar,Parking'
        WHEN 'Vintage Music Hall' THEN 'Decoración años 50,Piano vintage,Sistema retro,Bar clásico,Pista baile'
        WHEN 'Electronic Playground' THEN 'Tecnología avanzada,Lighting show,Sistema inmersivo,Bar,Zona VIP'
        WHEN 'Acústica Premium' THEN 'Acústica natural,Ambiente histórico,Sistema premium,Servicio exclusivo'
    END as amenities,
    CASE u.name
        WHEN 'La Sala Roja' THEN '19:00'
        WHEN 'El Búnker Music Club' THEN '22:00'
        WHEN 'Café Central Live' THEN '08:00'
        WHEN 'Teatro Indie Valencia' THEN '18:00'
        WHEN 'La Cueva del Jazz' THEN '20:00'
        WHEN 'Rock Palace Arena' THEN '19:00'
        WHEN 'El Rincón Acústico' THEN '18:30'
        WHEN 'Beats Underground' THEN '23:00'
        WHEN 'La Taberna Musical' THEN '12:00'
        WHEN 'Estadio Mini Arena' THEN '18:00'
        WHEN 'Blues & Bourbon Bar' THEN '19:30'
        WHEN 'El Loft Cultural' THEN '10:00'
        WHEN 'Garage Rock Club' THEN '20:00'
        WHEN 'Sala Indie Pop' THEN '19:00'
        WHEN 'El Sótano Sessions' THEN '21:00'
        WHEN 'Arena Urbana' THEN '17:00'
        WHEN 'La Factoría del Sonido' THEN '18:30'
        WHEN 'Vintage Music Hall' THEN '19:30'
        WHEN 'Electronic Playground' THEN '22:30'
        WHEN 'Acústica Premium' THEN '19:00'
    END as opening_time,
    CASE u.name
        WHEN 'La Sala Roja' THEN '01:00'
        WHEN 'El Búnker Music Club' THEN '05:00'
        WHEN 'Café Central Live' THEN '00:00'
        WHEN 'Teatro Indie Valencia' THEN '23:00'
        WHEN 'La Cueva del Jazz' THEN '02:00'
        WHEN 'Rock Palace Arena' THEN '02:00'
        WHEN 'El Rincón Acústico' THEN '23:30'
        WHEN 'Beats Underground' THEN '06:00'
        WHEN 'La Taberna Musical' THEN '01:00'
        WHEN 'Estadio Mini Arena' THEN '01:00'
        WHEN 'Blues & Bourbon Bar' THEN '02:30'
        WHEN 'El Loft Cultural' THEN '22:00'
        WHEN 'Garage Rock Club' THEN '02:00'
        WHEN 'Sala Indie Pop' THEN '01:30'
        WHEN 'El Sótano Sessions' THEN '02:00'
        WHEN 'Arena Urbana' THEN '03:00'
        WHEN 'La Factoría del Sonido' THEN '01:30'
        WHEN 'Vintage Music Hall' THEN '01:00'
        WHEN 'Electronic Playground' THEN '06:00'
        WHEN 'Acústica Premium' THEN '23:00'
    END as closing_time,
    CASE u.name
        WHEN 'La Sala Roja' THEN 'Calle de la Montera 15, 28013 Madrid, España'
        WHEN 'El Búnker Music Club' THEN 'Carrer del Rosselló 208, 08008 Barcelona, España'
        WHEN 'Café Central Live' THEN 'Plaza de la Reina 8, 46003 Valencia, España'
        WHEN 'Teatro Indie Valencia' THEN 'Carrer de Xàtiva 24, 46007 Valencia, España'
        WHEN 'La Cueva del Jazz' THEN 'Calle Betis 12, 41010 Sevilla, España'
        WHEN 'Rock Palace Arena' THEN 'Gran Vía 45, 48011 Bilbao, España'
        WHEN 'El Rincón Acústico' THEN 'Calle Elvira 22, 18010 Granada, España'
        WHEN 'Beats Underground' THEN 'Calle Alfonso I 20, 50003 Zaragoza, España'
        WHEN 'La Taberna Musical' THEN 'Plaza Mayor 32, 37002 Salamanca, España'
        WHEN 'Estadio Mini Arena' THEN 'Avenida Juan Carlos I 15, 30100 Murcia, España'
        WHEN 'Blues & Bourbon Bar' THEN 'Calle Gondomar 8, 14001 Córdoba, España'
        WHEN 'El Loft Cultural' THEN 'Avenida Maisonnave 53, 03003 Alicante, España'
        WHEN 'Garage Rock Club' THEN 'Calle Corrida 18, 33206 Gijón, España'
        WHEN 'Sala Indie Pop' THEN 'Calle Isabel II 2, 39001 Santander, España'
        WHEN 'El Sótano Sessions' THEN 'Calle Ancha 14, 24003 León, España'
        WHEN 'Arena Urbana' THEN 'Calle Estafeta 34, 31001 Pamplona, España'
        WHEN 'La Factoría del Sonido' THEN 'Avenida de Europa 11, 06004 Badajoz, España'
        WHEN 'Vintage Music Hall' THEN 'Plaza de Armas 7, 10003 Cáceres, España'
        WHEN 'Electronic Playground' THEN 'Calle Portales 42, 26001 Logroño, España'
        WHEN 'Acústica Premium' THEN 'Calle Alfonso XII 28, 45001 Toledo, España'
    END as address,
    CASE u.name
        WHEN 'La Sala Roja' THEN 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3037.5!2d-3.7037902!3d40.4237054!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDI1JzI1LjMiTiAzwrA0MicxMy42Ilc!5e0!3m2!1ses!2ses!4v1234567890!5m2!1ses!2ses'
        WHEN 'El Búnker Music Club' THEN 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2992.8!2d2.1734035!3d41.3947688!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDIzJzQxLjIiTiAywroxMCcxMi4zIkU!5e0!3m2!1ses!2ses!4v1234567890!5m2!1ses!2ses'
        WHEN 'Café Central Live' THEN 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3079.5!2d-0.3762881!3d39.4699075!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMznCsDI4JzExLjciTiAwwrowMjInMzQuNiJX!5e0!3m2!1ses!2ses!4v1234567890!5m2!1ses!2ses'
        ELSE 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d-3.7037902!3d40.4237054!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1'
    END as map_url,
    u.phone,
    CASE u.name
        WHEN 'La Sala Roja' THEN 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400,https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400,https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400'
        WHEN 'El Búnker Music Club' THEN 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400,https://images.unsplash.com/photo-1520637836862-4d197d17c53a?w=400'
        WHEN 'Café Central Live' THEN 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400,https://images.unsplash.com/photo-1445991842772-097fea258e7b?w=400'
        ELSE 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400'
    END as gallery
FROM users u
WHERE u.role = 'Local' 
AND u.name IN ('La Sala Roja', 'El Búnker Music Club', 'Café Central Live', 'Teatro Indie Valencia', 'La Cueva del Jazz', 'Rock Palace Arena', 'El Rincón Acústico', 'Beats Underground', 'La Taberna Musical', 'Estadio Mini Arena', 'Blues & Bourbon Bar', 'El Loft Cultural', 'Garage Rock Club', 'Sala Indie Pop', 'El Sótano Sessions', 'Arena Urbana', 'La Factoría del Sonido', 'Vintage Music Hall', 'Electronic Playground', 'Acústica Premium');