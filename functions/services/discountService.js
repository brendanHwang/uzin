const axiosInstance = require('../config/axiosConfig');

async function applyDiscount(jsessionId, additionalTime, carNo) {
    const callCount = Math.ceil(additionalTime / 30);
    for (let i = 0; i < callCount; i++) {
        try {
            const discountResponse = await axiosInstance.post(
                'https://a13614.parkingweb.kr/discount/registration/save',
                `peId=868100&discountType=8&saveCnt=1&carNo=${encodeURIComponent(carNo)}&acPlate2=&memo=`,
                { headers: { 'Cookie': `JSESSIONID=${jsessionId};` } }
            );
            console.log(`${i + 1}번째 할인 등록 요청 완료:`, discountResponse.status);
        } catch (error) {
            console.error(`${i + 1}번째 할인 등록 요청 실패:`, error);
        }
    }
}

module.exports = { applyDiscount };
