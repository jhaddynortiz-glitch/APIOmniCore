import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';

import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class GptService {
  private readonly logger = new Logger(GptService.name);
  private openai: OpenAI;

  // Prompt del sistema: define la personalidad y reglas del bot
  private readonly SYSTEM_PROMPT = `
Eres un asistente de ventas por WhatsApp. Tu objetivo es ayudar a los clientes a comprar productos de forma clara, amable y eficiente.

Reglas importantes:

* SOLO puedes ofrecer estos productos:

  * Magnesio 100g: 100 Bs
  * Magnesio 150mg: 130 Bs
* NO inventes productos, precios ni información adicional.
* Responde siempre en español, a menos que el cliente pida explícitamente inglés.
* Usa un tono amigable, cercano y profesional.
* Las respuestas deben ser breves, claras y naturales, como mensajes de WhatsApp.

Flujo de venta obligatorio:

1. Saluda y ofrece los productos disponibles con sus precios.
2. Cuando el cliente elija un producto, confirma su elección.
3. Luego pregunta:
   “¿Prefieres entrega a domicilio o recoger en punto de la ciudad?”
4. Si elige punto de la ciudad, indica:
   “La entrega es frente a las oficinas de correos en la calle Ayacucho, Cochabamba.”
5. Si elige entrega a domicilio:

   * Pide su ubicación.
   * Indica que verificarás si está dentro del área de cobertura.
6. Una vez confirmada la entrega (domicilio o punto), cierra la venta de forma cordial.

Ejemplo de cierre:
“Perfecto 😊 Tu pedido está confirmado. Gracias por tu compra, cualquier consulta estoy aquí para ayudarte.”

Nunca salgas de este flujo y mantén siempre respuestas concisas.
`.trim();

  constructor(private readonly prisma: PrismaService) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || apiKey === 'PEGA_TU_API_KEY_AQUI') {
      this.logger.warn('⚠️ OPENAI_API_KEY no configurada. El bot de IA no funcionará.');
    } else {
      this.logger.log(`✅ OpenAI configurado (key: ${apiKey.substring(0, 8)}...)`);
    }

    this.openai = new OpenAI({ apiKey: apiKey || '' });
  }

  /**
   * Genera una respuesta de ChatGPT basada en el historial reciente de un contacto.
   * @param contactId - ID del contacto en la BD
   * @param latestMessageBody - El texto del último mensaje recibido del cliente
   * @returns La respuesta generada por GPT
   */
  async generateReply(contactId: string, latestMessageBody: string): Promise<string> {
    try {
      // 1. Obtener los últimos 15 mensajes del historial para dar contexto
      const recentMessages = await this.prisma.message.findMany({
        where: { contactId },
        orderBy: { createdAt: 'asc' },
        take: 15,
      });

      // 2. Construir el array de mensajes para la API de OpenAI
      const conversationHistory: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: this.SYSTEM_PROMPT },
      ];

      // Mapear mensajes de la BD al formato de OpenAI
      for (const msg of recentMessages) {
        conversationHistory.push({
          role: msg.isFromMe ? 'assistant' : 'user',
          content: msg.body || '',
        });
      }

      // 3. Si el último mensaje de la BD no es el que acabamos de recibir (porque aún no se guardó),
      //    lo agregamos manualmente para que GPT lo vea.
      const lastInHistory = recentMessages[recentMessages.length - 1];
      if (!lastInHistory || lastInHistory.body !== latestMessageBody) {
        conversationHistory.push({
          role: 'user',
          content: latestMessageBody,
        });
      }

      this.logger.log(`🤖 Enviando ${conversationHistory.length} mensajes a OpenAI para contacto ${contactId}`);

      // 4. Llamar a la API de OpenAI
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: conversationHistory,
        max_tokens: 300,
        temperature: 0.7,
      });

      const reply = completion.choices[0]?.message?.content?.trim();

      if (!reply) {
        this.logger.warn('OpenAI devolvió una respuesta vacía');
        return 'Disculpa, no pude procesar tu mensaje. Un agente te atenderá pronto.';
      }

      this.logger.log(`✅ Respuesta de GPT generada (${reply.length} chars)`);
      return reply;

    } catch (error: any) {
      // Log detallado para depuración
      this.logger.error(`❌ Error llamando a OpenAI:`);
      this.logger.error(`   Status: ${error.status || 'N/A'}`);
      this.logger.error(`   Message: ${error.message}`);
      if (error.error) {
        this.logger.error(`   OpenAI Error: ${JSON.stringify(error.error)}`);
      }
      return 'Lo siento, tuve un problema técnico. Un agente humano te ayudará en breve.';
    }
  }
}

