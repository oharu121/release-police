export { checkBranch } from './branch-check.js';
export { syncRemote } from './remote-sync.js';
export { runChecks } from './checks-runner.js';
export { checkAndCommit } from './git-status.js';
export { bumpVersion } from './version-bump.js';
export { pushToRemote } from './push.js';
export { deploy } from './deploy.js';
export { createGithubRelease } from './github-release.js';

/** @deprecated Use runChecks instead */
export { runTests } from './test-runner.js';
