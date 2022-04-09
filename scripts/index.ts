import { spawnSync } from 'node:child_process';

export function executeCommand(command: string, args?: string[]) {
    spawnSync(command, args, {
        shell: true,
        encoding: 'utf8',
        stdio: 'inherit'
    });
}

export const DATASOURCE_PATH = './src/ormconfig.ts';
export const ORM_CMD = 'yarn typeorm';
