# JD's Property Solutions

Plataforma de trabajo bilingüe (español / inglés) para mayoristas e
inversionistas en bienes raíces. Calculadoras de negocios, contratos
descargables y software operativo del día a día.

---

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** con sistema de diseño propio (paleta de neutrales cálidos + acento terracota `#A8553D`)
- **next-intl** para i18n (Español por defecto, inglés vía toggle)
- **Anthropic Claude** (`claude-sonnet-4-5`) para análisis de fotos y generación de texto
- **docx** para generación de contratos `.docx`
- **pdf-lib** preparado para exportación PDF (roadmap)

---

## Estructura del proyecto

```
web/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx                    ← Layout con i18n + tipografía
│   │   ├── page.tsx                      ← Home
│   │   └── herramientas/
│   │       ├── calculadoras/             ← Tab 01: Calculadoras
│   │       ├── recursos/                 ← Tab 02: Recursos
│   │       └── software/                 ← Tab 03: Software
│   ├── api/rehab-estimate/route.ts       ← Endpoint Claude Vision
│   └── globals.css                       ← Tokens de diseño + textura papel
├── components/                           ← UI propio (Button, Card, etc.)
├── data/
│   ├── dictionary.ts                     ← 60+ términos ES/EN
│   └── contracts/                        ← Plantillas legales ES + EN
├── i18n/                                 ← Configuración next-intl
├── lib/
│   ├── calculators.ts                    ← Matemática pura de negocios
│   ├── docx-generator.ts                 ← Generador de .docx
│   ├── anthropic.ts                      ← Cliente Claude
│   ├── fonts.ts                          ← Fraunces + Inter Tight + JetBrains Mono
│   └── utils.ts                          ← cn(), formatters
├── messages/
│   ├── es.json                           ← Cadenas en español (default)
│   └── en.json                           ← Cadenas en inglés
├── middleware.ts                         ← Routing por locale
├── tailwind.config.ts                    ← Tokens (colores, tipo, espaciado)
└── package.json
```

---

## Instalación

Requiere Node.js 18 o superior.

```bash
cd web
npm install
cp .env.example .env.local
# Edita .env.local con tu ANTHROPIC_API_KEY
npm run dev
```

La aplicación arranca en [http://localhost:3000](http://localhost:3000) y
redirige automáticamente a `/es` (idioma por defecto).

---

## Variables de entorno

| Variable             | Requerida | Descripción                                          |
| -------------------- | --------- | ---------------------------------------------------- |
| `ANTHROPIC_API_KEY`  | Sí        | Clave para Estimador de Rehabilitación y generadores |
| `ANTHROPIC_MODEL`    | No        | Modelo de Claude (default: `claude-sonnet-4-5`)      |

Las claves se manejan únicamente en el servidor (rutas `app/api/*`). El
navegador nunca ve la clave.

---

## Comandos

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Lint con ESLint + next/core-web-vitals
npm run typecheck    # Verificación de TypeScript
```

---

## Estado de la v1

| Módulo                                  | Estado          |
| --------------------------------------- | --------------- |
| Sistema de diseño + shell + home        | ✅ Completo     |
| Toggle ES / EN                          | ✅ Completo     |
| Calculadora de hipoteca                 | ✅ Completo     |
| Calculadora de ARV                      | ✅ Completo     |
| Calculadora Fix & Flip (con MAO)        | ✅ Completo     |
| Estimador de Rehabilitación (Claude V.) | ✅ Completo     |
| Diccionario bilingüe (60+ términos)     | ✅ Completo     |
| Contrato de Promesa de Compraventa      | ✅ Completo (.docx ES + EN) |
| Contrato de Asignación                  | ✅ Completo (.docx ES + EN) |
| Calculadoras restantes (Sección 8, etc.) | 🚧 En desarrollo |
| Generador de contratos con IA           | 🚧 En desarrollo |
| Pipeline de negocios (kanban)           | 🚧 En desarrollo |
| Lista de compradores                    | 🚧 En desarrollo |
| Skip trace helper                       | 🚧 En desarrollo |
| Generador de cartas directas (Claude)   | 🚧 En desarrollo |
| Constructor de scripts (Claude)         | 🚧 En desarrollo |

---

## Diseño

**Paleta** (neutrales cálidos + un solo acento):

| Token        | Hex      | Uso                                |
| ------------ | -------- | ---------------------------------- |
| `bone`       | #F5F1EA  | Fondo                              |
| `paper`      | #FAF7F2  | Superficies                        |
| `ink`        | #1A1714  | Texto principal                    |
| `muted`      | #6B6358  | Texto secundario                   |
| `rule`       | #D9D2C5  | Bordes hairline                    |
| `clay`       | #A8553D  | Acento (CTAs, énfasis, focus ring) |
| `charcoal`   | #1F1B16  | Fondo dark mode                    |
| `cream`      | #F5EFE3  | Texto dark mode                    |

**Tipografía:**

- **Display** — Fraunces (serif con carácter, para titulares)
- **UI / cuerpo** — Inter Tight (grotesk limpio)
- **Datos numéricos** — JetBrains Mono (cifras tabulares)

**Lenguaje visual:**

- Bordes de 4px en tarjetas (no pill-rounded)
- Bordes hairline de 1px en lugar de sombras pesadas
- Textura sutil de papel a baja opacidad
- Íconos Lucide (peso 1.5)
- Divisores con texto en versalitas pequeñas
- Espaciado generoso, asimetría intencional

---

## Despliegue en Vercel

El proyecto vive en `web/` dentro del repositorio. Al conectar con Vercel:

1. **Root Directory** → `web`
2. **Framework Preset** → Next.js (auto-detectado)
3. Variables de entorno → añade `ANTHROPIC_API_KEY` en el dashboard
4. Deploy

No se requieren cambios de configuración adicionales.

---

## Notas legales

Las plantillas de contratos están basadas en formatos internos con
jurisdicción de arbitraje en Puerto Rico. Antes de usarlas en producción
en otra jurisdicción, deberán ser revisadas por un abogado licenciado en
el estado correspondiente.

Cada plantilla preserva los campos entre corchetes `[CAMPO_ENTRE_CORCHETES]`
para personalización por negocio.
