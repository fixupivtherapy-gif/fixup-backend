#!/usr/bin/env node
/*
 * Hash a password for ADMIN_PASSWORD_HASH in .env.
 *
 * Usage:
 *   npm run hash -- 'my-strong-password'
 *   node scripts/hash-password.js 'my-strong-password'
 *
 * If no password is given, prompts on stdin.
 */

const bcrypt = require('bcryptjs');
const readline = require('readline');

const ROUNDS = 12;

function prompt(question, { silent = false } = {}) {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    if (silent) {
      const stdin = process.openStdin();
      const onData = char => {
        char = char.toString('utf8');
        if (char === '\n' || char === '\r' || char === '') {
          stdin.removeListener('data', onData);
        } else {
          process.stdout.clearLine(0);
          readline.cursorTo(process.stdout, 0);
          process.stdout.write(question + '*'.repeat(rl.line.length));
        }
      };
      process.stdin.on('data', onData);
    }
    rl.question(question, answer => {
      rl.close();
      process.stdout.write('\n');
      resolve(answer);
    });
  });
}

async function main() {
  let password = process.argv.slice(2).join(' ').trim();
  if (!password) {
    password = (await prompt('Password: ', { silent: true })).trim();
  }
  if (!password) {
    console.error('No password provided.');
    process.exit(1);
  }
  const hash = await bcrypt.hash(password, ROUNDS);
  console.log('');
  console.log('Add this line to your .env file:');
  console.log('');
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
  console.log('');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
