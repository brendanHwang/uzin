const functions = require("firebase-functions");
const express = require("express");
const { loginAndGetSessionId } = require('./services/loginService');
const { getParkingTime } = require('./services/parkingService');
const { applyDiscount } = require('./services/discountService');
const { getTotalDcTime } = require('./services/stateService');

const app = express(); // app 객체 생성

app.get('/calculate-parking-time', async (req, res) => {
    const { startDate, endDate, carNo = "1225" } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ error: 'startDate와 endDate 파라미터가 필요합니다.' });
    }

    const username = "420";
    const password = "1111";

    try {
        // 로그인하여 driver와 JSESSIONID 획득
        const { driver, jsessionId } = await loginAndGetSessionId(username, password);

        if (!jsessionId) {
            return res.status(500).json({ error: 'JSESSIONID를 가져오지 못했습니다.' });
        }

        console.log("로그인 성공, JSESSIONID:", jsessionId);

        try {
            // 출차 전 항목의 dc_time 합계 계산
            const totalDcTime = await getTotalDcTime(jsessionId, startDate, endDate, username);
            console.log("출차 전 dc_time 합계 (분):", totalDcTime);

            // 주차 시간 정보 조회
            const parkingTimeText = await getParkingTime(driver);
            console.log("주차 시간:", parkingTimeText);

            if (!parkingTimeText) {
                return res.status(500).json({ error: '주차 시간 조회 실패' });
            }

            // 주차 시간 계산 및 할인 적용 로직
            const timeMatches = parkingTimeText.match(/\d+/g);
            if (timeMatches && timeMatches.length === 2) {
                const [hours, minutes] = timeMatches.map(Number);
                const totalParkingTimeInMinutes = hours * 60 + minutes;

                const additionalTime = totalParkingTimeInMinutes - totalDcTime;

                if (additionalTime > 0) {
                    console.log("추가로 내야할 시간 (분):", additionalTime);
                    await applyDiscount(jsessionId, additionalTime, carNo);
                    res.json({
                        message: `추가로 ${additionalTime}분 할인 등록이 완료되었습니다.`,
                        additionalTime,
                        totalDcTime,
                        parkingTimeText
                    });
                } else {
                    console.log("추가로 내야할 시간이 없습니다.");
                    res.json({
                        message: "추가로 내야할 시간이 없습니다.",
                        additionalTime: 0,
                        totalDcTime,
                        parkingTimeText
                    });
                }
            } else {
                res.status(500).json({ error: '주차 시간 형식을 확인할 수 없습니다.' });
            }
        } catch (error) {
            console.error("에러 발생:", error);
            res.status(500).json({ error: '처리 중 오류가 발생했습니다.' });
        } finally {
            await driver.quit();
        }
    } catch (error) {
        console.error("로그인 에러:", error);
        res.status(500).json({ error: '로그인 중 오류가 발생했습니다.' });
    }
});

// Firebase Function으로 Express 앱을 내보냄
exports.uzin = functions.https.onRequest(app);
