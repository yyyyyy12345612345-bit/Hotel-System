import java.util.ArrayList;
import java.util.Scanner;

// ==========================================
// 🔴 DATABASE IMPORTS START
// ==========================================
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.*;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;
import java.io.FileInputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.concurrent.ExecutionException;
import com.google.api.core.ApiFuture;
// ==========================================
// 🔴 DATABASE IMPORTS END
// ==========================================

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

    // --- Database Helper Constructor ---
    Room(Map<String, Object> map) {
        this.number = ((Long) map.get("number")).intValue();
        this.floor = ((Long) map.get("floor")).intValue();
        this.view = (String) map.get("view");
        this.price = (map.get("price") instanceof Integer) ? ((Integer) map.get("price")).doubleValue() : (Double) map.get("price");
        this.available = (Boolean) map.get("available");
    }

    Map<String, Object> toMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("number", number);
        map.put("floor", floor);
        map.put("view", view);
        map.put("price", price);
        map.put("available", available);
        return map;
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

class Main {
    static ArrayList<Hotel> hotels = new ArrayList<>();
    static ArrayList<Guest> guests = new ArrayList<>();
    static Scanner input = new Scanner(System.in);

    // ==========================================
    // 🔴 DATABASE INSTANCE START
    // ==========================================
    static Firestore db;
    // ==========================================

    public static void main(String[] args) {
        
        // ==========================================
        // 🔴 DATABASE INITIALIZATION START
        // ==========================================
        try {
            FileInputStream serviceAccount = new FileInputStream("serviceAccountKey.json");
            FirebaseOptions options = new FirebaseOptions.Builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .build();
            FirebaseApp.initializeApp(options);
            db = FirestoreClient.getFirestore();
            syncFromFirebase(); // Get cloud data
            System.out.println("✅ Firebase Connected Successfully!");
        } catch (java.io.FileNotFoundException fnf) {
            System.out.println("❌ ERROR: serviceAccountKey.json not found!");
            System.out.println("   Download it from: Firebase Console > Project Settings > Service Accounts");
            System.out.println("   Place it in: " + System.getProperty("user.dir"));
            System.out.println("   Loading local sample data...");
            addSampleData(); 
        } catch (Exception e) {
            System.out.println("❌ Firebase Error: " + e.getMessage());
            System.out.println("   Loading local sample data...");
            addSampleData(); 
        }
        // ==========================================
        
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
            System.out.println("11. Force Database Sync");
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
            else if (choice == 11) { try { syncFromFirebase(); } catch (Exception e) {} }
            
        } while (choice != 0);
        
