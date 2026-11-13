/*
TITLE: Alternating Multiples Series
DESCRIPTION: Generates terms whose magnitudes are consecutive products and whose signs alternate.
STATEMENT:
Generate the first N terms. The magnitude of term n is n × (n + 2), starting with n = 1. Terms alternate positive, negative, beginning with a positive term.
*/

#include <stdlib.h>

void generate_series(int n, int result[]) {
    for (int i = 0; i < n; i++) {
        int term = (i + 1) * (i + 3);
        result[i] = (i % 2 == 0) ? term : -term;
    }
}