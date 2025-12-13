const { Client } = require('pg');

// Configuración de la base de datos
const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '1234',
  database: 'book_db'
});

const venuesData = [
  {
    name: 'La Sala Roja',
    email: 'info@lasalaroja.es',
    city: 'Madrid',
    province: 'Madrid',
    bio: 'Un espacio íntimo y acogedor perfecto para conciertos acústicos y presentaciones. Con una decoración vintage y un ambiente cálido.',
    phone: '+34 915 123 456',
    capacity: 80,
    amenities: 'WiFi gratis,Bar completo,Aire acondicionado,Sistema de sonido,Iluminación LED',
    openingTime: '19:00',
    closingTime: '01:00',
    address: 'Calle de la Montera 15, 28013 Madrid, España',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3037.5!2d-3.7037902!3d40.4237054',
    gallery: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400,https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400'
  },
  {
    name: 'El Búnker Music Club',
    email: 'contacto@elbunkerclub.com',
    city: 'Barcelona',
    province: 'Cataluña',
    bio: 'Club underground con los mejores equipos de sonido. Especializado en música electrónica y rock alternativo.',
    phone: '+34 934 567 890',
    capacity: 250,
    amenities: 'WiFi gratis,Bar,Pista de baile,Sistema de sonido profesional,Iluminación espectáculo,Zona VIP,Parking',
    openingTime: '22:00',
    closingTime: '05:00',
    address: 'Carrer del Rosselló 208, 08008 Barcelona, España',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2992.8!2d2.1734035!3d41.3947688',
    gallery: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400,https://images.unsplash.com/photo-1520637836862-4d197d17c53a?w=400'
  },
  {
    name: 'Café Central Live',
    email: 'eventos@cafecentral.es',
    city: 'Valencia',
    province: 'Valencia',
    bio: 'Café con escenario en vivo, perfecto para artistas emergentes. Ambiente bohemio y público conocedor de buena música.',
    phone: '+34 963 789 123',
    capacity: 60,
    amenities: 'WiFi gratis,Cafetería,Terraza,Sistema de sonido,Piano acústico',
    openingTime: '08:00',
    closingTime: '00:00',
    address: 'Plaza de la Reina 8, 46003 Valencia, España',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3079.5!2d-0.3762881!3d39.4699075',
    gallery: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400,https://images.unsplash.com/photo-1445991842772-097fea258e7b?w=400'
  },
  {
    name: 'Teatro Indie Valencia',
    email: 'reservas@teatroindievalencia.com',
    city: 'Valencia',
    province: 'Valencia',
    bio: 'Teatro adaptado para conciertos indie y rock. Acústica excepcional y ambiente teatral único.',
    phone: '+34 963 456 789',
    capacity: 180,
    amenities: 'Escenario teatral,Sistema de sonido profesional,Iluminación teatral,Butacas,Aire acondicionado',
    openingTime: '18:00',
    closingTime: '23:00',
    address: 'Carrer de Xàtiva 24, 46007 Valencia, España',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d-0.3762881!3d39.4699075',
    gallery: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400'
  },
  {
    name: 'La Cueva del Jazz',
    email: 'info@lacuevajazz.es',
    city: 'Sevilla',
    province: 'Andalucía',
    bio: 'Local especializado en jazz y blues. Decoración vintage, iluminación tenue y los mejores cócteles de la ciudad.',
    phone: '+34 954 321 654',
    capacity: 100,
    amenities: 'Bar especializado,Piano de cola,Sistema de sonido jazz,Iluminación tenue,Zona fumadores',
    openingTime: '20:00',
    closingTime: '02:00',
    address: 'Calle Betis 12, 41010 Sevilla, España',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d-5.9962!3d37.3886',
    gallery: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400'
  },
  {
    name: 'Rock Palace Arena',
    email: 'booking@rockpalace.es',
    city: 'Bilbao',
    province: 'País Vasco',
    bio: 'Gran sala de conciertos con capacidad para 800 personas. Especializada en rock, metal y música alternativa.',
    phone: '+34 944 111 222',
    capacity: 800,
    amenities: 'Escenario grande,Sistema de sonido profesional,Iluminación espectáculo,Bar múltiple,Zona VIP,Parking,Seguridad',
    openingTime: '19:00',
    closingTime: '02:00',
    address: 'Gran Vía 45, 48011 Bilbao, España',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d-2.9253!3d43.2627',
    gallery: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400'
  },
  {
    name: 'El Rincón Acústico',
    email: 'eventos@rinconacustico.com',
    city: 'Granada',
    province: 'Andalucía',
    bio: 'Espacio íntimo para música acústica y folk. Ambiente relajado con decoración artesanal.',
    phone: '+34 958 777 888',
    capacity: 50,
    amenities: 'Ambiente íntimo,Instrumentos disponibles,Sistema acústico,Decoración artesanal',
    openingTime: '18:30',
    closingTime: '23:30',
    address: 'Calle Elvira 22, 18010 Granada, España',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d-3.5986!3d37.1773',
    gallery: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400'
  },
  {
    name: 'Beats Underground',
    email: 'info@beatsunderground.es',
    city: 'Zaragoza',
    province: 'Aragón',
    bio: 'Club nocturno especializado en electrónica y techno. Sistema de sonido profesional y pista de baile amplia.',
    phone: '+34 976 333 444',
    capacity: 300,
    amenities: 'Pista de baile,Sistema sonido DJ,Luces láser,Bar,Zona chill-out',
    openingTime: '23:00',
    closingTime: '06:00',
    address: 'Calle Alfonso I 20, 50003 Zaragoza, España',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d-0.8773!3d41.6488',
    gallery: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400'
  },
  {
    name: 'La Taberna Musical',
    email: 'contacto@tabernamusical.es',
    city: 'Salamanca',
    province: 'Castilla y León',
    bio: 'Taberna tradicional con escenario para música folk y tradicional. Ambiente familiar y acogedor.',
    phone: '+34 923 555 666',
    capacity: 70,
    amenities: 'Ambiente familiar,Comida tradicional,Bar,Instrumentos folk,Chimenea',
    openingTime: '12:00',
    closingTime: '01:00',
    address: 'Plaza Mayor 32, 37002 Salamanca, España',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d-5.6640!3d40.9701',
    gallery: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400'
  },
  {
    name: 'Estadio Mini Arena',
    email: 'eventos@miniarena.com',
    city: 'Murcia',
    province: 'Murcia',
    bio: 'Pabellón adaptado para conciertos de gran formato. Capacidad para 1200 personas con excelente acústica.',
    phone: '+34 968 999 000',
    capacity: 1200,
    amenities: 'Escenario principal,Sistema sonido arena,Pantallas LED,Múltiples barras,Parking amplio,Seguridad',
    openingTime: '18:00',
    closingTime: '01:00',
    address: 'Avenida Juan Carlos I 15, 30100 Murcia, España',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d-1.1307!3d37.9922',
    gallery: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400'
  },
  {
    name: 'Blues & Bourbon Bar',
    email: 'reservas@bluesbar.es',
    city: 'Córdoba',
    province: 'Andalucía',
    bio: 'Bar temático especializado en blues y country. Decoración americana y whiskies premium.',
    phone: '+34 957 123 789',
    capacity: 90,
    amenities: 'Decoración americana,Bar whisky,Sistema sonido blues,Billar,Zona fumadores',
    openingTime: '19:30',
    closingTime: '02:30',
    address: 'Calle Gondomar 8, 14001 Córdoba, España',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d-4.7794!3d37.8882',
    gallery: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400'
  },
  {
    name: 'El Loft Cultural',
    email: 'info@loftcultural.es',
    city: 'Alicante',
    province: 'Valencia',
    bio: 'Espacio cultural multidisciplinar. Perfecto para conciertos íntimos, presentaciones y eventos artísticos.',
    phone: '+34 965 444 555',
    capacity: 120,
    amenities: 'Espacio versátil,Galería arte,WiFi gratis,Proyector,Sistema sonido',
    openingTime: '10:00',
    closingTime: '22:00',
    address: 'Avenida Maisonnave 53, 03003 Alicante, España',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d-0.4814!3d38.3452',
    gallery: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400'
  },
  {
    name: 'Garage Rock Club',
    email: 'booking@garagerock.es',
    city: 'Gijón',
    province: 'Asturias',
    bio: 'Club de rock en un antiguo garaje. Ambiente auténtico y público fiel al rock clásico.',
    phone: '+34 985 666 777',
    capacity: 150,
    amenities: 'Ambiente auténtico,Bar cerveza,Sistema sonido rock,Decoración vintage',
    openingTime: '20:00',
    closingTime: '02:00',
    address: 'Calle Corrida 18, 33206 Gijón, España',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d-5.6615!3d43.5459',
    gallery: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400'
  },
  {
    name: 'Sala Indie Pop',
    email: 'eventos@salapop.com',
    city: 'Santander',
    province: 'Cantabria',
    bio: 'Sala moderna especializada en indie pop y música alternativa. Decoración minimalista y sonido crystal clear.',
    phone: '+34 942 888 999',
    capacity: 200,
    amenities: 'Diseño moderno,Sistema crystal clear,Iluminación LED,Bar cócteles,WiFi gratis',
    openingTime: '19:00',
    closingTime: '01:30',
    address: 'Calle Isabel II 2, 39001 Santander, España',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d-3.8084!3d43.4623',
    gallery: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400'
  },
  {
    name: 'El Sótano Sessions',
    email: 'info@sotanosessions.es',
    city: 'León',
    province: 'Castilla y León',
    bio: 'Espacio underground en el sótano de un edificio histórico. Atmósfera única para conciertos íntimos.',
    phone: '+34 987 111 333',
    capacity: 40,
    amenities: 'Atmósfera underground,Ambiente íntimo,Sistema acústico,Bar pequeño',
    openingTime: '21:00',
    closingTime: '02:00',
    address: 'Calle Ancha 14, 24003 León, España',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d-5.5631!3d42.5987',
    gallery: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400'
  },
  {
    name: 'Arena Urbana',
    email: 'contacto@arenaurbana.es',
    city: 'Pamplona',
    province: 'Navarra',
    bio: 'Complejo de entretenimiento urbano. Múltiples espacios para diferentes estilos musicales.',
    phone: '+34 948 222 444',
    capacity: 500,
    amenities: 'Múltiples espacios,Sistemas diversos,Barras múltiples,Parking,WiFi gratis',
    openingTime: '17:00',
    closingTime: '03:00',
    address: 'Calle Estafeta 34, 31001 Pamplona, España',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d-1.6440!3d42.8169',
    gallery: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400'
  },
  {
    name: 'La Factoría del Sonido',
    email: 'booking@factoriasonido.com',
    city: 'Badajoz',
    province: 'Extremadura',
    bio: 'Antigua fábrica convertida en sala de conciertos. Espacios amplios con decoración industrial.',
    phone: '+34 924 555 777',
    capacity: 400,
    amenities: 'Espacios amplios,Decoración industrial,Sistema profesional,Bar,Parking',
    openingTime: '18:30',
    closingTime: '01:30',
    address: 'Avenida de Europa 11, 06004 Badajoz, España',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d-6.9707!3d38.8794',
    gallery: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400'
  },
  {
    name: 'Vintage Music Hall',
    email: 'eventos@vintagemusic.es',
    city: 'Cáceres',
    province: 'Extremadura',
    bio: 'Salón de música con decoración de los años 50. Especializado en swing, jazz y música vintage.',
    phone: '+34 927 666 888',
    capacity: 130,
    amenities: 'Decoración años 50,Piano vintage,Sistema retro,Bar clásico,Pista baile',
    openingTime: '19:30',
    closingTime: '01:00',
    address: 'Plaza de Armas 7, 10003 Cáceres, España',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d-6.3724!3d39.4757',
    gallery: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400'
  },
  {
    name: 'Electronic Playground',
    email: 'info@electronicplay.es',
    city: 'Logroño',
    province: 'La Rioja',
    bio: 'Club de música electrónica con las últimas tecnologías. Lighting show y sistema de sonido inmersivo.',
    phone: '+34 941 777 999',
    capacity: 350,
    amenities: 'Tecnología avanzada,Lighting show,Sistema inmersivo,Bar,Zona VIP',
    openingTime: '22:30',
    closingTime: '06:00',
    address: 'Calle Portales 42, 26001 Logroño, España',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d-2.4449!3d42.4627',
    gallery: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400'
  },
  {
    name: 'Acústica Premium',
    email: 'reservas@acusticapremium.com',
    city: 'Toledo',
    province: 'Castilla-La Mancha',
    bio: 'Sala premium para música clásica y acústica. Acústica natural excepcional en edificio histórico.',
    phone: '+34 925 000 111',
    capacity: 110,
    amenities: 'Acústica natural,Ambiente histórico,Sistema premium,Servicio exclusivo',
    openingTime: '19:00',
    closingTime: '23:00',
    address: 'Calle Alfonso XII 28, 45001 Toledo, España',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d-4.0273!3d39.8628',
    gallery: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400'
  }
];

