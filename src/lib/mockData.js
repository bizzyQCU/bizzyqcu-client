// Sample data matching the Stitch and Figma screens. Replace with API calls later.
export const deliveryFee = 0; // Delivery is free for every option.
export const orderReference = "#BZ-2024-0891";

export const checkoutItems = [
  { id: 1, qty: 1, title: "Data Structures & Algo", meta: "Paperback • QCU Engineering", price: 450 },
  { id: 2, qty: 1, title: "Scientific Calculator..", meta: "Hardcase Shockproof", price: 180 },
];

export const orderItems = [
  { id: 1, title: "Data Structures & Algorithms Textbook", badge: "Like New", meta: "Qty 1 · College of Computer Studies", price: 450 },
  { id: 2, title: "QCU Official PE Shirt", badge: "Size Medium", meta: "Qty 1 · Official Campus Wear", price: 180 },
];

export const orderTimeline = [
  { label: "Order Placed", time: "10:14 AM", desc: "Item reservation registered in marketplace system", state: "done" },
  { label: "Payment confirmed", time: "10:15 AM", desc: "Payment recorded in BizzyQCU", state: "done" },
  { label: "Seller confirmed", time: "10:20 AM", desc: "Seller acknowledged meet-up and packaging order", state: "done" },
  { label: "Preparing", time: "10:28 AM", desc: "", state: "current" },
  { label: "Out for delivery or Ready for pickup", time: "eta 10:45 AM", desc: "Delivered to designated classroom zone", state: "todo" },
  { label: "Completed", time: "Pending", desc: "Marked complete after you confirm receipt", state: "todo" },
];

export const categories = ["All Categories", "Food & Beverage", "School Merchandise", "Academic & Books", "Electronics & Tools", "Dorm Gear"];
export const sellerTypes = ["Enterprise", "Organization", "Independent Seller"];

export const stores = [
  {
    id: 1, name: "QCU Bookworms Guild", initials: "QB", type: "Organization", category: "Academic & Books", price: "₱80 – ₱450", verified: true,
    desc: "Campus-approved pre-loved engineering textbooks and reviewers.",
    products: [
      { id: 101, title: "Data Structures & Algorithms", detail: "Good condition · Paperback", price: 450 },
      { id: 102, title: "Engineering Economy Reviewer", detail: "Like new · Printed", price: 80 },
    ],
  },
  {
    id: 2, name: "The Crafty Sparks", initials: "TC", type: "Enterprise", category: "School Merchandise", price: "₱45 – ₱320", verified: true,
    desc: "Official lanyard bundles, embroidered ID pins, and tote bags.",
    products: [
      { id: 201, title: "Official Lanyard Bundle", detail: "Set of 2 · Campus colors", price: 45 },
      { id: 202, title: "Embroidered ID Pin", detail: "Custom name · Made to order", price: 120 },
    ],
  },
  {
    id: 3, name: "Metro Silicon Lab", initials: "MS", type: "Enterprise", category: "Electronics & Tools", price: "₱150 – ₱1,200", verified: true,
    desc: "Arduino kits, testing probes, and breadboard starter packs.",
    products: [
      { id: 301, title: "Casio Scientific Calculator FX-991EX", detail: "Like new · With sliding cover", price: 180 },
      { id: 302, title: "Arduino Starter Kit", detail: "Complete · Tested", price: 1200 },
    ],
  },
  {
    id: 4, name: "Express Bites QC", initials: "EB", type: "Enterprise", category: "Food & Beverage", price: "₱35 – ₱120", verified: true,
    desc: "Fresh bakery pastries, cold brew bottles, and snack packs.",
    products: [
      { id: 401, title: "Cold Brew Bottle", detail: "350 ml · Chilled", price: 85 },
      { id: 402, title: "Pastry Box (4 pcs)", detail: "Baked this morning", price: 120 },
    ],
  },
  {
    id: 5, name: "Dorm Living Co.", initials: "DL", type: "Independent Seller", category: "Dorm Gear", price: "₱90 – ₱500", verified: true,
    desc: "Dorm essentials from independent student sellers.",
    products: [
      { id: 501, title: "Laundry Hamper", detail: "Foldable · Like new", price: 250 },
      { id: 502, title: "Desk Lamp", detail: "LED · Adjustable", price: 350 },
    ],
  },
  {
    id: 6, name: "Apex Study Kits", initials: "AS", type: "Enterprise", category: "Academic & Books", price: "₱70 – ₱400", verified: true,
    desc: "Reviewers, planners, and study bundles for finals week.",
    products: [
      { id: 601, title: "Finals Study Bundle", detail: "3 reviewers · Printed", price: 400 },
      { id: 602, title: "Weekly Planner", detail: "Undated · Spiral", price: 70 },
    ],
  },
  {
    id: 7, name: "QCU Print & Bind", initials: "PB", type: "Organization", category: "Academic & Books", price: "₱2 – ₱600", verified: true,
    desc: "Printing, binding, and thesis services for students.",
    products: [
      { id: 701, title: "Spiral Binding", detail: "Per copy · Up to 200 pages", price: 60 },
      { id: 702, title: "Thesis Hardbound", detail: "Gold stamp · Per copy", price: 600 },
    ],
  },
  {
    id: 8, name: "Kyusi Cafe Club", initials: "KC", type: "Organization", category: "Food & Beverage", price: "₱50 – ₱250", verified: true,
    desc: "Campus café goods, merch, and coffee beans.",
    products: [
      { id: 801, title: "Coffee Beans (250 g)", detail: "Medium roast", price: 250 },
      { id: 802, title: "Café Tumbler", detail: "Stainless · 500 ml", price: 150 },
    ],
  },
];

