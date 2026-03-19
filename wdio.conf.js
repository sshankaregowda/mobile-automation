import devices from './config/devices.js';

const deviceKey = process.env.DEVICE_KEY;

if (!deviceKey || !devices[deviceKey]) {
  throw new Error(`Invalid or missing DEVICE_KEY: ${deviceKey}`);
}

export const config = {
  runner: 'local',
  specs: ['./test/specs/test.e2e.js'],
  maxInstances: 1,

  hostname: '127.0.0.1',
  port: 4723,
  path: '/',

  capabilities: [devices[deviceKey]],

  logLevel: 'info',
  framework: 'mocha',
  reporters: ['spec'],

  mochaOpts: {
    ui: 'bdd',
    timeout: 120000
  },

  services: [[
  'appium',
  {
    command: './node_modules/.bin/appium',
    args: {
      basePath: '/',
      port: 4723,
      logLevel: 'debug'
    }
  }
]]
};