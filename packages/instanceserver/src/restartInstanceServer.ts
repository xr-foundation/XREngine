/**
 * When using local dev, to properly test multiple worlds for portals we
 * need to programatically shut down and restart the instanceserver process.
 */
export const restartInstanceServer = (cb: () => Promise<void>) => {
  require('child_process').spawn('npm', ['run', 'dev'], {
    cwd: process.cwd(),
    stdio: 'inherit'
  })
  cb().then(() => process.exit(0))
}
