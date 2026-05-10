import java.util.ArrayList;
import java.util.Scanner;

// Hotel class
class Hotel {
    String name;
    String location;
    ArrayList<Room> rooms;

    Hotel(String name, String location) {
        this.name = name;
        this.location = location;
        this.rooms = new ArrayList<>();
    }
}

// Room class
class Room {
    int number;
    int floor;
    String view;
    double price;
    boolean available;

    Room(int number, int floor, String view, double price, boolean available) {
        this.number = number;
        this.floor = floor;
        this.view = view;
        this.price = price;
        this.available = available;
    }
}

// Guest class
class Guest {
    int number;
    String name;
    String phone;
    String ssd;

    Guest(int number, String name, String phone, String ssd) {
        this.number = number;
        this.name = name;
        this.phone = phone;
        this.ssd = ssd;
    }
}

public class Main {
    static ArrayList<Hotel> hotels = new ArrayList<>();
    static ArrayList<Guest> guests = new ArrayList<>();
    static Scanner input = new Scanner(System.in);

    public static void main(String[] args) {
        // Add sample data
        addSampleData();
        
        int choice;
        do {
            System.out.println("\n=== HOTEL MANAGEMENT SYSTEM ===");
            System.out.println("1. Add Hotel");
            System.out.println("2. Add Room to Hotel");
            System.out.println("3. Add Guest");
            System.out.println("4. Sort Hotels by Name");
            System.out.println("5. Sort Rooms by Number");
            System.out.println("6. Sort Guests by Number");
            System.out.println("7. Search Available Rooms");
            System.out.println("8. Search Guest by Number");
            System.out.println("9. Display All Data");
            System.out.println("10. Show Big O Complexity");
            System.out.println("0. Exit");
            System.out.print("Enter choice: ");
            choice = input.nextInt();
            input.nextLine(); // clear buffer

            if (choice == 1) addHotel();
            else if (choice == 2) addRoom();
            else if (choice == 3) addGuest();
            else if (choice == 4) sortHotels();
            else if (choice == 5) sortRooms();
            else if (choice == 6) sortGuests();
            else if (choice == 7) searchAvailableRooms();
            else if (choice == 8) searchGuest();
            else if (choice == 9) displayAll();
            else if (choice == 10) showBigO();
            
        } while (choice != 0);
        
        System.out.println("Goodbye!");
    }

    static void addSampleData() {
        // Add sample hotels
        Hotel h1 = new Hotel("Grand Plaza", "New York");
        h1.rooms.add(new Room(101, 1, "City View", 150.0, true));
        h1.rooms.add(new Room(202, 2, "Sea View", 250.0, false));
        h1.rooms.add(new Room(303, 3, "Garden View", 200.0, true));
        
        Hotel h2 = new Hotel("Beach Resort", "Miami");
        h2.rooms.add(new Room(104, 1, "Sea View", 300.0, true));
        h2.rooms.add(new Room(205, 2, "Pool View", 180.0, true));
        
        Hotel h3 = new Hotel("Alpine Lodge", "Denver");
        h3.rooms.add(new Room(301, 3, "Mountain View", 220.0, false));
        h3.rooms.add(new Room(102, 1, "Garden View", 130.0, true));
        
        hotels.add(h1);
        hotels.add(h2);
        hotels.add(h3);
        
        // Add sample guests
        guests.add(new Guest(1001, "John Doe", "555-0101", "123-45-6789"));
        guests.add(new Guest(1003, "Jane Smith", "555-0102", "987-65-4321"));
        guests.add(new Guest(1002, "Bob Johnson", "555-0103", "456-78-9012"));
        
        System.out.println("Sample data loaded! 3 Hotels and 3 Guests added.");
    }

    static void addHotel() {
        System.out.print("Enter hotel name: ");
        String name = input.nextLine();
        System.out.print("Enter location: ");
        String location = input.nextLine();
        hotels.add(new Hotel(name, location));
        System.out.println("Hotel added!");
    }

