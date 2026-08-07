import { ESLint } from 'eslint';
import fs from 'fs';

async function main() {
  const eslint = new ESLint();
  const results = await eslint.lintFiles(['.']);
  const formatter = await eslint.loadFormatter('stylish');
  const output = formatter.format(results);
  const errorCount = results.reduce((sum, r) => sum + r.errorCount, 0);
  const warningCount = results.reduce((sum, r) => sum + r.warningCount, 0);

  const report = {
    exitCode: errorCount > 0 ? 1 : 0,
    errorCount,
    warningCount,
    output
  };

  fs.writeFileSync('lint-report.txt', output);
  fs.writeFileSync('lint-summary.json', JSON.stringify(report, null, 2));
  console.log(`Error count: ${errorCount}`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
