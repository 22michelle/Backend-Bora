import { Router } from "express";
// import { verifyToken } from "../middleware/auth.js";
import transationCtrl from "../controllers/transactionController.js";

const router = new Router();

// Routes
router.post("/transaction",  transationCtrl.createTransaction);
router.get("/transactions", transationCtrl.getAllTransactions);

export default router;
