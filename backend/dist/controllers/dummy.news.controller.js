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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DummyNewsController = void 0;
const fixtures_barrel_1 = require("../utils/fixtures/fixtures_barrel");
const articlesList_1 = require("../utils/fixtures/articlesList");
class DummyNewsController {
    static getCuratedEvents(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.status(200).json(fixtures_barrel_1.curatedEventsList);
        });
    }
    static searchEventsByTopic(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const topic = req.query.q;
            const events = [...fixtures_barrel_1.curatedEventsList.events];
            //shuffle
            for (let i = events.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [events[i], events[j]] = [events[j], events[i]];
            }
            res.status(200).json({ events,
                "message": "Successfull searched topic",
                "query": topic
            });
        });
    }
    static getEventDetail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.status(200).json(fixtures_barrel_1.eventDetail);
        });
    }
    static compareArticles(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { article1, article2 } = req.body;
                if (!article1 || !article2) {
                    res.status(400).json({
                        "message": "Please provide two articles to compare."
                    });
                    return;
                }
                res.status(200).json(fixtures_barrel_1.articlesComparision);
            }
            catch (error) {
                res.status(500).json({ "message": "Some thing went wrong while comparing articles." });
            }
        });
    }
    static getArticlesForEvent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const eventUri = req.query.eventUri;
                res.status(200).json(articlesList_1.articlesList);
            }
            catch (error) {
                res.status(500).json({ "message": "Some thing went wrong while getting event detail." });
            }
        });
    }
}
exports.DummyNewsController = DummyNewsController;
