"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dummy_news_controller_1 = require("../controllers/dummy.news.controller");
const express_1 = __importDefault(require("express"));
const dummyNewsRouter = express_1.default.Router();
dummyNewsRouter.get("/", dummy_news_controller_1.DummyNewsController.getCuratedEvents);
dummyNewsRouter.get("/search", dummy_news_controller_1.DummyNewsController.searchEventsByTopic);
dummyNewsRouter.post("/compare", dummy_news_controller_1.DummyNewsController.compareArticles);
dummyNewsRouter.get("/:id", dummy_news_controller_1.DummyNewsController.getEventDetail);
dummyNewsRouter.get("/articles/:id", dummy_news_controller_1.DummyNewsController.getArticlesForEvent);
exports.default = dummyNewsRouter;
