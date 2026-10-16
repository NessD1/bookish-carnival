-- ==============================================================================
-- CROWN & BLADE BARBERSHOP - SUPABASE DATABASE SCHEMA & SEED DATA
-- ==============================================================================
-- Copia y pega todo este script en el "SQL Editor" de tu panel de Supabase y haz clic en "Run".

-- 1. TABLA DE BARBEROS (barbers)
CREATE TABLE IF NOT EXISTS public.barbers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    avatar TEXT NOT NULL,
    rating NUMERIC(3,2) DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 0,
    specialties TEXT[] DEFAULT '{}',
    is_available BOOLEAN DEFAULT true,
    phone TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA DE SERVICIOS (services)
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('hair', 'beard', 'combo', 'treatment', 'kids')),
    duration_minutes INTEGER NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    description TEXT NOT NULL,
    icon_name TEXT NOT NULL,
    popular BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA DE CLIENTES (clients)
CREATE TABLE IF NOT EXISTS public.clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    avatar TEXT,
    notes TEXT,
    vip BOOLEAN DEFAULT false,
    total_visits INTEGER DEFAULT 0,
    preferred_barber_id TEXT REFERENCES public.barbers(id) ON DELETE SET NULL,
    last_visit DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA DE CITAS (appointments)
CREATE TABLE IF NOT EXISTS public.appointments (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    client_email TEXT,
    barber_id TEXT NOT NULL,
    barber_name TEXT NOT NULL,
    service_id TEXT NOT NULL,
    service_name TEXT NOT NULL,
    service_price NUMERIC(10,2) NOT NULL,
    service_duration INTEGER NOT NULL,
    date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'in-chair', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reminder_enabled BOOLEAN DEFAULT true
);

-- 5. TABLA DE INFORMACIÓN DEL SALÓN (salon_info)
CREATE TABLE IF NOT EXISTS public.salon_info (
    id INTEGER PRIMARY KEY DEFAULT 1,
    name TEXT NOT NULL,
    tagline TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    opening_time TEXT NOT NULL,
    closing_time TEXT NOT NULL,
    currency TEXT DEFAULT '$',
    rating NUMERIC(3,2) DEFAULT 4.9,
    review_count INTEGER DEFAULT 348
);

-- ==============================================================================
-- HABILITAR ROW LEVEL SECURITY (RLS) Y POLÍTICAS DE ACCESO
-- ==============================================================================
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salon_info ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas para la app móvil (lectura y escritura pública/anon)
DO $$
BEGIN
    -- Barbers
    DROP POLICY IF EXISTS "Permitir todo en barbers" ON public.barbers;
    CREATE POLICY "Permitir todo en barbers" ON public.barbers FOR ALL USING (true) WITH CHECK (true);

    -- Services
    DROP POLICY IF EXISTS "Permitir todo en services" ON public.services;
    CREATE POLICY "Permitir todo en services" ON public.services FOR ALL USING (true) WITH CHECK (true);

    -- Clients
    DROP POLICY IF EXISTS "Permitir todo en clients" ON public.clients;
    CREATE POLICY "Permitir todo en clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);

    -- Appointments
    DROP POLICY IF EXISTS "Permitir todo en appointments" ON public.appointments;
    CREATE POLICY "Permitir todo en appointments" ON public.appointments FOR ALL USING (true) WITH CHECK (true);

    -- Salon Info
    DROP POLICY IF EXISTS "Permitir todo en salon_info" ON public.salon_info;
    CREATE POLICY "Permitir todo en salon_info" ON public.salon_info FOR ALL USING (true) WITH CHECK (true);
END $$;

-- Habilitar Supabase Realtime para la tabla de citas
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;

-- ==============================================================================
-- DATOS INICIALES (SEED DATA)
-- ==============================================================================