    static void addRoom() {
        if (hotels.size() == 0) {
            System.out.println("No hotels! Add a hotel first.");
            return;
        }
        
        System.out.println("Select hotel:");
        for (int i = 0; i < hotels.size(); i++) {
            System.out.println((i+1) + ". " + hotels.get(i).name);
        }
        System.out.print("Enter number: ");
        int hotelNum = input.nextInt();
        input.nextLine();
        
        if (hotelNum < 1 || hotelNum > hotels.size()) {
            System.out.println("Invalid hotel!");
            return;
        }
        
        System.out.print("Enter room number: ");
        int number = input.nextInt();
        System.out.print("Enter floor: ");
        int floor = input.nextInt();
        input.nextLine();
        System.out.print("Enter view: ");
        String view = input.nextLine();
        System.out.print("Enter price: ");
        double price = input.nextDouble();
        System.out.print("Is available? (true/false): ");
        boolean available = input.nextBoolean();
        input.nextLine();
        
        hotels.get(hotelNum-1).rooms.add(new Room(number, floor, view, price, available));
        System.out.println("Room added!");
    }

    static void addGuest() {
        System.out.print("Enter guest number: ");
        int number = input.nextInt();
        input.nextLine();
        System.out.print("Enter name: ");
        String name = input.nextLine();
        System.out.print("Enter phone: ");
        String phone = input.nextLine();
        System.out.print("Enter SSD: ");
        String ssd = input.nextLine();
        
        guests.add(new Guest(number, name, phone, ssd));
        System.out.println("Guest added!");
    }

    // BUBBLE SORT for Hotels
    static void bubbleSortHotels() {
        int n = hotels.size();
        for (int i = 0; i < n-1; i++) {
            for (int j = 0; j < n-i-1; j++) {
                if (hotels.get(j).name.compareTo(hotels.get(j+1).name) > 0) {
                    Hotel temp = hotels.get(j);
                    hotels.set(j, hotels.get(j+1));
                    hotels.set(j+1, temp);
                }
            }
        }
    }

    // INSERTION SORT for Hotels
    static void insertionSortHotels() {
        int n = hotels.size();
        for (int i = 1; i < n; i++) {
            Hotel key = hotels.get(i);
            int j = i - 1;
            while (j >= 0 && hotels.get(j).name.compareTo(key.name) > 0) {
                hotels.set(j+1, hotels.get(j));
                j--;
            }
            hotels.set(j+1, key);
        }
    }

    // SELECTION SORT for Hotels
    static void selectionSortHotels() {
        int n = hotels.size();
        for (int i = 0; i < n-1; i++) {
            int minIndex = i;
            for (int j = i+1; j < n; j++) {
                if (hotels.get(j).name.compareTo(hotels.get(minIndex).name) < 0) {
                    minIndex = j;
                }
            }
            Hotel temp = hotels.get(minIndex);
            hotels.set(minIndex, hotels.get(i));
            hotels.set(i, temp);
        }
    }

    static void sortHotels() {
        if (hotels.size() == 0) {
            System.out.println("No hotels to sort!");
            return;
        }
        
        System.out.println("Choose sorting algorithm:");
        System.out.println("1. Bubble Sort - O(n²)");
        System.out.println("2. Insertion Sort - O(n²)");
        System.out.println("3. Selection Sort - O(n²)");
        System.out.print("Enter choice: ");
        int choice = input.nextInt();
        input.nextLine();
        
        if (choice == 1) bubbleSortHotels();
        else if (choice == 2) insertionSortHotels();
        else if (choice == 3) selectionSortHotels();
        else {
            System.out.println("Invalid choice!");
            return;
        }
        
        System.out.println("\nSorted Hotels:");
        for (Hotel h : hotels) {
            System.out.println(h.name + " - " + h.location);
        }
    }

