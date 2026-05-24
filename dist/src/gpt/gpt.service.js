"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
2. INTERÉS: Si mencionan una categoría o producto, utiliza la herramienta "consultar_productos" para ver las opciones disponibles y sus precios actuales.
3. FOTOS: Si el cliente pide ver la foto de un producto, usa la herramienta "mostrar_imagen_producto" con el ID obtenido en la consulta.

REGLAS DE ORO:
- NO menciones las palabras técnicas "Categoría" o "Subcategoría". Solo cita sus nombres.
- Mantén las respuestas breves, usa emojis y tono de WhatsApp.
- SOLO OFRECE LO QUE APARECE EN LOS RESULTADOS DE TUS HERRAMIENTAS.
- Si no encuentras un producto en la consulta, indica amablemente que no está disponible por ahora.
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
            const categoryNames = categories.map(c => c.name).join(', ');
            const storeLocations = await this.prisma.storeLocation.findMany({
                where: { organizationId: orgId }
            });
            const localesText = storeLocations.map(s => `- Ciudad: ${s.city} | Dirección: ${s.address} ${s.description ? '| Info: ' + s.description : ''}`).join('\n') || 'No contamos con tiendas físicas en este momento.';
            const meetingPoints = await this.prisma.meetingPoint.findMany({
                where: { organizationId: orgId }
            });
            const encuentrosText = meetingPoints.map(m => `- Ciudad: ${m.city} | Lugar: ${m.name} | Dirección: ${m.address} | Horarios de entrega: ${m.schedule}`).join('\n') || 'No contamos con puntos de encuentro coordinados en este momento.';
            const templates = await this.prisma.template.findMany({
                where: { organizationId: orgId, isActive: true }
            });
            const replacements = {
                '{{categorias}}': categoryNames || 'nuestro catálogo',
                '{{categories}}': categoryNames || 'our catalog',
                '{{productos}}': 'Consulta el catálogo usando la herramienta "consultar_productos" cuando sea necesario.',
                '{{products}}': 'Query the catalog using the "consultar_productos" tool when necessary.',
                '{{locales}}': localesText,
                '{{encuentros}}': encuentrosText
            };
            templates.forEach(t => {
                replacements[`{{${t.name}}}`] = t.content;
                const snakeCaseName = t.name.toLowerCase().replace(/\s+/g, '_');
                replacements[`{{${snakeCaseName}}}`] = t.content;
            });
            for (const [key, value] of Object.entries(replacements)) {
                systemInstruction = systemInstruction.replaceAll(key, value);
            }
            let recentMessages = await this.prisma.message.findMany({
                where: { contactId },
                orderBy: { createdAt: 'desc' },
                take: 10,
            });
            recentMessages = recentMessages.reverse();
            const conversationHistory = [
                { role: 'system', content: systemInstruction },
                ...recentMessages.map(msg => ({
                    role: (msg.isFromMe ? 'assistant' : 'user'),
                    content: msg.body || '',
                })),
            ];
            if (!recentMessages.length || recentMessages[recentMessages.length - 1].body !== latestMessageBody) {
                conversationHistory.push({ role: 'user', content: latestMessageBody });
            }
            const tools = [
                {
                    type: 'function',
                    function: {
                        name: 'consultar_productos',
                        description: 'Busca productos, precios y disponibilidad en el catálogo.',
                        parameters: {
                            type: 'object',
                            properties: {
                                query: { type: 'string', description: 'Nombre del producto, subcategoría o categoría a buscar' }
                            }
                        }
                    }
                },
                {
                    type: 'function',
                    function: {
                        name: 'mostrar_imagen_producto',
                        description: 'Envía la foto de un producto al cliente.',
                        parameters: {
                            type: 'object',
                            properties: {
                                productId: { type: 'string', description: 'ID único del producto' }
                            },
                            required: ['productId']
                        }
                    }
                }
            ];
            let imageUrls = [];
            let finalReply = '';
            for (let i = 0; i < 3; i++) {
                const completion = await openai.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: conversationHistory,
                    max_tokens: 500,
                    temperature: 0.7,
                    tools
                });
                const message = completion.choices[0]?.message;
                if (!message?.tool_calls) {
                    finalReply = message?.content || '';
                    break;
                }
                conversationHistory.push(message);
                for (const toolCall of message.tool_calls) {
                    const tc = toolCall;
                    const args = JSON.parse(tc.function.arguments);
                    let result = '';
                    if (tc.function.name === 'consultar_productos') {
                        const products = await this.productsService.findAll(orgId, { search: args.query });
                        result = products.slice(0, 15).map(p => {
                            const template = p.cardDescription || `*🛍️ {{nombre}}*\n\n📝 {{descripcion}}\n\n💵 *Precio:* {{precio}} {{moneda}}\n\n¿Cuántos te gustaría adquirir?`;
                            const formattedCard = template
                                .replace(/{{nombre}}/gi, p.name)
                                .replace(/{{descripcion}}/gi, p.description || '')
                                .replace(/{{precio}}/gi, String(p.price))
                                .replace(/{{moneda}}/gi, p.currency)
                                .replace(/{{stock}}/gi, String(p.stock));
                            return `- ID: ${p.id} | ${p.name} | Precio: ${p.price} ${p.currency}\nPRESENTACIÓN DEL PRODUCTO (Envía este texto exacto al usuario):\n${formattedCard}\n[FOTO DEL PRODUCTO: ${p.cardImageUrl || p.imageUrl || 'SIN FOTO'}]`;
                        }).join('\n\n---\n\n') || 'No encontré productos con esos criterios.';
                    }
                    else if (tc.function.name === 'mostrar_imagen_producto') {
                        const p = await this.prisma.product.findUnique({ where: { id: args.productId } });
                        const img = p ? (p.cardImageUrl || p.imageUrl) : null;
                        if (img)
                            imageUrls.push(img);
                        result = p ? `Foto de ${p.name} enviada.` : 'No encontré ese producto.';
                    }
                    conversationHistory.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        content: result
                    });
                }
            }
            return {
                text: finalReply || '¿En qué más puedo ayudarte?',
                imageUrls: [...new Set(imageUrls)]
            };
        }
        catch (error) {
            this.logger.error(`❌ Error en GptService: ${error.message}`, error.stack);
            return {
                text: `Disculpa, tuve un problema técnico. Un agente te ayudará pronto.`,
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