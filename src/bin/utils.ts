import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

import { exec as execute } from 'child_process';

// Wrap it to show stdout
function exec(cmd: string) {
  return new Promise((resolve, reject) => {
    const childProcess = execute(cmd, function(err, stdout, stderr) {
      if (err === null) {
        resolve(stdout);
      } else {
        reject(stderr);
      }
    });
    childProcess.stdout?.pipe(process.stdout);
    childProcess.stderr?.pipe(process.stderr);
  });
}

// paths
const cwd = process.cwd();
const binDir = __dirname;

const web3Dir = path.resolve(require.resolve('@solana/web3.js'), "../..");
const bpfSDKDir = path.join(web3Dir, '/bpf-sdk');

// shells
const sdkInstaller = path.join(binDir, '../../bpf-sdk-install.sh');
const programBuilder = path.join(bpfSDKDir, 'rust/build.sh');

// The Cargo.tomal package name may not equals the program name,
// so we so we need to compatible this.
function getSoFilePath(program: string, profilePath: string): string {
  let soFilePath = path.join(profilePath, (program + '').replace(/\-/g, '_') + '.so');
  if (fs.existsSync(soFilePath)) {
    return soFilePath;
  }
  // Find the first .so file in the directory
  const files = fs.readdirSync(profilePath);
  let soFile = '';
  files.every(file => !(/.*\.so$/.test(file) && (soFile = file)));
  return path.join(profilePath, soFile);
}

// Build the solana program.
async function runBuild(program: string, toPath: string): Promise<void> {
  program = program.replace(/\/$/, '');
  const programDir = path.join(cwd, program);
  const targetDir = path.join(programDir, 'target');
  const profilePath = path.join(targetDir, 'bpfel-unknown-unknown', 'release');
  if (!fs.existsSync(programDir)) {
    console.log('Not found program:', programDir);
    return;
  }

  await exec(programBuilder + ' ' + program);

  const soFilePath = getSoFilePath(program, profilePath);

  const soFileName = path.basename(soFilePath);
  let outputDir = 'build';

  if (toPath) {
    outputDir = /\/$|^((?!(\/)).)*$/.test(toPath) ? toPath : path.dirname(toPath);
  }

  const outputFilePath = /\.so$/.test(toPath) ? toPath : path.join(outputDir, soFileName);

  // Create the folder if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  fs.copyFileSync(soFilePath, outputFilePath);
  console.log('Program built to:', outputFilePath);
}

async function ensureBPFSDK(): Promise<void> {
  if (fs.existsSync(bpfSDKDir)) {
    return;
  }

  const channel = 'edge';

  await exec(`${sdkInstaller} ${web3Dir} ${channel}`);
}

export async function build(program: string, toPath: string): Promise<void> {
  await ensureBPFSDK();
  await runBuild(program, toPath);
}