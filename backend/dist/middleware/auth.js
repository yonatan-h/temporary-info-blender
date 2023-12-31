"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserFromToken = exports.getTokenFromRequest = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = require("mongoose");
const user_model_1 = __importDefault(require("../models/user.model"));
const auth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = getTokenFromRequest(req);
        if (!token)
            return res.status(401).json({ message: "Unauthorized" });
        const existingUser = yield getUserFromToken(token);
        if (!existingUser)
            return res.status(401).json({ message: "Unauthorized" });
        res.locals.user = existingUser;
        next();
    }
    catch (error) {
        return res.status(401).json({ message: "Unauthorized" });
    }
});
function getTokenFromRequest(req) {
    try {
        const token = req.headers.authorization.split(" ")[1];
        return token;
    }
    catch (error) {
        return undefined;
    }
}
exports.getTokenFromRequest = getTokenFromRequest;
function getUserFromToken(token) {
    return __awaiter(this, void 0, void 0, function* () {
        const { _id } = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userId = new mongoose_1.Types.ObjectId(_id);
        const existingUser = yield user_model_1.default.findById(userId);
        return existingUser;
    });
}
exports.getUserFromToken = getUserFromToken;
exports.default = auth;
