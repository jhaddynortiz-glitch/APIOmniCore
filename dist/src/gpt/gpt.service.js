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
const products_service_1 = require("../products/products.service");
const prompts_service_1 = require("../prompts/prompts.service");
const categories_service_1 = require("../categories/categories.service");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
let GptService = GptService_1 = class GptService {
    prisma;
    productsService;
    promptsService;
    categoriesService;
    logger = new common_1.Logger(GptService_1.name);
    DEFAULT_SYSTEM_PROMPT = `
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
    constructor(prisma, productsService, promptsService, categoriesService) {
        this.prisma = prisma;
        this.productsService = productsService;
        this.promptsService = promptsService;
        this.categoriesService = categoriesService;
    }
    async generateReply(contactId, latestMessageBody, apiKey, orgId) {
        try {
            if (!apiKey) {
                this.logger.error('❌ No se proporcionó API Key de OpenAI.');
                return { text: 'Disculpa, no pude procesar tu mensaje. Un agente te atenderá pronto.', imageUrls: [] };
            }
            const openai = new openai_1.default({ apiKey: apiKey.trim() });
            const customPrompt = await this.promptsService.getActivePrompt(orgId);
            let systemInstruction = customPrompt?.content || this.DEFAULT_SYSTEM_PROMPT;
            const categories = await this.categoriesService.findAll(orgId);
            const allActiveProducts = await this.productsService.findAllActiveForGpt(orgId);
            const subcategories = await this.prisma.subcategory.findMany({ where: { organizationId: orgId } });
            let catalogTree = '';
            const categoryNames = categories.map(c => c.name).join(', ');
            const subcategoryNames = subcategories.map(s => s.name).join(', ');
            if (categories.length === 0) {
                catalogTree = 'No hay categorías configuradas aún.';
            }
            else {
                for (const cat of categories) {
                    catalogTree += `\n* CATEGORÍA: ${cat.name}\n`;
                    const catProducts = allActiveProducts.filter(p => p.Subcategory?.categoryId === cat.id);
                    const subMap = new Map();
                    for (const p of catProducts) {
                        const subName = p.Subcategory?.name || 'Otros';
                        if (!subMap.has(subName))
                            subMap.set(subName, []);
                        subMap.get(subName)?.push(p);
                    }
                    if (subMap.size === 0) {
                        catalogTree += `  (Próximamente productos en esta categoría)\n`;
                    }
                    else {
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
            const replacements = {
                '{{productos}}': catalogTree.trim(),
                '{{products}}': catalogTree.trim(),
                '{{categorias}}': categoryNames || 'Ninguna',
                '{{categories}}': categoryNames || 'None',
                '{{subcategorias}}': subcategoryNames || 'Ninguna',
                '{{subcategories}}': subcategoryNames || 'None'
            };
            for (const [key, value] of Object.entries(replacements)) {
                systemInstruction = systemInstruction.replaceAll(key, value);
            }
            const recentMessages = await this.prisma.message.findMany({
                where: { contactId },
                orderBy: { createdAt: 'asc' },
                take: 15,
            });
            const conversationHistory = [
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
            const productsWithImages = allActiveProducts.filter(p => !!p.imageUrl);
            const idDescriptions = productsWithImages
                .map(p => `"${p.id}" = ${p.name}`)
                .join(', ');
            const validIds = productsWithImages.map(p => p.id);
            this.logger.log(`📸 Productos con foto disponibles: ${validIds.length}`);
            for (const p of productsWithImages) {
                this.logger.log(`  ✅ ${p.name} → ${p.id}`);
            }
            const tools = validIds.length > 0 ? [
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
            if (validIds.length > 0) {
                conversationHistory.push({
                    role: 'system',
                    content: `Cuando el cliente pida ver la foto de un producto, usa la herramienta "mostrar_imagen_producto". Responde siempre con texto amigable además de usar la herramienta.`
                });
            }
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: conversationHistory,
                max_tokens: 500,
                temperature: 0.7,
                ...(tools.length > 0 ? { tools } : {})
            });
            const message = completion.choices[0]?.message;
            const imageUrls = [];
            if (message?.tool_calls) {
                for (const toolCall of message.tool_calls) {
                    const tc = toolCall;
                    if (tc.function?.name === 'mostrar_imagen_producto') {
                        const { productId } = JSON.parse(tc.function.arguments);
                        const product = await this.prisma.product.findUnique({ where: { id: productId } });
                        if (product?.imageUrl) {
                            imageUrls.push(product.imageUrl);
                        }
                    }
                }
            }
            let replyText = completion.choices[0]?.message?.content?.trim();
            if (!replyText && imageUrls.length > 0) {
                replyText = '¡Claro! Aquí tienes la foto:';
            }
            return {
                text: replyText || 'Un agente te ayudará pronto.',
                imageUrls
            };
        }
        catch (error) {
            this.logger.error(`❌ Error en GptService: ${error.message}`, error.stack);
            return {
                text: `Error técnico: ${error.message}. Por favor contacta a soporte.`,
                imageUrls: []
            };
        }
    }
};
exports.GptService = GptService;
exports.GptService = GptService = GptService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        products_service_1.ProductsService,
        prompts_service_1.PromptsService,
        categories_service_1.CategoriesService])
], GptService);
//# sourceMappingURL=gpt.service.js.map