export const orders = [
  { id: "0891", status: "Preparing", seller: "Maria Santos", storeName: "The Crafty Sparks", total: 630, placed: "Placed today, Oct 26 · 10:14 AM", fulfillment: "Room delivery · Tech Bldg Room 402", tone: "amber" },
  { id: "0740", status: "Ready for pickup", seller: "Kevin Cruz", storeName: "Metro Silicon Lab", total: 850, placed: "Yesterday, 4:50 PM", fulfillment: "Pickup · Library Ground Gate", tone: "sky" },
  { id: "0777", status: "Out for delivery", seller: "Metro Silicon Lab", total: 250, placed: "Today, Oct 26 · 9:40 AM", fulfillment: "Room delivery · Library 3rd Floor", tone: "sky" },
  { id: "0612", status: "Completed", seller: "Andrea Torres", storeName: "Express Bites QC", total: 420, placed: "Oct 24, 2026", fulfillment: "Completed at Main Canteen", tone: "emerald" },
  { id: "0899", status: "Out for delivery", seller: "Alyssa Bautista", storeName: "QCU Print & Bind", total: 240, placed: "Today, 9:10 AM", fulfillment: "Room delivery · Main Bldg 210", tone: "sky" },
  { id: "0477", status: "Return requested", seller: "Kevin Cruz", storeName: "Metro Silicon Lab", total: 180, placed: "Oct 22, 2026", fulfillment: "Return requested · Calculator", tone: "rose" },
  { id: "0555", status: "Cancelled", seller: "Express Bites QC", storeName: "Express Bites QC", total: 180, placed: "Oct 20, 2026", fulfillment: "Cancelled by buyer", tone: "rose" },
];

export const conversations = [
  { id: 1, name: "Maria Santos", initials: "MS", order: "#BZ-2024-0891", preview: "I'm heading over now! I'm outside Room 402.", time: "10:32 AM", unread: true, online: true },
  { id: 2, name: "Kevin Cruz", initials: "KC", order: "#BZ-2024-0743", preview: "Calculator is ready for pickup at the...", time: "Yesterday", unread: false },
  { id: 3, name: "Alyssa Bautista", initials: "AB", order: "#BZ-2024-0412", preview: "Thank you so much! Received the...", time: "Oct 28", unread: false },
];

export const threads = {
  1: [
    { id: 1, type: "system", text: "Order status changed to Preparing · 10:20 AM" },
    { id: 2, from: "them", text: "Hi! I received your order for the Data Structures book and PE shirt. I will bring them to Tech Bldg Room 402 around 11 AM.", time: "10:22 AM" },
    { id: 3, from: "me", text: "Thank you Maria! Our class ends at 11:30 AM so that time is perfect. See you!", time: "10:25 AM" },
    { id: 4, type: "system", text: "Order status changed to Out for delivery · 10:30 AM" },
    { id: 5, from: "them", text: "I'm heading over now! I'm outside Room 402.", time: "10:32 AM" },
  ],
  2: [{ id: 1, from: "them", text: "Calculator is ready for pickup at the library gate.", time: "Yesterday" }],
  3: [{ id: 1, from: "them", text: "Thank you so much! Received the books.", time: "Oct 28" }],
};
