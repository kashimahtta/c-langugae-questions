void calculateZoneEnergy(long long zoneEnergy[4]) {
    int daysInMonth[] = {31, 28, 31, 30, 31, 30};

    for (int zone = 0; zone < 4; zone++) {
        zoneEnergy[zone] = 0;
    }

    int day = 0;

    for (int month = 0; month < 6; month++) {
        int dailyIncrease = (month + 1) * 5;

        for (int d = 0; d < daysInMonth[month]; d++) {
            int energy = 50 + d * dailyIncrease;
            zoneEnergy[day % 4] += energy;
            day++;
        }
    }
}