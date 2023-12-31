"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const userRouter = express_1.default.Router();
userRouter.post("/register", user_controller_1.userControllers.register);
userRouter.post("/login", user_controller_1.userControllers.login);
userRouter.post("/sendcode", user_controller_1.userControllers.sendCode);
userRouter.post("/verifyemail", user_controller_1.userControllers.verifyEmail);
userRouter.get("/getme", user_controller_1.userControllers.getUser);
userRouter.patch("/", user_controller_1.userControllers.updateUser);
userRouter.delete("/", user_controller_1.userControllers.deleteUser);
userRouter.get("/categories", user_controller_1.userControllers.getCategories);
exports.default = userRouter;
