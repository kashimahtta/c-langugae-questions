/*
TITLE: Emergency Drone Recharge Stops
DESCRIPTION: Finds the fewest recharge stops needed for a drone to reach its destination.
STATEMENT:
Given an array where each value is the maximum number of stations the drone can travel forward from that station, return the minimum number of stops needed to reach the last station. Return -1 if it cannot be reached, and return 0 if there is only one station.
*/int minRechargeStops(int battery[], int n) {
    if (n <= 1) return 0;

    int stops = 0;
    int currentEnd = 0;
    int farthest = 0;

    for (int i = 0; i < n - 1; i++) {
        if (i > farthest) return -1;

        if (i + battery[i] > farthest) {
            farthest = i + battery[i];
        }

        if (i == currentEnd) {
            if (farthest == currentEnd) return -1;

            stops++;
            currentEnd = farthest;

            if (currentEnd >= n - 1) return stops;
        }
    }

    return -1;
}