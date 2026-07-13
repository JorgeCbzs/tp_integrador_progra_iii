import connection from "../database/db.js";

export const crearVenta = async (req, res) => {
    try {
        const { client_name, total, sale_date, productos } = req.body;

        if (!client_name || !total) {
            return res.status(400).json({ message: "Faltan datos (client_name, total)" });
        }

        const querySales = "INSERT INTO sales (client_name, total, sale_date) VALUES (?, ?, ?)";
        
        const [result] = await connection.query(querySales, [client_name, total, sale_date]);
        
        console.log("Venta insertada correctamente. ID generado:", result.insertId);

        res.status(201).json({ 
            message: "Venta registrada con éxito",
            saleId: result.insertId 
        });

    } catch (error) {
        console.error("Error al insertar en la BBDD:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};