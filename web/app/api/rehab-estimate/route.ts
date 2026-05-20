import { NextRequest, NextResponse } from 'next/server';
import type { TextBlock } from '@anthropic-ai/sdk/resources/messages';
import { getAnthropic, ANTHROPIC_MODEL } from '@/lib/anthropic';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface RehabItem {
  area: string;
  description: string;
  costLow: number;
  costHigh: number;
}

interface RehabEstimate {
  items: RehabItem[];
  totalLow: number;
  totalHigh: number;
  summary: string;
  conditionScore: number;
}

const SYSTEM_PROMPT_ES = `Eres un estimador de rehabilitación experto para inversionistas
en bienes raíces en Estados Unidos. Analizas fotos de propiedades y produces
estimados de costos en USD para reparaciones.

Categorías típicas: Cocina, Baños, Pisos, Pintura interior, Pintura exterior,
Techo, HVAC, Plomería, Electricidad, Ventanas, Puertas, Gabinetes, Encimeras,
Aparatos, Exterior / Curb appeal, Estructural, Demolición / Limpieza.

Sé conservador. Usa rangos realistas para una propiedad de un solo piso de
~1,200-1,800 ft² en un mercado estadounidense promedio, ajusta según señales
visuales (escala, materiales, daño visible).

Responde ÚNICAMENTE con JSON válido en este esquema exacto:
{
  "items": [
    {
      "area": "string en español",
      "description": "string en español breve",
      "costLow": number,
      "costHigh": number
    }
  ],
  "totalLow": number,
  "totalHigh": number,
  "summary": "string en español de 1-2 oraciones",
  "conditionScore": number (1-10, donde 1 = ruina total, 10 = listo para mudarse)
}

No incluyas markdown, comentarios ni texto fuera del JSON.`;

const SYSTEM_PROMPT_EN = `You are an expert rehab estimator for US real estate
investors. You analyze property photos and produce USD repair cost estimates.

Typical categories: Kitchen, Bathrooms, Flooring, Interior paint, Exterior paint,
Roof, HVAC, Plumbing, Electrical, Windows, Doors, Cabinets, Countertops,
Appliances, Exterior / Curb appeal, Structural, Demo / Cleanout.

Be conservative. Use realistic ranges for a single-story ~1,200-1,800 sqft
property in an average US market, adjusting for visual signals (scale,
materials, visible damage).

Respond ONLY with valid JSON in this exact schema:
{
  "items": [
    {
      "area": "English string",
      "description": "short English string",
      "costLow": number,
      "costHigh": number
    }
  ],
  "totalLow": number,
  "totalHigh": number,
  "summary": "1-2 sentence English string",
  "conditionScore": number (1-10, where 1 = total ruin, 10 = move-in ready)
}

No markdown, comments, or text outside the JSON.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const images: Array<{ base64: string; mediaType: string }> =
      body.images || [];
    const locale: string = body.locale === 'en' ? 'en' : 'es';

    if (images.length === 0) {
      return NextResponse.json(
        {
          error:
            locale === 'en'
              ? 'At least one image is required.'
              : 'Se requiere al menos una imagen.',
        },
        { status: 400 },
      );
    }
    if (images.length > 8) {
      return NextResponse.json(
        {
          error:
            locale === 'en'
              ? 'Maximum 8 images per request.'
              : 'Máximo 8 imágenes por solicitud.',
        },
        { status: 400 },
      );
    }

    const client = getAnthropic();

    const userPrompt =
      locale === 'en'
        ? 'Analyze these property photos and produce an itemized rehab estimate as JSON only.'
        : 'Analiza estas fotos de propiedad y produce un estimado de rehabilitación desglosado, solamente en JSON.';

    const response = await client.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 2048,
      system: locale === 'en' ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_ES,
      messages: [
        {
          role: 'user',
          content: [
            ...images.map((img) => ({
              type: 'image' as const,
              source: {
                type: 'base64' as const,
                media_type: (img.mediaType || 'image/jpeg') as
                  | 'image/jpeg'
                  | 'image/png'
                  | 'image/gif'
                  | 'image/webp',
                data: img.base64,
              },
            })),
            { type: 'text', text: userPrompt },
          ],
        },
      ],
    });

    const text = response.content
      .filter((b): b is TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Respuesta inválida del modelo.', raw: text },
        { status: 502 },
      );
    }

    const parsed: RehabEstimate = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ estimate: parsed });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
