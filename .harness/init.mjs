import { readFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'

const commands = JSON.parse(await readFile(new URL('./commands.json', import.meta.url), 'utf8'))

function run(command) {
  return new Promise((resolve) => {
    const child = spawn(command, { shell: true, stdio: 'inherit' })
    child.on('close', (code) => resolve(code ?? 1))
  })
}

for (const command of commands) {
  console.log(`\n[harness] ${command}`)
  if ((await run(command)) !== 0) process.exit(1)
}

console.log('\n[harness] verification complete')
