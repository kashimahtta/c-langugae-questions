/*
TITLE: Sales Growth Analyzer
DESCRIPTION: Finds the continuous period with the greatest total profit.
STATEMENT:
Given an array of daily profits and losses, return the largest sum obtainable from any continuous sequence of days. A sequence may contain just one day.
*/int maximumProfitStreak(int profits[], int n) {
    if (n == 0) return 0;

    int currentSum = profits[0];
    int maximumSum = profits[0];

    for (int i = 1; i < n; i++) {
        currentSum = (profits[i] > currentSum + profits[i])
                         ? profits[i]
                         : currentSum + profits[i];

        if (currentSum > maximumSum) {
            maximumSum = currentSum;
        }
    }

    return maximumSum;
}
