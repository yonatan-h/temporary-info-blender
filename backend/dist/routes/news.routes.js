"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const news_controller_1 = require("../controllers/news.controller");
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../middleware/auth"));
const newsRouter = express_1.default.Router();
// auth middleware to authenticated the user
newsRouter.use(auth_1.default);
newsRouter.get("/", news_controller_1.newsController.getCuratedEvents);
newsRouter.get("/search", news_controller_1.newsController.searchEventsByTopic);
newsRouter.post("/compare", news_controller_1.newsController.compareArticles);
newsRouter.get("/:id", news_controller_1.newsController.getEventDetail);
newsRouter.get("/articles/:id", news_controller_1.newsController.getArticlesForEvent);
exports.default = newsRouter;
