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
 * @return {Promise.<String>}
 */
let prawner = (cmd, {
  stdin,
  encoding = ENCODING,
  verbose = false
} = {}) => new Promise((resolve, reject) => {
  let child = spawn(cmd, {
    shell: true
  });

  let stderr = stream(child, 'stderr', { verbose });
  let stdout = stream(child, 'stdout', { verbose });

  child.on('exit', code => {
    if (code !== 0) {
      return reject(new Error(stderr()));
    }

    let output = stdout().trim();
    resolve(output);
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
