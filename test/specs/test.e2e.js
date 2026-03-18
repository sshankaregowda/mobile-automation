describe('App launch', () => {
  it('should launch the app', async () => {
     await browser.pause(10000)
    const source = await browser.getPageSource();
    console.log(source.slice(0, 500));
  });
});