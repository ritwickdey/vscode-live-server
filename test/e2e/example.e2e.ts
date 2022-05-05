import { remote } from 'webdriverio';

describe('VSCode Live Server Extension', () => {
    let port: number;
    let browser: WebdriverIO.Browser;

    before('start browser', async () => {
        browser = await remote({
            capabilities: { browserName: 'chrome' }
        });
        const workbench = await driver.getWorkbench();

        /**
         * wait until all notifications are removed because sometimes
         * VSCode supresses notifications if others pop up
         */
        await workbench.elem.waitUntil(async () => {
            const notifications = await workbench.getNotifications();
            for (const n of notifications) {
                await n.dismiss();
            }
            return (await workbench.getNotifications()).length === 0;
        });
    });

    it('should click on Go Live', async () => {
        const workbench = await driver.getWorkbench();
        await workbench.elem.$('div[id="ritwickdey.LiveServer"]').click();

        await workbench.elem.waitUntil(async () => {
            const notifications = await workbench.getNotifications();
            for (const notification of notifications) {
                const message = await notification.getMessage();
                if (message.startsWith('Server is Started')) {
                    port = parseInt(message.split(' : ')[1], 10);
                    return true;
                }
            }
            return false;
        }, { timeout: 10000 });
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

