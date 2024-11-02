const axios = require('axios');

/**
 * 주어진 날짜와 계정 번호로 출차 전 항목의 dc_time 합계를 계산하는 함수
 * @param {string} jsessionId - 로그인 세션 ID
 * @param {string} startDate - 시작 날짜 (YYYYMMDD 형식)
 * @param {string} endDate - 종료 날짜 (YYYYMMDD 형식)
 * @param {string} accountNo - 계정 번호
 * @returns {number} totalDcTime - 출차 전 항목의 dc_time 합계 (분 단위)
 */
async function getTotalDcTime(jsessionId, startDate, endDate, accountNo) {
    try {
        const response = await axios.post(
            'https://a13614.parkingweb.kr/state/doListMst',
            `startDate=${startDate}&endDate=${endDate}&account_no=${accountNo}&dc_id=&carno=&corp=&master_id=&rowcount=10000`,
            {
                headers: {
                    'Accept': 'application/json, text/javascript, */*; q=0.01',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Cookie': `JSESSIONID=${jsessionId};`,
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
                }
            }
        );

        const data = response.data.data || [];
        const totalDcTime = data
            .filter(item => item.paid_stat === "00")
            .reduce((sum, item) => sum + parseFloat(item.dc_time || 0), 0);

        console.log("출차 전인 것의 dc_time 합계 (분):", totalDcTime);
        return totalDcTime;
    } catch (error) {
        console.error("출차 전 dc_time 합계 계산 실패:", error);
        return 0;
    }
}

module.exports = { getTotalDcTime };
