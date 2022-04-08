import { remote } from 'webdriverio';

describe('VSCode Live Server Extension', () => {
    let port: number;
    let browser: WebdriverIO.Browser;

    before('start browser', async () => {
        browser = await remote({
            capabilities: { browserName: 'chrome' }
        });
    });

    it('should click on Go Live', async () => {
        const workbench = await driver.getWorkbench();
        await workbench.elem.$('div[id="ritwickdey.LiveServer"]').click();

        await browser.waitUntil(async () => {
            const notifications = await workbench.getNotifications();
            for (const notification of notifications) {
                const message = await notification.getMessage();
                if (message.startsWith('Server is Started')) {
                    port = parseInt(message.split(' : ')[1], 10);
                    return true;
                }
            }
            return false;
        });
    });

    it('should be able to open started server', async () => {
        await browser.url(`http://localhost:${port}`);
        await expect(browser).toHaveTitle('listing directory /');
    });

    it('should show content of root directory and serve files', async () => {
        await browser.$('span=README.md').click();
        expect(await browser.getPageSource()).toContain('# Live Server');
    });

    after('shutdown browser', () => {
        return browser.deleteSession();
    });
});

