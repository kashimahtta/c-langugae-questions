/*
TITLE: Digital Wallet Cashback Simulator
DESCRIPTION: Generates daily cashback values and totals the cashback earned over the first K days.
STATEMENT:
Cashback starts at 20 points on Day 1. Each day's increase is 2 points greater than the previous day's increase, beginning with +2. Generate the first N values and return the total cashback for the first K days.
*/void generateCashbackSeries(int n, int k, int cashback[], int *total) {
    int value = 20;
    int increment = 2;
    *total = 0;

    for (int i = 0; i < n; i++) {
        cashback[i] = value;

        if (i < k) {
            *total += value;
        }

        value += increment;
        increment += 2;
    }
}