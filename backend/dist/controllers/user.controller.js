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
exports.userControllers = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const unverifiedUserEmail_model_1 = __importDefault(require("../models/unverifiedUserEmail.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const validator_1 = __importDefault(require("validator"));
const custom_validators_1 = require("../utils/validations/custom_validators");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = require("../middleware/auth");
const constants_1 = require("../utils/constants");
const mail_helper_1 = require("../utils/email/mail-helper");
const confirmEmailTemplates_1 = require("../utils/email/confirmEmailTemplates");
const random_number_generator_1 = __importDefault(require("../utils/random-number-generator"));
/**
 *
 * A class to handle all user related controllers
 */
class userControllers {
    static sendCode(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                if (!validator_1.default.isEmail(email)) {
                    res.status(400).json({ message: "Please enter a valid email" });
                    return;
                }
                const existingUser = yield user_model_1.default.findOne({ email });
                const verificationCode = (0, random_number_generator_1.default)();
                if (existingUser) {
                    res.status(400).json({ message: "User by that email already exists" });
                    return;
                }
                const existingUnverifiedUser = yield unverifiedUserEmail_model_1.default.findOne({ email });
                if (existingUnverifiedUser) {
                    // update the verification code for the existing unverified user email
                    existingUnverifiedUser.verificationCode = verificationCode;
                    yield existingUnverifiedUser.save();
                }
                else {
                    // create a new unverified user email
                    const newUnverifiedUser = new unverifiedUserEmail_model_1.default({ email, verificationCode });
                    yield newUnverifiedUser.save();
                }
                yield (0, mail_helper_1.sendEmail)(email, "Verification Code", (0, confirmEmailTemplates_1.confirmEmailTemplate)(verificationCode));
                res.status(200).json({ message: "Verification code sent successfully. Please check your email." });
            }
            catch (error) {
                console.log(error);
                res.status(500).json({ message: "Something went wrong while sending verification code." });
            }
        });
    }
    /**
     *
     * @param req
     * @param res
     * @returns a signed registration token from the email if the verification code is correct.
     */
    static verifyEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, verificationCode } = req.body;
                if (!email || !verificationCode) {
                    res.status(400).json({ message: "Please fill in all fields" });
                    return;
                }
                const existingUnverifiedUser = yield unverifiedUserEmail_model_1.default.findOne({ email });
                if (!existingUnverifiedUser) {
                    res.status(400).json({ message: "User by that email does not exist" });
                    return;
                }
                // check if the code has expired or not
                const timeElapsed = Date.now() - existingUnverifiedUser.updatedAt.getTime();
                const timeElapsedInMinutes = Math.floor(timeElapsed / 1000 / 60);
                if (timeElapsedInMinutes > 10) {
                    // delete the unverified user email
                    yield existingUnverifiedUser.deleteOne();
                    res.status(400).json({ message: "Verification code has expired." });
                    return;
                }
                if (existingUnverifiedUser.verificationCode !== verificationCode) {
                    res.status(400).json({ message: "Invalid verification code" });
                    return;
                }
                const token = jsonwebtoken_1.default.sign({ email: existingUnverifiedUser.email }, process.env.EMAIL_JWT_SECRET, { 'expiresIn': "3 days" });
                yield existingUnverifiedUser.deleteOne();
                res.status(200).json({ token, message: "Email verified successfully" });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ message: "Something went wrong while verifying email." });
            }
        });
    }
    static register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userName, email, password, interests, country } = req.body;
                const registrationToken = (0, auth_1.getTokenFromRequest)(req);
                if (!registrationToken) {
                    res.status(400).json({ message: "No token found!" });
                    return;
                }
                if (!userName || !email || !password) {
                    res.status(400).json({ message: "Please fill in all fields" });
                    return;
                }
                if (!validator_1.default.isEmail(email)) {
                    res.status(400).json({ message: "Please enter a valid email" });
                    return;
                }
                const { email: tokenEmail } = jsonwebtoken_1.default.verify(registrationToken, process.env.EMAIL_JWT_SECRET);
                if (email !== tokenEmail) {
                    res.status(400).json({ message: "Invalid token" });
                    return;
                }
                (0, custom_validators_1.checkPasswordStrength)(password);
                const salt = yield bcryptjs_1.default.genSalt(10);
                const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
                const newUser = new user_model_1.default({
                    userName, email,
                    password: hashedPassword,
                    interests: interests,
                    country: country,
                });
                yield newUser.save();
                const token = jsonwebtoken_1.default.sign({ _id: newUser._id }, process.env.JWT_SECRET);
                res.status(200).json({
                    token, user: {
                        userName: newUser.userName,
                        email: newUser.email,
                        interests: newUser.interests,
                        country: newUser.country,
                    }
                });
            }
            catch (error) {
                console.log(error);
                if (error instanceof custom_validators_1.InvalidInputError) {
                    res.status(400).json({ message: error.message });
                }
                else {
                    res.status(500).json({ message: "Something went wrong while registering." });
                }
            }
        });
    }
    static login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                if (!email || !password) {
                    res.status(400).json({ message: "Please fill in all fields" });
                    return;
                }
                if (!validator_1.default.isEmail(email)) {
                    res.status(400).json({ message: "Please enter a valid email" });
                    return;
                }
                const existingUser = yield user_model_1.default.findOne({ email });
                if (!existingUser) {
                    res.status(400).json({ message: "User does not exist" });
                    return;
                }
                const isPasswordCorrect = yield bcryptjs_1.default.compare(password, existingUser.password);
                if (!isPasswordCorrect) {
                    res.status(400).json({ message: "Invalid credentials" });
                    return;
                }
                const token = jsonwebtoken_1.default.sign({ _id: existingUser._id }, process.env.JWT_SECRET);
                res.status(200).json({
                    token, user: {
                        userName: existingUser.userName,
                        email: existingUser.email,
                        interests: existingUser.interests,
                        country: existingUser.country,
                    }
                });
            }
            catch (error) {
                console.log(error);
                res.status(500).json({ message: "Something went wrong while logging in." });
            }
        });
    }
    static getUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = (0, auth_1.getTokenFromRequest)(req);
                if (!token) {
                    res.status(400).json({ message: "Unauthorized" });
                    return;
                }
                const existingUser = yield (0, auth_1.getUserFromToken)(token);
                if (!existingUser) {
                    res.status(400).json({ message: "Unauthorized" });
                    return;
                }
                res.status(200).json({
                    token, user: {
                        userName: existingUser.userName,
                        email: existingUser.email,
                        interests: existingUser.interests,
                        country: existingUser.country,
                    }
                });
            }
            catch (error) {
                console.log(error);
                res.status(500).json({ message: "Something went wrong while getting user." });
            }
        });
    }
    static updateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userName, password, interests, country } = req.body;
                const token = (0, auth_1.getTokenFromRequest)(req);
                if (!token) {
                    res.status(400).json({ message: "Unauthorized" });
                    return;
                }
                const existingUser = yield (0, auth_1.getUserFromToken)(token);
                if (!existingUser) {
                    res.status(400).json({ message: "Unauthorized" });
                    return;
                }
                // can update username, interests, password and country
                existingUser.userName = userName ? userName : existingUser.userName;
                existingUser.interests = interests ? interests : existingUser.interests;
                if (!country) {
                    throw new custom_validators_1.InvalidInputError('Please select your country');
                }
                existingUser.country = country ? country : existingUser.country;
                if (password) {
                    (0, custom_validators_1.checkPasswordStrength)(password);
                    const salt = yield bcryptjs_1.default.genSalt(10);
                    const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
                    existingUser.password = hashedPassword;
                }
                yield existingUser.save();
                res.status(200).json({
                    token, user: {
                        userName: existingUser.userName,
                        email: existingUser.email,
                        interests: existingUser.interests,
                        country: existingUser.country,
                    }
                });
            }
            catch (error) {
                if (error instanceof custom_validators_1.InvalidInputError) {
                    res.status(400).json({ message: error.message });
                }
                else {
                    res.status(500).json({ message: "Something went wrong while registering." });
                }
            }
        });
    }
    static deleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = (0, auth_1.getTokenFromRequest)(req);
                if (!token) {
                    res.status(400).json({ message: "Unauthorized" });
                    return;
                }
                const existingUser = yield (0, auth_1.getUserFromToken)(token);
                if (!existingUser) {
                    res.status(400).json({ message: "Unauthorized" });
                    return;
                }
                yield user_model_1.default.findByIdAndDelete(existingUser._id);
                res.status(200).json({ message: "User deleted successfully" });
            }
            catch (error) {
                res.status(500).json({ message: "Something went wrong while deleting user." });
            }
        });
    }
    static getCategories(_, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.status(200).json({ categories: constants_1.constants.eventCategories });
            }
            catch (error) {
                res.status(500).json({ message: "Something went wrong while getting list of categories of interest" });
            }
        });
    }
}
exports.userControllers = userControllers;
