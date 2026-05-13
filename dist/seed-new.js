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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const bcrypt = __importStar(require("bcrypt"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const connectionString = process.env.DATABASE_URL;
const pool = new pg_1.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('🌱 Iniciando la carga de datos (Seeding)...');
    const email = 'jhaddynortiz@gmail.com';
    const plainPassword = 'Test12345';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            globalRole: 'SUPER_ADMIN',
            password: hashedPassword
        },
        create: {
            email,
            password: hashedPassword,
            fullName: 'Jhaddyn Ortiz',
            globalRole: 'SUPER_ADMIN'
        },
    });
    console.log('✅ Usuario Super Admin creado:', user.email);
    const orizon = await prisma.organization.upsert({
        where: { slug: 'orizon' },
        update: { name: 'Orizon' },
        create: {
            id: 'orizon-id',
            name: 'Orizon',
            slug: 'orizon',
        },
    });
    console.log('✅ Organización creada:', orizon.name);
    const polivitaminas = await prisma.organization.upsert({
        where: { slug: 'polivitaminas' },
        update: { name: 'PoliVitaminas' },
        create: {
            id: 'polivitaminas-id',
            name: 'PoliVitaminas',
            slug: 'polivitaminas',
        },
    });
    console.log('✅ Organización creada:', polivitaminas.name);
    await prisma.userOrganization.upsert({
        where: { userId_organizationId: { userId: user.id, organizationId: orizon.id } },
        update: { role: 'admin', status: 'active' },
        create: { userId: user.id, organizationId: orizon.id, role: 'admin', status: 'active' },
    });
    await prisma.userOrganization.upsert({
        where: { userId_organizationId: { userId: user.id, organizationId: polivitaminas.id } },
        update: { role: 'admin', status: 'active' },
        create: { userId: user.id, organizationId: polivitaminas.id, role: 'admin', status: 'active' },
    });
    console.log('🎉 ¡Datos insertados correctamente!');
}
main()
    .catch((e) => {
    console.error('❌ Error al insertar datos:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
});
//# sourceMappingURL=seed-new.js.map