"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var path = __importStar(require("path"));
var BMPBuffer = /** @class */ (function () {
    function BMPBuffer(pathToPic) {
        this.imagePath = null;
        this.fileName = null;
        this.ogImageBuffer = undefined;
        this.negativeBuffer = undefined;
        this.bitsPerPixel = 24;
        this.offset = 0;
        this.compressionMethod = null;
        this.errors = [];
        this.setImagePath(pathToPic);
    }
    BMPBuffer.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this.getBMPBuffer(this.imagePath)];
                    case 1:
                        _a.ogImageBuffer = _b.sent();
                        // Checks the Header and assures certain values are correct
                        this.analyzeBMP(this.ogImageBuffer);
                        return [2 /*return*/];
                }
            });
        });
    };
    BMPBuffer.prototype.setImagePath = function (pathToPic) {
        try {
            this.imagePath = path.join(path.dirname(__dirname), "images/" + pathToPic);
            this.fileName = path.basename(this.imagePath);
            console.log('File has Been Found');
        }
        catch (err) {
            console.error('Please Provide A Correct Path To The File');
            this.errors.push('Incorrect Path To Image');
        }
    };
    BMPBuffer.prototype.getBMPBuffer = function (imagePath) {
        return __awaiter(this, void 0, void 0, function () {
            var data, buffer, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('Reading File');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fs_1.promises.readFile(imagePath)];
                    case 2:
                        data = _a.sent();
                        buffer = Buffer.from(data);
                        console.log('Buffer Data has Been read');
                        return [2 /*return*/, buffer];
                    case 3:
                        err_1 = _a.sent();
                        console.error('Reading the file failed');
                        this.errors.push('File Reading Failed');
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    BMPBuffer.prototype.copyBMPHeader = function (ogBuffer, negativeBuffer) {
        console.log('Copying ogBMP Header');
        for (var i = 0; i < 54; i++) {
            negativeBuffer[i] = ogBuffer[i];
        }
        console.log('Copying Complete');
    };
    BMPBuffer.prototype.createNegativeBMP = function () {
        return __awaiter(this, void 0, void 0, function () {
            var err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // allocate a buffer with equiv space as the ogBuffer
                        this.negativeBuffer = Buffer.alloc(this.ogImageBuffer.length);
                        // copy the header values from the ogBuffer to the new buffer
                        this.copyBMPHeader(this.ogImageBuffer, this.negativeBuffer);
                        // Might need more checks here
                        this.mutateNegativeBufferColors();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.writeImage(this.negativeBuffer)];
                    case 2:
                        _a.sent();
                        console.log('The Creation has completed!');
                        return [3 /*break*/, 4];
                    case 3:
                        err_2 = _a.sent();
                        console.error('Creation had an error!', String(err_2));
                        this.errors.push('Writing The Negative File To Disk Failed');
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    BMPBuffer.prototype.writeImage = function (buffer, fileName) {
        if (fileName === void 0) { fileName = 'sick'; }
        // write the image to the negatives folder
        return fs_1.promises.writeFile(path.dirname(__dirname) + "/negatives/" + fileName + "-negative.bmp", buffer);
    };
    BMPBuffer.prototype.mutateNegativeBufferColors = function () {
        var start = this.offset;
        console.log('Mutating the Colors');
        // traverse and inverse colors
        try {
            for (var i = start; i < this.negativeBuffer.length; i += 3) {
                var r = this.ogImageBuffer.readUInt8(i);
                var g = this.ogImageBuffer.readUInt8(i + 1);
                var b = this.ogImageBuffer.readUInt8(i + 2);
                var _a = this.invertRGB(r, g, b), newR = _a.newR, newG = _a.newG, newB = _a.newB;
                this.negativeBuffer.writeUInt8(newR, i);
                this.negativeBuffer.writeUInt8(newG, i + 1);
                this.negativeBuffer.writeUInt8(newB, i + 2);
            }
        }
        catch (err) {
            console.error('Something Went Wrong When Writing The New Colors');
            this.errors.push('Failed Writing Negative Colors');
        }
    };
    BMPBuffer.prototype.invertRGB = function (r, g, b) {
        var newR = 255 - r;
        var newG = 255 - g;
        var newB = 255 - b;
        return { newR: newR, newG: newG, newB: newB };
    };
    BMPBuffer.prototype.analyzeBMP = function (buffer) {
        console.log('Analyzing Header...');
        var _a = this.readBMPHeader(buffer), format = _a.format, bitsPerPixel = _a.bitsPerPixel, offset = _a.offset, compressionMethod = _a.compressionMethod;
        if (format != 'BM') {
            console.error('The File Must be a BMP format');
        }
        else {
            console.log('The File Format Is Correct!');
        }
        if (bitsPerPixel !== this.bitsPerPixel) {
            console.error('The Image must be in 24 BPP format');
        }
        else {
            console.log('The Bytes Per Pixel Is Correct!');
        }
        if (compressionMethod != 0) {
            console.error("The Image Must Have No Compression Used\n The Image Currently has the " + compressionMethod + " Compression Method");
        }
        else {
            console.log('Hooray No Compression Was Used!');
        }
        this.offset = offset;
    };
    // Extracts the header from the BMP Image
    // Some values are more important than others
    // Most importantly we need the OFFSET and the BytesPerPixel
    BMPBuffer.prototype.readBMPHeader = function (buffer) {
        var format = buffer.toString('utf-8', 0, 2);
        var pos = 2;
        var fileSize = buffer.readUInt32LE(pos); // (54 bytes header + 16 bytes data)
        pos += 4;
        var reserved = buffer.readUInt32LE(pos);
        pos += 4;
        var offset = buffer.readUInt32LE(pos);
        pos += 4;
        var headerSize = buffer.readUInt32LE(pos); // number of bytes in the db header from this point
        pos += 4;
        var width = buffer.readUInt32LE(pos);
        pos += 4;
        var height = buffer.readInt32LE(pos);
        pos += 4;
        var planes = buffer.readUInt16LE(pos);
        pos += 2;
        var bitsPerPixel = buffer.readUInt16LE(pos); // 24 bits
        pos += 2;
        var compressionMethod = buffer.readUInt32LE(pos);
        pos += 4;
        var rawSize = buffer.readUInt32LE(pos); // Size of the raw bitmap data (including padding) filesize - offset
        pos += 4;
        var hr = buffer.readUInt32LE(pos); // Horizontal Rez
        pos += 4;
        var vr = buffer.readUInt32LE(pos); // Vertical Rez
        pos += 4;
        var colors = buffer.readUInt32LE(pos);
        pos += 4;
        var importantColors = buffer.readUInt32LE(pos); //32h  zero important colors means all colors are important
        console.log({
            format: format,
            fileSize: fileSize,
            reserved: reserved,
            offset: offset,
            headerSize: headerSize,
            width: width,
            height: height,
            planes: planes,
            bitsPerPixel: bitsPerPixel,
            compressionMethod: compressionMethod,
            rawSize: rawSize,
            hr: hr,
            vr: vr,
            colors: colors,
            importantColors: importantColors,
        });
        return {
            format: format,
            fileSize: fileSize,
            reserved: reserved,
            offset: offset,
            headerSize: headerSize,
            width: width,
            height: height,
            planes: planes,
            bitsPerPixel: bitsPerPixel,
            compressionMethod: compressionMethod,
            rawSize: rawSize,
            hr: hr,
            vr: vr,
            colors: colors,
            importantColors: importantColors,
        };
    };
    return BMPBuffer;
}());
exports.default = BMPBuffer;
