/*
 * prawner - Spawn shell commands with Promises
 * https://github.com/gavinhungry/prawner
 */

const { spawn } = require('child_process');

// default encoding
const ENCODING = 'utf-8';

/**
 * Get a function returning a string of cumulative stream output
 *
 * @private
 *
 * @param {ChildProcess} child
 * @param {String} stdio
 * @param {Object} [opts]
 * @param {String} [opts.encoding]
 * @param {String} [opts.verbose]
 * @return {Function}
 */
let stream = (child, stdio, {
  encoding = ENCODING,
  verbose = false
} = {}) => {
  let chunks = [];

  child[stdio].on('data', chunk => {
    chunks.push(chunk);

    if (verbose) {
      process[stdio].write(chunk.toString());
    }
  });

  return () => Buffer.concat(chunks).toString(encoding);
};

/**
 * Execute a shell command and get the output
 *
 * @private
 *
 * @param {String} cmd
 * @param {Object} [opts]
 * @param {String} [opts.stdin]
 * @param {String} [opts.encoding]
 * @param {String} [opts.verbose]
 * @param {Boolean} [opts.raw] - include stdout, stderr and exit code
 * @return {Promise.<String|Object>}
 */
let prawner = (cmd, {
  stdin,
  encoding = ENCODING,
  verbose = false,
  raw = false
} = {}) => new Promise((resolve, reject) => {
  let child = spawn(cmd, {
    shell: true
  });

  let stdoutStream = stream(child, 'stdout', { verbose });
  let stderrStream = stream(child, 'stderr', { verbose });

  child.on('exit', code => {
    let stdout = stdoutStream().trim();
    let stderr = stderrStream().trim();

    if (raw) {
      return resolve({
        stdout,
        stderr,
        exitCode: code
      });
    }

    if (code !== 0) {
      return reject(new Error(stderr));
    }

    resolve(stdout);
  });

  if (stdin) {
    child.stdin.setEncoding(encoding);

    if (stdin) {
      child.stdin.write(stdin);
    }
  }

  child.stdin.end();
});

module.exports = prawner;
