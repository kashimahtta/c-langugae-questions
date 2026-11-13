/*
TITLE: Library Reading Tracker
DESCRIPTION: Counts how many days a student reads at least 20 pages.
STATEMENT:
Given an array of daily page counts, return the number of days with at least 20 pages read.
*/int count_reading_days(int pages[], int n) {
    int count = 0;

    for (int i = 0; i < n; i++) {
        if (pages[i] >= 20) {
            count++;
        }
    }

    return count;
}