/*
TITLE: Maximum Network Coverage
DESCRIPTION: Finds the greatest coverage possible between two network tower locations.
STATEMENT:
Given an array of signal strengths, choose exactly two locations. Their coverage is the smaller signal strength multiplied by the distance between the locations. Return the maximum possible coverage.
*/int maximumNetworkCoverage(int signalStrength[], int n) {
    int left = 0;
    int right = n - 1;
    int maxCoverage = 0;

    while (left < right) {
        int height = signalStrength[left] < signalStrength[right]
                         ? signalStrength[left]
                         : signalStrength[right];

        int coverage = height * (right - left);

        if (coverage > maxCoverage) {
            maxCoverage = coverage;
        }

        if (signalStrength[left] < signalStrength[right]) {
            left++;
        } else {
            right--;
        }
    }

    return maxCoverage;
}