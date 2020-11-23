var shell = require('shelljs');

var fs = require('fs');
var path = require('path');

// paths
var cwd = process.cwd();
var binDir = __dirname;
var rootDir = path.resolve(binDir, '../');
var web3Dir = path.join(rootDir, '/node_modules/@solana/web3.js');
var bpfSdkDir = path.join(web3Dir, '/bpf-sdk');

// shells
var sdkInstaller = path.join(binDir, '/bpf-sdk-install.sh');
var programBuilder = path.join(bpfSdkDir, 'rust/build.sh');

function exec(cmd, fn) {
  shell.exec(cmd, function (code, stdout) {
    if (code === 0) {
      fn(stdout)
    } else {
      console.log('Some error occurs, exit.')
    }
  });
}

// The Cargo.tomal package name may not equals the program name,
// so we so we need to compatible this.
function getSoFilePath(program, profilePath) {
  try {
    // If the most likely file exists, just return it.
    var soFilePath = path.join(profilePath, (program + '').replace(/\-/g, '_') + '.so');
    if (fs.existsSync(soFilePath)) {
      return soFilePath;
    } else {
      // Find the first .so file in the directory
      var files = fs.readdirSync(profilePath);
      var soFile = '';
      files.every(function(file) {
        return !(/.*\.so$/.test(file) && (soFile = file));
      });
      return path.join(profilePath, soFile);
    }
  } catch(e) {
    return '';
  }
}

// Build the solana program.
function runBuild(program, toPath) {

  var programDir = path.join(cwd, program);
  var targetDir = path.join(programDir, 'target');
  var profilePath = path.join(targetDir, 'bpfel-unknown-unknown', 'release');
 
  exec(programBuilder + ' ' + program, function(res) {
    var soFilePath = getSoFilePath(program, profilePath);
    if (soFilePath) {
      try {
        var soFileName = program + '.so';
        var outputDir = 'build';

        if (toPath) {
          outputDir = /\/$/.test(toPath) || !/\//.test(toPath) ? toPath : path.dirname(toPath);
        }

        var outputFilePath = /\.so$/.test(toPath) ? toPath : path.join(outputDir, soFileName);

        // Create the folder if it doesn't exist
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir);
        }

        // Move built file out
        var res = shell.cp('-f', soFilePath, outputFilePath);
         
        if (res.stderr) {
          throw new Error();
        } else {
          console.log('Program built to:', outputFilePath);
        }

      } catch(err) {
        console.log('Move *.so file error, maybe you can find the file in', profilePath);
      }
    } else {
      console.log('Get built *.so file error, exit.');
    }
  });
}

function checkBuildSdkVersion() {
  var sdkVersionFile = path.join(bpfSdkDir, 'version.txt');
  var sdkVersionData = fs.readFileSync(sdkVersionFile, 'utf-8');
  var pkgJSONData = fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8');

  var pkgJSON = JSON.parse(pkgJSONData) || {};
  
  return pkgJSON.testnetDefaultChannel == 'v' + (/^(.*)\s/.exec(sdkVersionData) || [])[1];
}

exports.build = function(program, toPath) {
  if (!fs.existsSync(bpfSdkDir)) {
    // We need install sdk first
    shell.chmod('x', sdkInstaller);
    exec(sdkInstaller + ' ' + web3Dir, function() {
      runBuild(program, toPath);
    });
  } else {
    // Check sdk version
    var checked = checkBuildSdkVersion();
    if (checked) {
      runBuild(program, toPath);
    } else {
      console.log('SDK version not match, download the new version.');
      
      shell.rm('-rf', bpfSdkDir);
      exec(sdkInstaller + ' ' + web3Dir, function() {
        runBuild(program, toPath);
      });
    }
  }
}