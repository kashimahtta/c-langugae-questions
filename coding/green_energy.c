/*
TITLE: Green Energy Production Simulator
DESCRIPTION: Fixes the monthly energy generation logic and totals the energy distributed to four zones.
STATEMENT:
A solar plant generates energy starting at 50 units, with the daily increase determined by the month: +5 in Month 1, +10 in Month 2, +15 in Month 3, and so on. The generated energy is assigned cyclically to Zones A, B, C, and D. Fix the generation function and calculate the total received by each zone.
*/void calculateZoneEnergy(int days, int zoneEnergy[4]) {
    for (int zone = 0; zone < 4; zone++) {
        zoneEnergy[zone] = 0;
    }

    int day = 0;

    for (int d = 0; d < days; d++) {
        int energy = 50 + d * 5;
        zoneEnergy[day % 4] += energy;
        day++;
    }
}