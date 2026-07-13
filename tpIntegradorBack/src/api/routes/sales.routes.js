import express from "express";
import { crearVenta } from "../controllers/sales.controller.js";

const router = express.Router();

// Cuando llegue un POST a /api/sales, se ejecuta el controlador crearVenta
router.post("/", crearVenta);

export default router;