async function seedVenues() {
  try {
    await client.connect();
    console.log('✅ Conexión establecida con la base de datos');

    let createdCount = 0;
    let skippedCount = 0;

    for (const venueData of venuesData) {
      try {
        // Verificar si el usuario ya existe
        const checkUser = await client.query('SELECT user_id FROM users WHERE email = $1', [venueData.email]);
        
        if (checkUser.rows.length > 0) {
          console.log(`⚠️  Usuario ${venueData.name} ya existe, saltando...`);
          skippedCount++;
          continue;
        }

        // Insertar el usuario
        const userResult = await client.query(`
          INSERT INTO users (name, email, password_hash, role, city, country, bio, avatar) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
          RETURNING user_id
        `, [
          venueData.name,
          venueData.email,
          '$2b$10$rQ8K3tOjG5Pf2zG4hW1Lb.vX2mJ9nK5oP6qR7sT8uV9wX0yZ1aB2c', // password: "123456"
          'Local',
          venueData.city,
          venueData.province,
          venueData.bio,
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${venueData.name.toLowerCase().replace(/\s/g, '')}`
        ]);

        const userId = userResult.rows[0].user_id;

        // Insertar el perfil de venue
        await client.query(`
          INSERT INTO venue_profiles (user_id, capacity, amenities, opening_time, closing_time, address, map_url, phone, gallery)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          userId,
          venueData.capacity,
          venueData.amenities,
          venueData.openingTime,
          venueData.closingTime,
          venueData.address,
          venueData.mapUrl,
          venueData.phone,
          venueData.gallery
        ]);

        createdCount++;
        console.log(`✅ Creado: ${venueData.name} en ${venueData.city} (Capacidad: ${venueData.capacity})`);

      } catch (error) {
        console.error(`❌ Error insertando ${venueData.name}:`, error.message);
      }
    }

    // Mostrar estadísticas finales
    const totalResult = await client.query("SELECT COUNT(*) FROM users WHERE role = 'Local'");
    const totalVenues = parseInt(totalResult.rows[0].count);

    console.log(`\n🎉 Proceso completado:`);
    console.log(`   📈 Locales creados: ${createdCount}`);
    console.log(`   ⏭️  Locales saltados (ya existían): ${skippedCount}`);
    console.log(`   📊 Total de locales en BD: ${totalVenues}`);

  } catch (error) {
    console.error('❌ Error durante la inserción:', error);
  } finally {
    await client.end();
  }
}

seedVenues();