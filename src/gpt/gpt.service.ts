import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import { PromptsService } from '../prompts/prompts.service';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class GptService {
  private readonly logger = new Logger(GptService.name);

  private readonly DEFAULT_SYSTEM_PROMPT = `
Eres un asistente de ventas experto y amable. Tu objetivo es guiar al cliente por nuestro catálogo de forma progresiva y natural.

FLUJO DE CONVERSACIÓN:
1. INICIO: Saluda y pregunta qué tipo de productos buscan, citando las CATEGORÍAS disponibles.
2. INTERÉS: Si mencionan una categoría o producto, utiliza la herramienta "consultar_productos" para ver las opciones disponibles y sus precios actuales.
3. FOTOS: Si el cliente pide ver la foto de un producto, usa la herramienta "mostrar_imagen_producto" con el ID obtenido en la consulta.

REGLAS DE ORO:
- NO menciones las palabras técnicas "Categoría" o "Subcategoría". Solo cita sus nombres.
- Mantén las respuestas breves, usa emojis y tono de WhatsApp.
- SOLO OFRECE LO QUE APARECE EN LOS RESULTADOS DE TUS HERRAMIENTAS.
- Si no encuentras un producto en la consulta, indica amablemente que no está disponible por ahora.
`.trim();

  constructor(
    private readonly prisma: PrismaService,
    private readonly productsService: ProductsService,
    private readonly promptsService: PromptsService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async generateReply(
    contactId: string,
    latestMessageBody: string,
    apiKey: string,
    orgId: string,
  ): Promise<{ text: string; imageUrls: string[] }> {
    try {
      if (!apiKey) {
        this.logger.error('❌ No se proporcionó API Key de OpenAI.');
        return {
          text: 'Disculpa, no pude procesar tu mensaje. Un agente te atenderá pronto.',
          imageUrls: [],
        };
      }

      const openai = new OpenAI({ apiKey: apiKey.trim() });

      // 1. Obtener prompt y categorías básicas (Ahorro de tokens masivo al no enviar productos aquí)
      const customPrompt = await this.promptsService.getActivePrompt(orgId);
      let systemInstruction =
        customPrompt?.content || this.DEFAULT_SYSTEM_PROMPT;

      const categories = await this.categoriesService.findAll(orgId);
      const categoryNames = categories.map((c) => c.name).join(', ');

      // Obtener locales y puntos de encuentro de la organización para inyectar en el prompt
      const storeLocations = await this.prisma.storeLocation.findMany({
        where: { organizationId: orgId },
      });
      const localesText =
        storeLocations
          .map(
            (s) =>
              `- Ciudad: ${s.city} | Dirección: ${s.address} ${s.description ? '| Info: ' + s.description : ''}`,
          )
          .join('\n') || 'No contamos con tiendas físicas en este momento.';

      const meetingPoints = await this.prisma.meetingPoint.findMany({
        where: { organizationId: orgId },
      });
      const encuentrosText =
        meetingPoints
          .map(
            (m) =>
              `- Ciudad: ${m.city} | Lugar: ${m.name} | Dirección: ${m.address} | Horarios de entrega: ${m.schedule}`,
          )
          .join('\n') ||
        'No contamos con puntos de encuentro coordinados en este momento.';

      // Obtener plantillas activas para poder llamarlas desde el prompt (ej: {{Nota de venta}})
      const templates = await this.prisma.template.findMany({
        where: { organizationId: orgId, isActive: true },
      });

      const replacements: Record<string, string> = {
        '{{categorias}}': categoryNames || 'nuestro catálogo',
        '{{categories}}': categoryNames || 'our catalog',
        '{{productos}}':
          'Consulta el catálogo usando la herramienta "consultar_productos" cuando sea necesario.',
        '{{products}}':
          'Query the catalog using the "consultar_productos" tool when necessary.',
        '{{locales}}': localesText,
        '{{encuentros}}': encuentrosText,
      };

      // Mapear cada plantilla en replacements
      templates.forEach((t) => {
        // Mapeo exacto: {{Nota de venta}}
        replacements[`{{${t.name}}}`] = t.content;

        // Mapeo normalizado: {{nota_de_venta}}
        const snakeCaseName = t.name.toLowerCase().replace(/\s+/g, '_');
        replacements[`{{${snakeCaseName}}}`] = t.content;
      });

      for (const [key, value] of Object.entries(replacements)) {
        systemInstruction = (systemInstruction as any).replaceAll(key, value);
      }

      // 2. Historial Optimizado (take: 10 en lugar de 15 para ahorrar tokens)
      let recentMessages = await this.prisma.message.findMany({
        where: { contactId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
      recentMessages = recentMessages.reverse();

      const conversationHistory: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemInstruction },
        ...recentMessages.map((msg) => ({
          role: msg.isFromMe ? 'assistant' as const : 'user' as const,
          content: msg.body || '',
        })),
      ];

      if (
        !recentMessages.length ||
        recentMessages[recentMessages.length - 1].body !== latestMessageBody
      ) {
        conversationHistory.push({ role: 'user', content: latestMessageBody });
      }

      // 3. Definición de Herramientas (Sin listas gigantes de IDs)
      const tools: OpenAI.Chat.ChatCompletionTool[] = [
        {
          type: 'function',
          function: {
            name: 'consultar_productos',
            description:
              'Busca productos, precios y disponibilidad en el catálogo.',
            parameters: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description:
                    'Nombre del producto, subcategoría o categoría a buscar',
                },
              },
            },
          },
        },
        {
          type: 'function',
          function: {
            name: 'mostrar_imagen_producto',
            description: 'Envía la foto de un producto al cliente.',
            parameters: {
              type: 'object',
              properties: {
                productId: {
                  type: 'string',
                  description: 'ID único del producto',
                },
              },
              required: ['productId'],
            },
          },
        },
      ];

      // 4. Ciclo de resolución de herramientas
      const imageUrls: string[] = [];
      let finalReply = '';

      for (let i = 0; i < 3; i++) {
        // Máximo 3 interacciones para evitar bucles infinitos
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: conversationHistory,
          max_tokens: 500,
          temperature: 0.7,
          tools,
        });

        const message = completion.choices[0]?.message;

        if (!message?.tool_calls) {
          finalReply = message?.content || '';
          break;
        }

        // Procesar Tool Calls
        conversationHistory.push(message);
        for (const toolCall of message.tool_calls) {
          const tc = toolCall as any;
          const args = JSON.parse(tc.function.arguments);
          let result = '';

          if (tc.function.name === 'consultar_productos') {
            const products = await this.productsService.findAll(orgId, {
              search: args.query,
            });
            result =
              products
                .slice(0, 15)
                .map((p) => {
                  const template =
                    (p as any).cardDescription ||
                    `*🛍️ {{nombre}}*\n\n📝 {{descripcion}}\n\n💵 *Precio:* {{precio}} {{moneda}}\n\n¿Cuántos te gustaría adquirir?`;
                  const formattedCard = template
                    .replace(/{{nombre}}/gi, p.name)
                    .replace(/{{descripcion}}/gi, p.description || '')
                    .replace(/{{precio}}/gi, String(p.price))
                    .replace(/{{moneda}}/gi, p.currency)
                    .replace(/{{stock}}/gi, String(p.stock));

                  return `- ID: ${p.id} | ${p.name} | Precio: ${p.price} ${p.currency}\nPRESENTACIÓN DEL PRODUCTO (Envía este texto exacto al usuario):\n${formattedCard}\n[FOTO DEL PRODUCTO: ${(p as any).cardImageUrl || p.imageUrl || 'SIN FOTO'}]`;
                })
                .join('\n\n---\n\n') ||
              'No encontré productos con esos criterios.';
          } else if (tc.function.name === 'mostrar_imagen_producto') {
            const p = await this.prisma.product.findUnique({
              where: { id: args.productId },
            });
            const img = p ? (p as any).cardImageUrl || p.imageUrl : null;
            if (img) imageUrls.push(img);
            result = p
              ? `Foto de ${p.name} enviada.`
              : 'No encontré ese producto.';
          }

          conversationHistory.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: result,
          });
        }
      }

      return {
        text: finalReply || '¿En qué más puedo ayudarte?',
        imageUrls: [...new Set(imageUrls)],
      };
    } catch (error: any) {
      this.logger.error(
        `❌ Error en GptService: ${error.message}`,
        error.stack,
      );
      return {
        text: `Disculpa, tuve un problema técnico. Un agente te ayudará pronto.`,
        imageUrls: [],
      };
    }
  }
}
