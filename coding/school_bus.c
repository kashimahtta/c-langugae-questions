/*
TITLE: School Bus Transportation Simulator
DESCRIPTION: Simulates daily bus passenger counts, finds the busiest week, and estimates the next week's total.
STATEMENT:
A repeating weekly pattern gives the number of students transported each day: Monday 48, Tuesday 52, Wednesday 50, Thursday 55, Friday 60, Saturday 25, and Sunday 0. Fix the daily transportation logic, calculate the total, find the busiest seven-day period, and estimate the next week's transportation as 105% of that week's total, rounded down.
*/
void computeDailyTransportation(int dailyTransportation[31], int *monthlyTotal) {
    int weeklyPattern[7] = {48, 52, 50, 55, 60, 25, 0};
    *monthlyTotal = 0;

    for (int day = 0; day < 31; day++) {
        dailyTransportation[day] = weeklyPattern[day % 7];
        *monthlyTotal += dailyTransportation[day];
    }
}

int estimateNextWeek(const int dailyTransportation[31]) {
    int weeklyTotal = 0;

    for (int day = 0; day < 7; day++) {
        weeklyTotal += dailyTransportation[day];
    }

    return weeklyTotal * 105 / 100;
}