"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var GptService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GptService = void 0;
const common_1 = require("@nestjs/common");
const openai_1 = __importDefault(require("openai"));
const prisma_service_1 = require("../prisma/prisma.service");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
let GptService = GptService_1 = class GptService {
    prisma;
    logger = new common_1.Logger(GptService_1.name);
    openai;
    SYSTEM_PROMPT = `
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
    constructor(prisma) {
        this.prisma = prisma;
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey || apiKey === 'PEGA_TU_API_KEY_AQUI') {
            this.logger.warn('⚠️ OPENAI_API_KEY no configurada. El bot de IA no funcionará.');
        }
        else {
            this.logger.log(`✅ OpenAI configurado (key: ${apiKey.substring(0, 8)}...)`);
        }
        this.openai = new openai_1.default({ apiKey: apiKey || '' });
    }
    async generateReply(contactId, latestMessageBody) {
        try {
            const recentMessages = await this.prisma.message.findMany({
                where: { contactId },
                orderBy: { createdAt: 'asc' },
                take: 15,
            });
            const conversationHistory = [
                { role: 'system', content: this.SYSTEM_PROMPT },
            ];
            for (const msg of recentMessages) {
                conversationHistory.push({
                    role: msg.isFromMe ? 'assistant' : 'user',
                    content: msg.body || '',
                });
            }
            const lastInHistory = recentMessages[recentMessages.length - 1];
            if (!lastInHistory || lastInHistory.body !== latestMessageBody) {
                conversationHistory.push({
                    role: 'user',
                    content: latestMessageBody,
                });
            }
            this.logger.log(`🤖 Enviando ${conversationHistory.length} mensajes a OpenAI para contacto ${contactId}`);
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
        }
        catch (error) {
            this.logger.error(`❌ Error llamando a OpenAI:`);
            this.logger.error(`   Status: ${error.status || 'N/A'}`);
            this.logger.error(`   Message: ${error.message}`);
            if (error.error) {
                this.logger.error(`   OpenAI Error: ${JSON.stringify(error.error)}`);
            }
            return 'Lo siento, tuve un problema técnico. Un agente humano te ayudará en breve.';
        }
    }
};
exports.GptService = GptService;
exports.GptService = GptService = GptService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GptService);
//# sourceMappingURL=gpt.service.js.map