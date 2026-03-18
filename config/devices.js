import { resolve } from 'path';

export const android_pixel_7 = {
    platformName: 'Android',
    'appium:deviceName': 'Medium Phone API 36.1',
    'appium:platformVersion': '16',
    'appium:automationName': 'UiAutomator2',
    'appium:app': resolve(__dirname, '../app/android/ApiDemos-debug.apk'),
    'appium:autoGrantPermissions': true,
    'appium:noReset': false
};
export const ios_iphone_15 = {
    platformName: 'iOS',
    'appium:deviceName': 'iPhone 15',
    'appium:platformVersion': '17.0',
    'appium:automationName': 'XCUITest',
    'appium:app': resolve(__dirname, '../apps/ios/'),
    'appium:autoAcceptAlerts': true,
    'appium:noReset': false
};