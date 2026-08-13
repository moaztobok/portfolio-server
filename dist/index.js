"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const app_1 = require("./config/app");
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const gallery_1 = __importDefault(require("./routes/gallery"));
const blog_1 = __importDefault(require("./routes/blog"));
exports.app = (0, express_1.default)();
exports.app.use(express_1.default.json());
exports.app.use(express_1.default.static(path_1.default.join(__dirname, '..', 'public')));
(0, app_1.run)();
const PORT = process.env.PORT;
exports.app.use('/api/gallery/', gallery_1.default);
exports.app.use('/api/blog', blog_1.default);
// app.use('/api/login', loginRouter)
exports.app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
});
exports.app.listen(PORT, () => {
    console.log(`Server is running at ${PORT}`);
});
