import { Router } from "express";
// import { verifyToken } from "../middleware/auth.js";
import transactionCtrl from "../controllers/transactionController.js";

const router = new Router();

// Routes
router.post("/transaction",  transactionCtrl.createTransaction);
router.get('/history/:userId', transactionCtrl.getTransactionHistory);
router.post("/deposit",  transactionCtrl.depositMoney);
router.post("/withdraw",  transactionCtrl.withdrawMoney);
router.get("/transactions", transactionCtrl.getAllTransactions);
router.get("/:transactionId", transactionCtrl.getTransactionById);

export default router;