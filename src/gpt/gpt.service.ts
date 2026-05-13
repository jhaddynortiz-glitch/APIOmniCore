import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import { PromptsService } from '../prompts/prompts.service';
import { CategoriesService } from '../categories/categories.service';
import { decrypt } from '../common/utils/crypto.util';
import * as fs from 'fs';
import * as path from 'path';

import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class GptService {
  private readonly logger = new Logger(GptService.name);

  private readonly DEFAULT_SYSTEM_PROMPT = `
Eres un asistente de ventas experto y amable. Tu objetivo es guiar al cliente por nuestro catálogo de forma progresiva y natural.

 FLUJO DE CONVERSACIÓN:
1. INICIO: Saluda y pregunta qué tipo de productos buscan, citando las CATEGORÍAS disponibles.
2. INTERÉS EN CATEGORÍA: Si mencionan una categoría, lista las SUBCATEGORÍAS que pertenecen a ella para ayudarles a filtrar.
3. INTERÉS EN SUBCATEGORÍA: Si mencionan una subcategoría, muestra el listado de PRODUCTOS disponibles con sus precios.
4. SALTO DIRECTO: Si el cliente pregunta directamente por un producto o subcategoría, responde directamente con la información, sin forzar los pasos previos.

REGLAS DE ORO:
- NO menciones las palabras técnicas "Categoría" o "Subcategoría" al cliente. Solo cita sus nombres (ej: "Tenemos productos capilares y electrodomésticos" en lugar de "Nuestras categorías son...").
- Mantén las respuestas breves, usa emojis y tono de WhatsApp.
- SOLO OFRECE LO QUE APARECE EN EL LISTADO DE ABAJO.
- ENVÍO DE FOTOS (CRÍTICO): Si mencionas un producto que tiene [IMAGEN DISPONIBLE], DEBES copiar exactamente su TAG_DE_IMAGEN al final de tu mensaje. 
- EJEMPLO: Si el catálogo dice "TAG_DE_IMAGEN: [ID: 123-abc]", tú debes escribir "[ID: 123-abc]" al final. 
- NUNCA escribas "[ID: uuid-del-producto]", usa siempre el código alfanumérico real del catálogo.
- Si el cliente te pide una foto y no hay imagen disponible, explica amablemente que no tienes la foto en este momento.


INSTRUCIONES / CATÁLOGO (Uso interno para ti):
{{productos}}
`.trim();

  constructor(
    private readonly prisma: PrismaService,
    private readonly productsService: ProductsService,
    private readonly promptsService: PromptsService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async generateReply(contactId: string, latestMessageBody: string, apiKey: string, orgId: string): Promise<{ text: string, imageUrls: string[] }> {
    try {
      if (!apiKey) {
        this.logger.error('❌ No se proporcionó API Key de OpenAI.');
        return { text: 'Disculpa, no pude procesar tu mensaje. Un agente te atenderá pronto.', imageUrls: [] };
      }

      const openai = new OpenAI({ apiKey: apiKey.trim() });

      // 1. Obtener el prompt activo
      const customPrompt = await this.promptsService.getActivePrompt(orgId);
      let systemInstruction = customPrompt?.content || this.DEFAULT_SYSTEM_PROMPT;

      // 2. Construir catálogo jerárquico y listas simples
      const categories = await this.categoriesService.findAll(orgId);
      const allActiveProducts = await this.productsService.findAllActiveForGpt(orgId);
      const subcategories = await this.prisma.subcategory.findMany({ where: { organizationId: orgId } });

      let catalogTree = '';
      const categoryNames = categories.map(c => c.name).join(', ');
      const subcategoryNames = subcategories.map(s => s.name).join(', ');

      if (categories.length === 0) {
        catalogTree = 'No hay categorías configuradas aún.';
      } else {
        for (const cat of categories) {
          catalogTree += `\n* CATEGORÍA: ${cat.name}\n`;
          const catProducts = allActiveProducts.filter(p => p.Subcategory?.categoryId === cat.id);
          const subMap = new Map<string, any[]>();
          for (const p of catProducts) {
            const subName = p.Subcategory?.name || 'Otros';
            if (!subMap.has(subName)) subMap.set(subName, []);
            subMap.get(subName)?.push(p);
          }

          if (subMap.size === 0) {
            catalogTree += `  (Próximamente productos en esta categoría)\n`;
          } else {
            for (const [subName, products] of subMap.entries()) {
              catalogTree += `  - SUBCATEGORÍA: ${subName}\n`;
              for (const p of products) {
                const imgStatus = !!p.imageUrl ? '[FOTO_DISPONIBLE]' : '[SIN_FOTO]';
                catalogTree += `    ● PRODUCTO: ${p.name} | PRECIO: ${p.price} ${p.currency} | (ID: ${p.id}) | ${imgStatus}\n`;
              }
            }
          }
        }
      }

      // 3. Inyectar en el prompt (Soporte para múltiples keys y en Inglés/Español)
      const replacements: Record<string, string> = {
        '{{productos}}': catalogTree.trim(),
        '{{products}}': catalogTree.trim(),
        '{{categorias}}': categoryNames || 'Ninguna',
        '{{categories}}': categoryNames || 'None',
        '{{subcategorias}}': subcategoryNames || 'Ninguna',
        '{{subcategories}}': subcategoryNames || 'None'
      };

      for (const [key, value] of Object.entries(replacements)) {
        systemInstruction = (systemInstruction as any).replaceAll(key, value);
      }

      // 4. Obtener historial
      const recentMessages = await this.prisma.message.findMany({
        where: { contactId },
        orderBy: { createdAt: 'asc' },
        take: 15,
      });

      const conversationHistory: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemInstruction },
      ];

      for (const msg of recentMessages) {
        conversationHistory.push({
          role: msg.isFromMe ? 'assistant' : 'user',
          content: msg.body || '',
        });
      }

      const lastInHistory = recentMessages[recentMessages.length - 1];
      if (!lastInHistory || lastInHistory.body !== latestMessageBody) {
        conversationHistory.push({ role: 'user', content: latestMessageBody });
      }

      // 5. Construir herramientas dinámicas con IDs REALES de la DB
      const productsWithImages = allActiveProducts.filter(p => !!p.imageUrl);
      
      // Mapeo de IDs reales para la descripción de la herramienta
      const idDescriptions = productsWithImages
        .map(p => `"${p.id}" = ${p.name}`)
        .join(', ');
      
      const validIds = productsWithImages.map(p => p.id);
      
      this.logger.log(`📸 Productos con foto disponibles: ${validIds.length}`);
      for (const p of productsWithImages) {
        this.logger.log(`  ✅ ${p.name} → ${p.id}`);
      }

      // Solo incluir la herramienta si hay productos con fotos
      const tools: any[] = validIds.length > 0 ? [
        {
          type: 'function',
          function: {
            name: 'mostrar_imagen_producto',
            description: `Envía la foto de un producto al cliente. Los productos disponibles son: ${idDescriptions}`,
            parameters: {
              type: 'object',
              properties: {
                productId: { 
                  type: 'string', 
                  enum: validIds,
                  description: `ID del producto. Valores válidos: ${idDescriptions}`
                }
              },
              required: ['productId']
            }
          }
        }
      ] : [];

      // Instrucción final
      if (validIds.length > 0) {
        conversationHistory.push({ 
          role: 'system', 
          content: `Cuando el cliente pida ver la foto de un producto, usa la herramienta "mostrar_imagen_producto". Responde siempre con texto amigable además de usar la herramienta.` 
        });
      }

      // 6. Llamar a OpenAI con Herramientas
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: conversationHistory,
        max_tokens: 500,
        temperature: 0.7,
        ...(tools.length > 0 ? { tools } : {})
      });

      const message = completion.choices[0]?.message;
      const imageUrls: string[] = [];
      // Procesar llamadas a herramientas
      if (message?.tool_calls) {
        for (const toolCall of message.tool_calls) {
          const tc = toolCall as any;
          if (tc.function?.name === 'mostrar_imagen_producto') {
            const { productId } = JSON.parse(tc.function.arguments);
            const product = await this.prisma.product.findUnique({ where: { id: productId } });
            
            if (product?.imageUrl) {
              imageUrls.push(product.imageUrl);
            }
          }
        }
      }

      // 7. Determinar el texto de respuesta
      let replyText = completion.choices[0]?.message?.content?.trim();
      
      if (!replyText && imageUrls.length > 0) {
        replyText = '¡Claro! Aquí tienes la foto:';
      }

      return {
        text: replyText || 'Un agente te ayudará pronto.',
        imageUrls
      };

    } catch (error: any) {
      this.logger.error(`❌ Error en GptService: ${error.message}`, error.stack);
      return { 
        text: `Error técnico: ${error.message}. Por favor contacta a soporte.`, 
        imageUrls: [] 
      };
    }
  }
}