    // BUBBLE SORT for Rooms
    static void bubbleSortRooms(ArrayList<Room> rooms) {
        int n = rooms.size();
        for (int i = 0; i < n-1; i++) {
            for (int j = 0; j < n-i-1; j++) {
                if (rooms.get(j).number > rooms.get(j+1).number) {
                    Room temp = rooms.get(j);
                    rooms.set(j, rooms.get(j+1));
                    rooms.set(j+1, temp);
                }
            }
        }
    }

    // INSERTION SORT for Rooms
    static void insertionSortRooms(ArrayList<Room> rooms) {
        int n = rooms.size();
        for (int i = 1; i < n; i++) {
            Room key = rooms.get(i);
            int j = i - 1;
            while (j >= 0 && rooms.get(j).number > key.number) {
                rooms.set(j+1, rooms.get(j));
                j--;
            }
            rooms.set(j+1, key);
        }
    }

    // SELECTION SORT for Rooms
    static void selectionSortRooms(ArrayList<Room> rooms) {
        int n = rooms.size();
        for (int i = 0; i < n-1; i++) {
            int minIndex = i;
            for (int j = i+1; j < n; j++) {
                if (rooms.get(j).number < rooms.get(minIndex).number) {
                    minIndex = j;
                }
            }
            Room temp = rooms.get(minIndex);
            rooms.set(minIndex, rooms.get(i));
            rooms.set(i, temp);
        }
    }

    static void sortRooms() {
        if (hotels.size() == 0) {
            System.out.println("No hotels!");
            return;
        }
        
        System.out.println("Choose sorting algorithm:");
        System.out.println("1. Bubble Sort - O(n²)");
        System.out.println("2. Insertion Sort - O(n²)");
        System.out.println("3. Selection Sort - O(n²)");
        System.out.print("Enter choice: ");
        int choice = input.nextInt();
        input.nextLine();
        
        for (Hotel h : hotels) {
            if (choice == 1) bubbleSortRooms(h.rooms);
            else if (choice == 2) insertionSortRooms(h.rooms);
            else if (choice == 3) selectionSortRooms(h.rooms);
        }
        
        System.out.println("\nSorted Rooms:");
        for (Hotel h : hotels) {
            System.out.println("\n" + h.name + ":");
            for (Room r : h.rooms) {
                System.out.println("  Room " + r.number + " | Floor " + r.floor + 
                                 " | " + r.view + " | $" + r.price + 
                                 " | " + (r.available ? "Available" : "Occupied"));
            }
        }
    }

    // BUBBLE SORT for Guests
    static void bubbleSortGuests() {
        int n = guests.size();
        for (int i = 0; i < n-1; i++) {
            for (int j = 0; j < n-i-1; j++) {
                if (guests.get(j).number > guests.get(j+1).number) {
                    Guest temp = guests.get(j);
                    guests.set(j, guests.get(j+1));
                    guests.set(j+1, temp);
                }
            }
        }
    }

    // INSERTION SORT for Guests
    static void insertionSortGuests() {
        int n = guests.size();
        for (int i = 1; i < n; i++) {
            Guest key = guests.get(i);
            int j = i - 1;
            while (j >= 0 && guests.get(j).number > key.number) {
                guests.set(j+1, guests.get(j));
                j--;
            }
            guests.set(j+1, key);
        }
    }

    // SELECTION SORT for Guests
    static void selectionSortGuests() {
        int n = guests.size();
        for (int i = 0; i < n-1; i++) {
            int minIndex = i;
            for (int j = i+1; j < n; j++) {
                if (guests.get(j).number < guests.get(minIndex).number) {
                    minIndex = j;
                }
            }
            Guest temp = guests.get(minIndex);
            guests.set(minIndex, guests.get(i));
            guests.set(i, temp);
        }
    }

