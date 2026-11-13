/*
TITLE: Prime-Based Alternate Series
DESCRIPTION: Generates a prime number series with alternating signs.
STATEMENT:
Generate the first N terms using the prime sequence 2, 3, 5, 7, 11, and so on. Keep the first term positive; for later terms, use a positive sign at odd indices and a negative sign at even indices. Return the generated terms and the requested sum.
*/int isPrime(int number) {
    if (number < 2) return 0;

    for (int divisor = 2; divisor * divisor <= number; divisor++) {
        if (number % divisor == 0) return 0;
    }

    return 1;
}

void generatePrimeBasedSeries(int n, int series[]) {
    int prime = 2;
    int index = 0;

    while (index < n) {
        if (isPrime(prime)) {
            if (index == 0 || index % 2 == 1) {
                series[index] = prime;
            } else {
                series[index] = -prime;
            }
            index++;
        }
        prime++;
    }
}