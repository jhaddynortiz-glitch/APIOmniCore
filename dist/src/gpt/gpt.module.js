"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GptModule = void 0;
const common_1 = require("@nestjs/common");
const gpt_service_1 = require("./gpt.service");
const prisma_module_1 = require("../prisma/prisma.module");
const products_module_1 = require("../products/products.module");
const prompts_module_1 = require("../prompts/prompts.module");
const categories_module_1 = require("../categories/categories.module");
let GptModule = class GptModule {
};
exports.GptModule = GptModule;
exports.GptModule = GptModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, products_module_1.ProductsModule, prompts_module_1.PromptsModule, categories_module_1.CategoriesModule],
        providers: [gpt_service_1.GptService],
        exports: [gpt_service_1.GptService],
    })
], GptModule);
//# sourceMappingURL=gpt.module.js.map