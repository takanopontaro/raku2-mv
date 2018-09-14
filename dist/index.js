"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const del_1 = __importDefault(require("del"));
const make_dir_1 = __importDefault(require("make-dir"));
const move_file_1 = __importDefault(require("move-file"));
const path_1 = __importDefault(require("path"));
const lib_1 = require("./lib");
function mv(src, dest, ...args) {
    return __awaiter(this, void 0, void 0, function* () {
        let options;
        let cb;
        if (args.length === 2) {
            options = args[0];
            cb = args[1];
        }
        else if (typeof args[0] === 'object') {
            options = args[0];
        }
        else if (typeof args[0] === 'function') {
            cb = args[0];
        }
        const { cwd, overwrite } = Object.assign({ cwd: '.', overwrite: true }, options);
        const absDest = path_1.default.resolve(cwd, dest);
        const pathsInfo = yield lib_1.buildPathsInfoList(src, cwd);
        const filesMap = new Map();
        const emptyDirs = new Set();
        pathsInfo.forEach(({ dirname, paths, file }) => {
            if (paths.length === 0) {
                const to = path_1.default.join(absDest, path_1.default.basename(dirname));
                emptyDirs.add(to);
                return;
            }
            paths.forEach(path => {
                const from = path_1.default.join(dirname, path);
                const dir = file ? '' : path_1.default.basename(dirname);
                const to = path_1.default.join(absDest, dir, path);
                if (path.endsWith(path_1.default.sep)) {
                    emptyDirs.add(to);
                    return;
                }
                filesMap.set(from, to);
            });
        });
        const totalEmptyDirs = emptyDirs.size;
        const totalItems = totalEmptyDirs + filesMap.size;
        let completedItems = 0;
        const handleProgress = () => {
            completedItems += 1;
            if (cb) {
                cb({ completedItems, totalItems });
            }
        };
        const files = [];
        filesMap.forEach((to, from) => {
            const p = (() => __awaiter(this, void 0, void 0, function* () {
                yield move_file_1.default(from, to, { overwrite });
                handleProgress();
            }))();
            files.push(p);
        });
        const dirs = [...emptyDirs].map(dir => make_dir_1.default(dir));
        yield Promise.all([...files, ...dirs]);
        yield del_1.default(src, { force: true, cwd });
        const data = {
            completedItems: completedItems + totalEmptyDirs,
            totalItems
        };
        if (totalEmptyDirs > 0 && cb) {
            cb(data);
        }
        return data;
    });
}
module.exports = mv;