        System.out.println("Goodbye!");
    }

    // ==========================================
    // 🔴 DATABASE SYNC METHOD START
    // ==========================================
    static void syncFromFirebase() throws ExecutionException, InterruptedException {
        if (db == null) return;
        hotels.clear();
        guests.clear();
        ApiFuture<QuerySnapshot> hQ = db.collection("hotels").get();
        for (QueryDocumentSnapshot doc : hQ.get().getDocuments()) {
            Hotel h = new Hotel(doc.getString("name"), doc.getString("location"));
            List<Map<String, Object>> rList = (List<Map<String, Object>>) doc.get("rooms");
            if (rList != null) for (Map<String, Object> rMap : rList) h.rooms.add(new Room(rMap));
            hotels.add(h);
        }
        ApiFuture<QuerySnapshot> gQ = db.collection("guests").get();
        for (QueryDocumentSnapshot doc : gQ.get().getDocuments()) {
            guests.add(new Guest(doc.getLong("number").intValue(), doc.getString("name"), doc.getString("phone"), doc.getString("ssd")));
        }
        System.out.println("Database Synced Successfully.");
    }
    // ==========================================

    static void addSampleData() {
        // Add sample data if offline
        Hotel h1 = new Hotel("Grand Plaza", "New York");
        h1.rooms.add(new Room(101, 1, "City View", 150.0, true));
        hotels.add(h1);
    }

    static void addHotel() {
        System.out.print("Enter hotel name: ");
        String name = input.nextLine();
        System.out.print("Enter location: ");
        String location = input.nextLine();

        // 🔴 DATABASE UPLOAD
        if (db != null) {
            Map<String, Object> d = new HashMap<>(); d.put("name", name); d.put("location", location); d.put("rooms", new ArrayList<>());
            db.collection("hotels").add(d);
            try { syncFromFirebase(); } catch (Exception e) {}
        } else {
            hotels.add(new Hotel(name, location));
        }
        System.out.println("Hotel added!");
    }

    static void addRoom() {
        if (hotels.size() == 0) return;
        for (int i = 0; i < hotels.size(); i++) System.out.println((i+1) + ". " + hotels.get(i).name);
        int hotelNum = input.nextInt(); input.nextLine();
        if (hotelNum < 1 || hotelNum > hotels.size()) return;
        
        System.out.print("Enter room number: "); int number = input.nextInt();
        System.out.print("Enter floor: "); int floor = input.nextInt(); input.nextLine();
        System.out.print("Enter view: "); String view = input.nextLine();
        System.out.print("Enter price: "); double price = input.nextDouble();
        System.out.print("Is available? (true/false): "); boolean available = input.nextBoolean();
        
        Room r = new Room(number, floor, view, price, available);

        // 🔴 DATABASE UPLOAD
        if (db != null) {
            try {
                ApiFuture<QuerySnapshot> q = db.collection("hotels").whereEqualTo("name", hotels.get(hotelNum-1).name).get();
                db.collection("hotels").document(q.get().getDocuments().get(0).getId()).update("rooms", FieldValue.arrayUnion(r.toMap()));
                syncFromFirebase();
            } catch (Exception e) {}
        } else {
            hotels.get(hotelNum-1).rooms.add(r);
        }
        System.out.println("Room added!");
    }

    static void addGuest() {
        System.out.print("Enter guest number: "); int number = input.nextInt(); input.nextLine();
        System.out.print("Enter name: "); String name = input.nextLine();
        System.out.print("Enter phone: "); String phone = input.nextLine();
        System.out.print("Enter SSD: "); String ssd = input.nextLine();
        
        // 🔴 DATABASE UPLOAD
        if (db != null) {
            Map<String, Object> d = new HashMap<>(); d.put("number", number); d.put("name", name); d.put("phone", phone); d.put("ssd", ssd);
            db.collection("guests").add(d);
            try { syncFromFirebase(); } catch (Exception e) {}
        } else {
            guests.add(new Guest(number, name, phone, ssd));
        }
        System.out.println("Guest added!");
    }

    // --- ALGORITHMS ---
    static void bubbleSortHotels() {
        int n = hotels.size();
        for (int i = 0; i < n-1; i++)
            for (int j = 0; j < n-i-1; j++)
                if (hotels.get(j).name.compareTo(hotels.get(j+1).name) > 0) {
                    Hotel temp = hotels.get(j); hotels.set(j, hotels.get(j+1)); hotels.set(j+1, temp);
                }
    }

    static void insertionSortHotels() {
        for (int i = 1; i < hotels.size(); i++) {
            Hotel key = hotels.get(i); int j = i - 1;
            while (j >= 0 && hotels.get(j).name.compareTo(key.name) > 0) { hotels.set(j+1, hotels.get(j)); j--; }
            hotels.set(j+1, key);
        }
    }

    static void selectionSortHotels() {
        for (int i = 0; i < hotels.size()-1; i++) {
            int m = i;
            for (int j = i+1; j < hotels.size(); j++) if (hotels.get(j).name.compareTo(hotels.get(m).name) < 0) m = j;
            Hotel t = hotels.get(m); hotels.set(m, hotels.get(i)); hotels.set(i, t);
        }
    }

    static void sortHotels() {
        if (hotels.isEmpty()) return;
        System.out.println("1. Bubble | 2. Insertion | 3. Selection");
        int choice = input.nextInt();
        if (choice == 1) bubbleSortHotels(); else if (choice == 2) insertionSortHotels(); else selectionSortHotels();
        displayAll();
    }

    static void bubbleSortRooms(ArrayList<Room> r) {
        for (int i = 0; i < r.size()-1; i++)
            for (int j = 0; j < r.size()-i-1; j++)
                if (r.get(j).number > r.get(j+1).number) { Room t = r.get(j); r.set(j, r.get(j+1)); r.set(j+1, t); }
    }

    static void insertionSortRooms(ArrayList<Room> r) {
        for (int i = 1; i < r.size(); i++) {
            Room k = r.get(i); int j = i - 1;
            while (j >= 0 && r.get(j).number > k.number) { r.set(j+1, r.get(j)); j--; }
            r.set(j+1, k);
        }
    }

    static void selectionSortRooms(ArrayList<Room> r) {
        for (int i = 0; i < r.size()-1; i++) {
            int m = i;
            for (int j = i+1; j < r.size(); j++) if (r.get(j).number < r.get(m).number) m = j;
            Room t = r.get(m); r.set(m, r.get(i)); r.set(i, t);
        }
    }

    static void sortRooms() {
        if (hotels.isEmpty()) return;
        System.out.println("1. Bubble | 2. Insertion | 3. Selection");
        int choice = input.nextInt();
        for (Hotel h : hotels) {
            if (choice == 1) bubbleSortRooms(h.rooms); else if (choice == 2) insertionSortRooms(h.rooms); else selectionSortRooms(h.rooms);
        }
        displayAll();
    }

    static void bubbleSortGuests() {
        for (int i = 0; i < guests.size()-1; i++)
            for (int j = 0; j < guests.size()-i-1; j++)
                if (guests.get(j).number > guests.get(j+1).number) { Guest t = guests.get(j); guests.set(j, guests.get(j+1)); guests.set(j+1, t); }
    }

    static void insertionSortGuests() {
        for (int i = 1; i < guests.size(); i++) {
            Guest k = guests.get(i); int j = i - 1;
            while (j >= 0 && guests.get(j).number > k.number) { guests.set(j+1, guests.get(j)); j--; }
            guests.set(j+1, k);
        }
    }

    static void selectionSortGuests() {
        for (int i = 0; i < guests.size()-1; i++) {
            int m = i;
            for (int j = i+1; j < guests.size(); j++) if (guests.get(j).number < guests.get(m).number) m = j;
            Guest t = guests.get(m); guests.set(m, guests.get(i)); guests.set(i, t);
        }
    }

    static void sortGuests() {
        if (guests.isEmpty()) return;
        System.out.println("1. Bubble | 2. Insertion | 3. Selection");
        int choice = input.nextInt();
        if (choice == 1) bubbleSortGuests(); else if (choice == 2) insertionSortGuests(); else selectionSortGuests();
        displayAll();
    }

    static void searchAvailableRooms() {
        System.out.println("\n=== AVAILABLE ROOMS ===");
        for (Hotel h : hotels)
            for (Room r : h.rooms)
                if (r.available) System.out.println(h.name + " - Room " + r.number + " | $" + r.price);
    }

    static void searchGuest() {
        System.out.print("Enter guest number: ");
        int num = input.nextInt();
        for (Guest g : guests) if (g.number == num) { System.out.println("Found: " + g.name); return; }
        System.out.println("Guest not found!");
    }

    static void displayAll() {
        System.out.println("\n=== ALL HOTELS ===");
        for (Hotel h : hotels) {
            System.out.println("\n" + h.name + " (" + h.location + ")");
            for (Room r : h.rooms) System.out.println("  Room " + r.number + " | " + (r.available ? "Avail" : "Occ"));
        }
        System.out.println("\n=== ALL GUESTS ===");
        for (Guest g : guests) System.out.println("Guest #" + g.number + " | " + g.name);
    }

    static void showBigO() {
        System.out.println("\n=== BIG O COMPLEXITY ANALYSIS ===");
        System.out.println("Sorting: O(n^2) | Search: O(n) | Database: O(n)");
    }
}