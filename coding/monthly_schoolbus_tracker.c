/*
TITLE: Monthly School Bus Transportation
DESCRIPTION: Simulates 31 days of school transportation and analyzes weekly demand.
STATEMENT:
Day 1 is Monday. Repeat the weekly transportation pattern—48, 52, 50, 55, 60, 25, 0—for 31 days. Store the daily values, calculate the monthly total, find the seven-day period with the highest total (choose the earliest if tied), and estimate the following week's transportation as 105% of that total, rounded down.
*/void computeDailyTransportation(int dailyTransportation[31], int *monthlyTotal) {
    int weeklyPattern[7] = {48, 52, 50, 55, 60, 25, 0};
    *monthlyTotal = 0;

    for (int day = 0; day < 31; day++) {
        dailyTransportation[day] = weeklyPattern[day % 7];
        *monthlyTotal += dailyTransportation[day];
    }
}

int busiestWeekEstimate(const int dailyTransportation[31]) {
    int busiestTotal = 0;

    for (int start = 0; start <= 24; start += 7) {
        int weekTotal = 0;

        for (int day = start; day < start + 7; day++) {
            weekTotal += dailyTransportation[day];
        }

        if (weekTotal > busiestTotal) {
            busiestTotal = weekTotal;
        }
    }

    return (busiestTotal * 105) / 100;
}