    static void sortGuests() {
        if (guests.size() == 0) {
            System.out.println("No guests to sort!");
            return;
        }
        
        System.out.println("Choose sorting algorithm:");
        System.out.println("1. Bubble Sort - O(n²)");
        System.out.println("2. Insertion Sort - O(n²)");
        System.out.println("3. Selection Sort - O(n²)");
        System.out.print("Enter choice: ");
        int choice = input.nextInt();
        input.nextLine();
        
        if (choice == 1) bubbleSortGuests();
        else if (choice == 2) insertionSortGuests();
        else if (choice == 3) selectionSortGuests();
        else {
            System.out.println("Invalid choice!");
            return;
        }
        
        System.out.println("\nSorted Guests:");
        for (Guest g : guests) {
            System.out.println("Guest #" + g.number + " | " + g.name + 
                             " | Phone: " + g.phone + " | SSD: " + g.ssd);
        }
    }

    static void searchAvailableRooms() {
        System.out.println("\n=== AVAILABLE ROOMS ===");
        boolean found = false;
        for (Hotel h : hotels) {
            for (Room r : h.rooms) {
                if (r.available) {
                    System.out.println(h.name + " - Room " + r.number + 
                                     " | " + r.view + " | $" + r.price);
                    found = true;
                }
            }
        }
        if (!found) {
            System.out.println("No available rooms found.");
        }
    }

    static void searchGuest() {
        System.out.print("Enter guest number to search: ");
        int searchNum = input.nextInt();
        input.nextLine();
        
        boolean found = false;
        for (Guest g : guests) {
            if (g.number == searchNum) {
                System.out.println("Found: Guest #" + g.number + " | " + g.name + 
                                 " | Phone: " + g.phone + " | SSD: " + g.ssd);
                found = true;
                break;
            }
        }
        if (!found) {
            System.out.println("Guest not found!");
        }
    }

    static void displayAll() {
        System.out.println("\n=== ALL HOTELS ===");
        for (Hotel h : hotels) {
            System.out.println("\n" + h.name + " (" + h.location + ")");
            for (Room r : h.rooms) {
                System.out.println("  Room " + r.number + " | Floor " + r.floor + 
                                 " | " + r.view + " | $" + r.price + 
                                 " | " + (r.available ? "Available" : "Occupied"));
            }
        }
        
        System.out.println("\n=== ALL GUESTS ===");
        for (Guest g : guests) {
            System.out.println("Guest #" + g.number + " | " + g.name + 
                             " | Phone: " + g.phone + " | SSD: " + g.ssd);
        }
    }

    static void showBigO() {
        System.out.println("\n=== BIG O COMPLEXITY ANALYSIS ===");
        System.out.println("┌─────────────────────────────────────────────┐");
        System.out.println("│ 1. SORTING ALGORITHMS:                      │");
        System.out.println("│    • Bubble Sort:    O(n²)                  │");
        System.out.println("│    • Insertion Sort: O(n²)                  │");
        System.out.println("│    • Selection Sort: O(n²)                  │");
        System.out.println("│    Where n = number of items to sort        │");
        System.out.println("├─────────────────────────────────────────────┤");
        System.out.println("│ 2. SEARCH OPERATIONS:                       │");
        System.out.println("│    • Available Rooms: O(h × r)              │");
        System.out.println("│      h = hotels, r = rooms per hotel        │");
        System.out.println("│    • Guest Search:    O(g)                  │");
        System.out.println("│      g = number of guests                   │");
        System.out.println("├─────────────────────────────────────────────┤");
        System.out.println("│ 3. OVERALL COMPLEXITY:                      │");
        System.out.println("│    • Time: O(max(n², h×r))                  │");
        System.out.println("│    • Space: O(n) for data storage           │");
        System.out.println("├─────────────────────────────────────────────┤");
        System.out.println("│ 4. ALGORITHM COMPARISON:                    │");
        System.out.println("│    • Bubble: Most swaps, stable             │");
        System.out.println("│    • Insertion: Best for small data         │");
        System.out.println("│    • Selection: Minimum swaps               │");
        System.out.println("└─────────────────────────────────────────────┘");
    }
}