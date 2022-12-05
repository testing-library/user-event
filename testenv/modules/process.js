import process from 'process'

globalThis.process = process
process.stdout = {}
process.stdin = {}
process.stderr = {}
