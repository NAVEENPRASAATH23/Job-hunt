# SiliconQuest 🚀
### The RTL Career Accelerator & Job Tracker

Welcome to **SiliconQuest**, a premium, highly interactive single-page web application custom-built for **RTL (Register-Transfer Level) Design Engineers** with 2+ years of experience looking for their next opportunity in the semiconductor industry.

Since you don't need coding experience to use this app, we have designed it to be **plug-and-play**.

---

## 🛠️ How to Launch the Application

You can launch the app instantly using one of the methods below:

### Method 1: Direct Launch (No coding required)
1. Navigate to the folder where you saved this project (`Yasu-App`).
2. Double-click the **[index.html](file:///c:/Users/Admin/Documents/Yasu-App/index.html)** file.
3. It will open instantly in your default web browser (Chrome, Edge, Firefox, etc.).

### Method 2: Running a Local Dev Server
If you'd like hot-reloading or a standard local URL (e.g., `http://localhost:8000`), you can launch a simple server:
* **Option A (If you have Python installed)**: Open PowerShell/Command Prompt in this folder and run:
  ```powershell
  python -m http.server 8000
  ```
  Then open [http://localhost:8000](http://localhost:8000) in your browser.
  
* **Option B (If you have Node.js installed)**: Run:
  ```powershell
  npx serve
  ```
  Then open the URL shown in your terminal.

---

## 💡 Key Features for Your Fiancée

1. **Silicon Dashboard**:
   * Get a high-level view of application pipeline metrics.
   * View upcoming interviews automatically sorted by calendar order.
   * Tracks preparation accuracy and readiness levels across 4 key RTL disciplines: *Digital Logic, Verilog/SystemVerilog, Clock Domain Crossing (CDC), and Static Timing Analysis (STA)*.

2. **Job Tracker (Kanban Board)**:
   * Drag-and-drop or select states to transition job applications between *Wishlist, Applied, Tech Round, Manager/HR, and Offer Received*.
   * Add company, role, salary range, dates, career URLs, and keep a log of technical questions asked.
   * All data is stored in the browser's `localStorage`—no setup, databases, or accounts needed. It will reload automatically!

3. **Interview Prep Hub**:
   * **Flashcards**: Review complex concepts on setup/hold times, clock skew vs jitter, AXI/APB handshakes, reconvergence, and asynchronous FIFO design. Filter by topic and mark cards as "Mastered" to track progress.
   * **Practice Quiz**: Test expertise with multiple-choice questions. It provides instant visual grading and detailed explanations of the digital logic and synthesis constraints.

4. **Signal Architect (Interactive Waveform Visualizer)**:
   * Render professional SVG timing diagrams dynamically.
   * Click on cycles to toggle states (`0`, `1`, `X`, `Z` or custom `DATA` labels).
   * Pre-load templates for industry protocols: AXI4 Handshakes, APB Transfers, FIFO Flag Conditions, and 2-Flip-Flop Clock Domain Crossing logic.

5. **Company Directory**:
   * A curated list of **30+ top semiconductor firms** (NVIDIA, AMD, Intel, Apple, Qualcomm, Broadcom, ARM, Synopsys, etc.) listing typical RTL interview focus areas and direct career links.

6. **RTL Reference Library**:
   * Clean, synthesizable Verilog code templates for common interview tasks: *Synchronous FIFO, Odd Clock Divider (50% Duty Cycle), and Gray Code Counters*. Includes critical interview talking points (like latch prevention and clock edge mixing).
