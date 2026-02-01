#include <stdio.h>

void printCalendar(int month, int year) {
    // Array with the number of days in each month
    int daysInMonth[] = {31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
    
    // Check for leap year
    if (year % 4 == 0 && (year % 100 != 0 || year % 400 == 0)) {
        daysInMonth[1] = 29;
    }

    // Zeller's Congruence algorithm to find the day of the week for the 1st of the month
    int q = 1;  // Day of the month
    int m = month < 3 ? month + 12 : month;  // Month (March = 3, ..., December = 12, January = 13, February = 14)
    if (month < 3) year -= 1;
    int K = year % 100;  // Year of the century
    int J = year / 100;  // Zero-based century

    int h = (q + 13 * (m + 1) / 5 + K + K / 4 + J / 4 + 5 * J) % 7;
    int startDay = ((h + 5) % 7) + 1;  // Converting to 1 = Monday, ..., 7 = Sunday

    // Print the calendar header
    printf("Calendar for %d-%d\n", month, year + (month < 3));
    printf("Mo Tu We Th Fr Sa Su\n");

    // Print initial spaces
    for (int i = 1; i < startDay; i++) {
        printf("   ");
    }

    // Print the days of the month
    for (int day = 1; day <= daysInMonth[month - 1]; day++) {
        printf("%2d ", day);
        if ((day + startDay - 1) % 7 == 0) {
            printf("\n");
        }
    }
    printf("\n");
}

int main() {
    int month, year;
    printf("Enter month and year (MM YYYY): ");
    scanf("%d %d", &month, &year);
    printCalendar(month, year);
    return 0;
}