-- Barberos
INSERT INTO public.barbers (id, name, title, avatar, rating, reviews_count, specialties, is_available, phone)
VALUES
  ('barber_1', 'Marcus Vance', 'Maestro Barbero y Fundador', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces', 4.98, 164, ARRAY['Degradados (Fade)', 'Tijera Clásica', 'Afeitado con Toalla Caliente'], true, '+1 (555) 901-2231'),
  ('barber_2', 'Alex "Edge" Rivera', 'Especialista Senior en Degradados', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces', 4.92, 112, ARRAY['Taper Fade', 'Esculpido de Barba', 'Diseños / Hair Tattoo'], true, '+1 (555) 901-4452'),
  ('barber_3', 'Elena Rostova', 'Estilista Senior y Colorista', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces', 4.95, 98, ARRAY['Texturizado', 'Color Camuflaje', 'Tratamientos Capilares'], true, '+1 (555) 901-7783'),
  ('barber_4', 'David Chen', 'Barbero Clásico', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=faces', 4.88, 75, ARRAY['Corte Caballero', 'Afeitado Navaja Clásica', 'Cuidado del Cuero Cabelludo'], true, '+1 (555) 901-8894')
ON CONFLICT (id) DO NOTHING;

-- Servicios
INSERT INTO public.services (id, name, category, duration_minutes, price, description, icon_name, popular)
VALUES
  ('srv_1', 'Corte Degradado y Estilo Signature', 'hair', 45, 45.00, 'Degradado de precisión (Skin o Taper Fade), trabajo a tijera superior, afeitado de cuello y toalla caliente.', 'cut-outline', true),
  ('srv_2', 'Corte Ejecutivo y Afeitado con Toalla Caliente', 'combo', 60, 68.00, 'Corte personalizado completo combinado con nuestro afeitado tradicional a navaja en 3 pasos y bálsamo facial.', 'sparkles-outline', true),
  ('srv_3', 'Esculpido y Perfilado de Barba', 'beard', 30, 30.00, 'Diseño de barba a máquina, perfilado a navaja recta, tratamiento con aceite tibio y bálsamo orgánico.', 'man-outline', true),
  ('srv_4', 'Corte Caballero Clásico', 'hair', 35, 38.00, 'Corte tradicional de tijera y máquina, patillas pulidas, nuca limpia y acabado con pomada mate.', 'cut-outline', false),
  ('srv_5', 'Spa Deluxe y Vapor para Barba', 'treatment', 35, 42.00, 'Vapor facial herbal, lavado profundo, mascarilla acondicionadora, perfilado a navaja y esferas frías.', 'water-outline', false),
  ('srv_6', 'Camuflaje de Canas (Cabello y Barba)', 'treatment', 40, 55.00, 'Matización discreta y natural de canas para cabello y barba que se desvanece de forma homogénea.', 'color-palette-outline', false),
  ('srv_7', 'Detox Capilar y Masaje Relajante', 'treatment', 25, 28.00, 'Exfoliación con sales marinas, champú revitalizante de árbol de té y 10 min de masaje relajante.', 'happy-outline', false),
  ('srv_8', 'Corte Infantil (Menores de 12)', 'kids', 30, 28.00, 'Corte paciente y con estilo para niños, incluye producto de peinado y calcomanía de regalo.', 'person-outline', false)
ON CONFLICT (id) DO NOTHING;

-- Clientes
INSERT INTO public.clients (id, name, phone, email, notes, vip, total_visits, preferred_barber_id, last_visit)
VALUES
  ('cli_1', 'Lucas Campbell', '+1 (555) 432-1098', 'lucas.c@example.com', 'Prefiere degradado bajo a piel, pasta de textura arriba. Café con leche de avena.', true, 18, 'barber_1', CURRENT_DATE - 14),
  ('cli_2', 'Mateo Sánchez', '+1 (555) 234-5678', 'mateo.s@example.com', 'Corte ejecutivo clásico cada 3 semanas. Siempre toalla caliente.', false, 7, 'barber_2', CURRENT_DATE - 21),
  ('cli_3', 'Jordan Reed', '+1 (555) 876-5432', 'jordan.reed@example.com', 'Tratamiento de canas con Elena. Piel sensible.', false, 4, 'barber_3', CURRENT_DATE - 35),
  ('cli_4', 'Anthony Rossi', '+1 (555) 789-0123', 'anthony.r@example.com', 'Primera vez, recomendado por Lucas Campbell.', false, 1, 'barber_4', CURRENT_DATE - 40),
  ('cli_5', 'Samira Patel', '+1 (555) 345-6789', 'samira.p@example.com', 'Reserva cita para su hijo Liam con Marcus.', false, 3, 'barber_1', CURRENT_DATE - 60)
ON CONFLICT (id) DO NOTHING;

-- Información del Salón
INSERT INTO public.salon_info (id, name, tagline, address, phone, opening_time, closing_time, currency, rating, review_count)
VALUES (1, 'Barbería Crown & Blade', 'Cortes Artesanales, Afeitado Tradicional y Estilo Moderno', 'Calle Mayor 452, Centro', '+1 (555) 328-8742', '09:00 AM', '07:00 PM', '$', 4.9, 348)
ON CONFLICT (id) DO NOTHING;

-- Citas de ejemplo (para el día actual)
INSERT INTO public.appointments (id, client_id, client_name, client_phone, client_email, barber_id, barber_name, service_id, service_name, service_price, service_duration, date, time_slot, status, notes, reminder_enabled)
VALUES
  ('apt_101', 'cli_1', 'Lucas Campbell', '+1 (555) 432-1098', 'lucas.c@example.com', 'barber_1', 'Marcus Vance', 'srv_1', 'Corte Degradado y Estilo Signature', 45.00, 45, CURRENT_DATE, '09:30 AM', 'completed', 'Cliente VIP habitual. Servicio terminado a satisfacción.', true),
  ('apt_102', 'cli_2', 'Mateo Sánchez', '+1 (555) 234-5678', 'mateo.s@example.com', 'barber_2', 'Alex "Edge" Rivera', 'srv_2', 'Corte Ejecutivo y Afeitado con Toalla Caliente', 68.00, 60, CURRENT_DATE, '11:00 AM', 'in-chair', 'En proceso con tratamiento de vapor y toalla caliente.', true),
  ('apt_103', 'cli_3', 'Jordan Reed', '+1 (555) 876-5432', 'jordan.reed@example.com', 'barber_3', 'Elena Rostova', 'srv_6', 'Camuflaje de Canas (Cabello y Barba)', 55.00, 40, CURRENT_DATE, '02:00 PM', 'confirmed', 'Cita confirmada vía SMS.', true),
  ('apt_104', 'cli_4', 'Anthony Rossi', '+1 (555) 789-0123', 'anthony.r@example.com', 'barber_4', 'David Chen', 'srv_4', 'Corte Caballero Clásico', 38.00, 35, CURRENT_DATE, '03:30 PM', 'pending', 'Reserva solicitada en línea. Esperando confirmación.', false)
ON CONFLICT (id) DO NOTHING;
