/*
TITLE: Available Parking Spaces
DESCRIPTION: Counts the available spaces in a smart parking lot.
STATEMENT:
Given an array where 0 represents an available space and 1 represents an occupied space, return the number of available spaces.
*/int count_available_slots(int spaces[], int n) {
    int count = 0;

    for (int i = 0; i < n; i++) {
        if (spaces[i] == 0) {
            count++;
        }
    }

    return count;
}