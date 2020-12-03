"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
// Wrap it to show stdout
function exec(cmd) {
    return new Promise((resolve, reject) => {
        var _a, _b;
        const childProcess = child_process_1.exec(cmd, function (err, stdout, stderr) {
            if (err === null) {
                resolve(stdout);
            }
            else {
                reject(stderr);
            }
        });
        (_a = childProcess.stdout) === null || _a === void 0 ? void 0 : _a.pipe(process.stdout);
        (_b = childProcess.stderr) === null || _b === void 0 ? void 0 : _b.pipe(process.stderr);
    });
}
// paths
const cwd = process.cwd();
const binDir = __dirname;
const web3Dir = path_1.default.resolve(require.resolve('@solana/web3.js'), "../..");
const bpfSDKDir = path_1.default.join(web3Dir, '/bpf-sdk');
// shells
const sdkInstaller = path_1.default.join(binDir, '../../bpf-sdk-install.sh');
const programBuilder = path_1.default.join(bpfSDKDir, 'rust/build.sh');
// The Cargo.tomal package name may not equals the program name,
// so we so we need to compatible this.
function getSoFilePath(program, profilePath) {
    let soFilePath = path_1.default.join(profilePath, (program + '').replace(/\-/g, '_') + '.so');
    if (fs_1.default.existsSync(soFilePath)) {
        return soFilePath;
    }
    // Find the first .so file in the directory
    const files = fs_1.default.readdirSync(profilePath);
    let soFile = '';
    files.every(file => !(/.*\.so$/.test(file) && (soFile = file)));
    return path_1.default.join(profilePath, soFile);
}
// Build the solana program.
async function runBuild(program, toPath) {
    program = program.replace(/\/$/, '');
    const programDir = path_1.default.join(cwd, program);
    const targetDir = path_1.default.join(programDir, 'target');
    const profilePath = path_1.default.join(targetDir, 'bpfel-unknown-unknown', 'release');
    if (!fs_1.default.existsSync(programDir)) {
        console.log('Not found program:', programDir);
        return;
    }
    await exec(programBuilder + ' ' + program);
    const soFilePath = getSoFilePath(program, profilePath);
    const soFileName = path_1.default.basename(soFilePath);
    let outputDir = 'build';
    if (toPath) {
        outputDir = /\/$|^((?!(\/)).)*$/.test(toPath) ? toPath : path_1.default.dirname(toPath);
    }
    const outputFilePath = /\.so$/.test(toPath) ? toPath : path_1.default.join(outputDir, soFileName);
    // Create the folder if it doesn't exist
    if (!fs_1.default.existsSync(outputDir)) {
        fs_1.default.mkdirSync(outputDir);
    }
    fs_1.default.copyFileSync(soFilePath, outputFilePath);
    console.log('Program built to:', outputFilePath);
}
async function ensureBPFSDK() {
    if (fs_1.default.existsSync(bpfSDKDir)) {
        return;
    }
    const channel = 'edge';
    await exec(`${sdkInstaller} ${web3Dir} ${channel}`);
}
async function build(program, toPath) {
    await ensureBPFSDK();
    await runBuild(program, toPath);
}
exports.build = build;
