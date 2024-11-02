const {By, until} = require('selenium-webdriver');

async function getParkingTime(driver) {

    console.log("차량 번호 입력 필드 찾는 중...");
    let carNoField = await driver.wait(until.elementLocated(By.id("schCarNo")), 10000);
    await carNoField.sendKeys("1225");
    console.log("차량 번호 입력 완료");

    console.log('"검색" 버튼 찾는 중...');
    let searchButton = await driver.wait(until.elementIsVisible(driver.findElement(By.className("btnS1_1"))), 10000);
    await searchButton.click();
    console.log('"검색" 버튼 클릭 완료');
    console.log("주차 시간 찾는 중...");
    try {

        let parkingTimeElement = await driver.wait(until.elementLocated(By.id("differentTime")), 10000);
        let parkingTimeText = '';
        let attempts = 0;

        do {
            parkingTimeText = await parkingTimeElement.getText();
            if (!parkingTimeText) {
                console.log("주차 시간이 아직 로드되지 않음. 1초 대기 중...");
                await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
            }
            attempts++;
        } while (!parkingTimeText && attempts < 10); // 최대 10번 시도

        // let parkingTimeElement = await driver.wait(until.elementLocated(By.id("differentTime")), 10000);
        // let parkingTimeText = await parkingTimeElement.getText();
        return parkingTimeText;
    } catch (error) {
        console.error("주차 시간 조회 실패:", error);
    }
}

module.exports = { getParkingTime };
