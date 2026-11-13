/*
TITLE: Employee ID Consecutive Attendance
DESCRIPTION: Finds the length of the longest group of consecutive employee IDs.
STATEMENT:
Given an unsorted array of employee IDs that may contain duplicates, return the length of the longest sequence of consecutive integer IDs. Count duplicate IDs only once.
*/
int longestAttendanceGroup(int ids[], int n) {
    if (n == 0) return 0;

    int longest = 1;

    for (int i = 0; i < n; i++) {
        int length = 1;
        int nextId = ids[i] + 1;

        while (1) {
            int found = 0;

            for (int j = 0; j < n; j++) {
                if (ids[j] == nextId) {
                    found = 1;
                    break;
                }
            }

            if (!found) break;

            length++;
            nextId++;
        }

        if (length > longest) {
            longest = length;
        }
    }

    return longest;
}