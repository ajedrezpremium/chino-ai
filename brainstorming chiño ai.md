Este es un Mega Prompt de Sistema (System Prompt) diseñado para ser la "alma" de Chiño AI. Está estructurado para que los desarrolladores (tú y tu equipo) lo integren en el backend (probablemente como el system_message de una API tipo OpenAI, Anthropic o un modelo local Llama 3/Qwen fine-tuned).
Además, incluye instrucciones técnicas para la integración de voz y la estructura de datos necesaria.
📂 DOCUMENTO TÉCNICO: CHIÑO AI - SYSTEM PROMPT & ARCHITECTURE
Nombre del Agente: Chiño AI
Versión: 1.0 (Mayo 2026)
Rol: Embajador Digital, Historiador Jefe y Asistente Personal del Abonado del Real Club Celta de Vigo.
Tono de Voz: Celista, orgulloso, cercano, erudito pero accesible, con toques de humor gallego ("listillo" pero respetuoso).
Idiomas: Gallego (prioritario/emocional), Español (estándar), Inglés (internacional).
1. INSTRUCCIONES MAESTRAS DEL SISTEMA (SYSTEM PROMPT)
markdown
123456789101112131415161718192021222324252627282930313233343536373839404142434445464748495051525354555657585960616263646566676869707172737475767778798081828384858687888990919293
2. ARQUITECTURA DE DATOS NECESARIA (Para tu Backend)
Para que Chiño AI funcione como prometes, necesitas alimentar el prompt con una base de datos estructurada (SQL/NoSQL) y vectorial.
A. Base de Datos Relacional (SQL - PostgreSQL recomendado)
Tabla Players_History: ID, Nombre, Apellidos, Fecha Nacimiento, Posición, Temporadas Activas, Stats (Goles, Partidos, etc.).
Tabla Matches_Archive: ID, Fecha, Rival, Resultado, Competición, Alineación Titular, Goleadores.
Tabla Staff_Directory: ID, Nombre, Cargo (Entrenador, Médico, Prensa, etc.), Fecha Inicio, Fecha Fin, Foto URL.
Tabla Sponsors_Partners: ID, Nombre, Tipo (Principal, Oficial), Vigencia, Logo URL.
Tabla Subscribers_Exclusive: ID_Usuario, Tipo Abono, Preferencias, Historial de Asistencia.
B. Base de Datos Vectorial (Para Búsqueda Semántica - "La Enciclopedia")
Usa Pinecone, Weaviate o pgvector.
Documentos Ingestados:
Libros de historia del Celta (digitalizados).
Noticias archivadas (1923-2026).
Biografías detalladas de los Top 50 jugadores.
Actas de fundación y documentos legales históricos.
Entrevistas famosas (transcritas).
C. APIs en Tiempo Real (Funciones del Agente)
El agente debe tener "Tools" (herramientas) para llamar a:
API de LaLiga / DataSportsGroup: Para clasificaciones en vivo, resultados del día, lesiones actuales.
API de Taquilla Celta: Para verificar estado de entradas del abonado logueado.
API de Meteorología: Para recomendar ropa para ir a Balaídos.
3. IMPLEMENTACIÓN TÉCNICA (Snippet para tu Web/Móvil)
Dado que trabajas con JS/React y Python, aquí tienes cómo estructurar la llamada:
javascript
123456789101112131415161718192021222324252627282930313233343536373839404142
4. ESTRATEGIA DE LANZAMIENTO "CHIÑO AI"
Fase Beta (Abonados Premium): Lanzarlo solo para los abonados de preferente/vip. Ellos validarán la precisión de los datos históricos y la utilidad de los servicios exclusivos.
Gamificación Histórica: "Pregúntale a Chiño". Un quiz diario donde Chiño hace una pregunta histórica. Si aciertas, ganas puntos canjeables por descuentos en la tienda.
Voz Personalizada: Contrata a un locutor gallego con carisma (o usa ElevenLabs para clonar una voz cálida y madura) para que Chiño no suene robótico. La voz debe sonar a "amigo experto del bar de al lado del estadio".
¿Quieres que prepare el script de Python para hacer el scraping inicial de los datos históricos de Wikipedia/BDFutbol para llenar la base de datos vectorial?
¿Cómo puedo ayudarte hoy?


El contenido generado por IA puede no ser preciso.