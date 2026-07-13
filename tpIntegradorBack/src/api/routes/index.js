/*=========================
    Archivo de barril
==========================*/

// Contiene todas las rutas, la importa, las centraliza aca y las exporta con un nombre
import authRoutes from "./auth.routes.js";
import productRoutes from "./product.routes.js";
import viewRoutes from "./view.routes.js";
import userRoutes from "./user.routes.js";
import salesRoutes from "./sales.routes.js"; // IMPORTÁS TU NUEVA RUTA AQUÍ

export {
    authRoutes,
    productRoutes,
    viewRoutes,
    userRoutes,
    salesRoutes // EXPORTÁS TU NUEVA RUTA AQUÍ
};