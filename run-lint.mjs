import { execSync } from 'child_process';

try {
const output = execSync('npx eslint .', {
    cwd: 'c:/Nateng/nateng',
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  console.log('LINT OUTPUT (no errors):');
  console.log(output || '(empty)');
  console.log('\nEXIT CODE: 0 (success)');
} catch (e) {
  console.log('LINT OUTPUT (errors found):');
  console.log(e.stdout || '');
  console.log(e.stderr || '');
  console.log('\nEXIT CODE:', e.status);
}
