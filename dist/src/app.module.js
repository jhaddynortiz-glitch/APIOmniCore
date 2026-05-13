"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const path_1 = require("path");
const common_1 = require("@nestjs/common");
const serve_static_1 = require("@nestjs/serve-static");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const whatsapp_module_1 = require("./whatsapp/whatsapp.module");
const prisma_module_1 = require("./prisma/prisma.module");
const websockets_module_1 = require("./websockets/websockets.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const products_module_1 = require("./products/products.module");
const prompts_module_1 = require("./prompts/prompts.module");
const categories_module_1 = require("./categories/categories.module");
const subcategories_module_1 = require("./subcategories/subcategories.module");
const organizations_module_1 = require("./organizations/organizations.module");
const upload_controller_1 = require("./upload/upload.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            whatsapp_module_1.WhatsappModule,
            prisma_module_1.PrismaModule,
            websockets_module_1.WebsocketsModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            products_module_1.ProductsModule,
            prompts_module_1.PromptsModule,
            categories_module_1.CategoriesModule,
            subcategories_module_1.SubcategoriesModule,
            organizations_module_1.OrganizationsModule,
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(process.cwd(), 'public'),
            }),
        ],
        controllers: [app_controller_1.AppController, upload_controller_1.UploadController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map