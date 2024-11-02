const {Builder, By, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function loginAndGetSessionId(username, password) {
    let options = new chrome.Options();
    options.addArguments("--headless"); // 헤드리스 모드
    options.addArguments("--no-sandbox"); // 권한 문제 방지
    options.addArguments("--disable-dev-shm-usage"); // 공유 메모리 문제 해결
    options.addArguments("--disable-gpu"); // GPU 비활성화 (헤드리스 모드에서 권장)

    let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
    let jsessionId = null;

    try {
        await driver.get("https://a13614.parkingweb.kr/login");

        const usernameField = await driver.wait(until.elementLocated(By.name("userId")), 10000);
        await usernameField.sendKeys(username);

        const passwordField = await driver.wait(until.elementLocated(By.name("userPwd")), 10000);
        await passwordField.sendKeys(password);

        const loginButton = await driver.wait(until.elementLocated(By.id("btnLogin")), 10000);
        await loginButton.click();

        console.log("첫 번째 OK 버튼 찾는 중...");
        try {
            let okButton = await driver.wait(until.elementLocated(By.className("modal-btn")), 20000);
            await driver.wait(until.elementIsVisible(okButton), 10000);
            await okButton.click();
            console.log("OK 버튼 클릭 완료");
        } catch (okError) {
            console.error("첫 번째 OK 버튼 클릭 실패:", okError);
        }

        const cookies = await driver.manage().getCookies();
        const jsessionCookie = cookies.find(cookie => cookie.name === "JSESSIONID");
        jsessionId = jsessionCookie ? jsessionCookie.value : null;

        if (!jsessionId) {
            throw new Error("JSESSIONID를 가져오지 못했습니다.");
        }

    } catch (error) {
        console.error("로그인 에러:", error);
        await driver.quit(); // 로그인 실패 시 driver 종료
    }

    // 성공적으로 로그인하면 driver와 jsessionId를 반환
    return { driver, jsessionId };
}

module.exports = { loginAndGetSessionId };
