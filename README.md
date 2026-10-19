# 🎲 Dominoes Score Tracker

Ek simple, fast aur fully responsive web application jo 4 players ke Dominoes game ke points ko round-by-round calculate karta hai aur har match ka record mobile/browser memory me safely store karta hai.

---

## 📌 Features

- **4-Player Setup:** Har game se pehle sabhi 4 players ke customize naam enter karein.
- **Round-by-Round Tracking:** Har round ke points enter karne par live total automatically calculate hota hai.
- **Automatic Winner & Loser Detection:**
  - **Loser:** Pehla player jiske points **100 ya usse zyada** ho jayein, wo match haar jata hai.
  - **Winner:** 100 touch hote hi **sabse kam points** wala player winner ban jata hai.
- **Offline Storage (Local Data):** Internet ya database ki zaroorat nahi. Phone/browser ke `localStorage` me har game date, time aur complete score summary ke saath save rehta hai.
- **Mobile Friendly:** Clean UI jo phone browser me smooth chalta hai.

---

## 🕹️ Game Rules

1. Har round me 4 players apne-apne bache huye dominoes ke points add karte hain.
2. Target limit **100 points** set hai.
3. Jaise hi kisi player ka total $\ge 100$ hota hai:
   - Match turant finish ho jata hai.
   - 100 cross karne wala **Loser** banta hai.
   - Sabse kam score wala **Winner** declare hota hai.

---

## 📁 Project Structure
