const mockData = {
  rtlQuestions: [
    {
      id: "q1",
      category: "Static Timing Analysis (STA)",
      question: "Which of the following techniques is most effective for fixing a setup time violation?",
      options: [
        "Adding buffers along the clock path to delay the clock arrival at the destination flip-flop",
        "Reducing the clock frequency or sizing up the driver cells in the critical data path",
        "Adding delay buffers along the data path to delay data arrival",
        "Decreasing the supply voltage of the critical path cells"
      ],
      answer: 1,
      explanation: "Setup time violation occurs when the data path is too slow relative to the clock period. To fix it, you can either: 1) Increase the clock period (reduce clock frequency), 2) Speed up the data path (size up driver cells, reduce logic depth, use low-Vt cells), or 3) Delay the clock arrival at the destination flip-flop (useful if there is positive skew slack, but can cause hold violations elsewhere)."
    },
    {
      id: "q2",
      category: "Clock Domain Crossing (CDC)",
      question: "Why is a standard 2-Flip-Flop (2-FF) synchronizer NOT suitable for synchronizing multi-bit data buses between asynchronous clock domains?",
      options: [
        "Because it introduces too much latency for buses",
        "Because individual bits will experience different routing delays, leading to corrupted data values (reconvergence issues)",
        "Because the flip-flops in the synchronizer will burn too much dynamic power",
        "Because it is impossible to instantiate multiple synchronizers in Verilog"
      ],
      answer: 1,
      explanation: "When synchronizing a multi-bit bus using a 2-FF synchronizer on each bit, the bits will experience different routing delays. The destination clock domain may sample some bits on one clock edge and other bits on the next edge, leading to a corrupted intermediate data value (data reconvergence). For multi-bit buses, you should use techniques like Gray coding (for FIFO pointers), handshaking (REQ/ACK), or an Asynchronous FIFO."
    },
    {
      id: "q3",
      category: "Digital Design & FSMs",
      question: "In a Mealy state machine, how does the output behave compared to a Moore state machine?",
      options: [
        "The output depends only on the current state.",
        "The output depends on both the current state and the current inputs, making it respond immediately to input changes.",
        "The output changes only on the falling edge of the clock.",
        "The output is always registered, introducing a 1-clock-cycle delay."
      ],
      answer: 1,
      explanation: "In a Mealy machine, the output is a function of both the current state and the inputs. This means if the input changes, the output can change immediately within the same clock cycle. In contrast, a Moore machine's output depends *only* on the current state, meaning outputs only change on clock transitions when the state changes."
    },
    {
      id: "q4",
      category: "Verilog / SystemVerilog",
      question: "What is the critical rule regarding blocking (=) and non-blocking (<=) assignments in RTL design?",
      options: [
        "Always use non-blocking assignments for combinational logic and blocking assignments for sequential logic.",
        "Always use blocking assignments for sequential logic and non-blocking for testbenches.",
        "Always use non-blocking assignments (<=) for sequential logic (triggered by clock edges) and blocking assignments (=) for combinational logic.",
        "Both can be mixed freely in any always block."
      ],
      answer: 2,
      explanation: "To prevent simulation-synthesis mismatches and race conditions: 1) Use non-blocking assignments (<=) when modeling sequential logic (e.g., always @(posedge clk)). 2) Use blocking assignments (=) when modeling combinational logic (e.g., always @* or always_comb)."
    },
    {
      id: "q5",
      category: "Bus Protocols",
      question: "In the AMBA APB protocol, which control signal is asserted to indicate the second and subsequent cycles of an APB transfer?",
      options: [
        "PSEL",
        "PWRITE",
        "PENABLE",
        "PREADY"
      ],
      answer: 2,
      explanation: "In an APB transfer, PSEL is asserted in the Setup phase. PENABLE is asserted in the Access phase (which is the second cycle). PREADY is driven by the slave to indicate if it can complete the transfer."
    },
    {
      id: "q6",
      category: "Static Timing Analysis (STA)",
      question: "What is a hold time violation and how is it typically resolved in the layout phase?",
      options: [
        "Data arrives too slowly at the destination register; solved by increasing the clock frequency.",
        "Data changes too quickly after the clock edge, before it can be reliably captured; solved by inserting delay buffers in the data path.",
        "The clock signal is too slow; solved by using wider wires for the clock tree.",
        "Reset signal takes too long to deassert; solved by removing reset synchronizers."
      ],
      answer: 1,
      explanation: "A hold violation occurs when the data changes too quickly after the clock edge, overwriting the data before the destination register can capture it. To fix this, delay buffers are inserted into the data path to slow down the data relative to the clock. Hold violations do NOT depend on the clock period/frequency, so changing the frequency will not fix them."
    },
    {
      id: "q7",
      category: "Verilog / SystemVerilog",
      question: "What is the difference between a logic type and a wire type in SystemVerilog?",
      options: [
        "Wire can only have values 0 and 1, whereas logic can also have X and Z.",
        "Logic can be assigned both in procedural blocks (always) and continuous assignments (assign), but cannot have multiple drivers. Wire supports multiple drivers.",
        "Logic is a physical register, while wire is a physical connection.",
        "Wire is used only in verification, and logic is used only in synthesis."
      ],
      answer: 1,
      explanation: "In SystemVerilog, the `logic` data type replaces both `reg` and `wire` in most cases. It can be assigned in continuous assignments (`assign`) or inside procedural blocks (`always`). However, `logic` does not support multiple drivers (e.g., tri-state buses); for multiple drivers, a net type like `wire` must be used."
    },
    {
      id: "q8",
      category: "Clock Domain Crossing (CDC)",
      question: "What is 'metastability' in digital logic designs?",
      options: [
        "A state where the voltage levels are perfectly valid at logic 1.",
        "A temporary unstable state where a flip-flop's output oscillates or hovers between 0 and 1 because setup or hold times were violated.",
        "A condition where the clock tree burns too much power.",
        "An intentional delay introduced into synchronous pipelines."
      ],
      answer: 1,
      explanation: "Metastability is an unstable state that occurs when a flip-flop's setup or hold time is violated (e.g., when asynchronous inputs change near the clock edge). The internal feedback loops of the flip-flop fail to settle to a stable logic 0 or 1 in time, causing the output to hover at an intermediate voltage or oscillate before resolving."
    }
  ],

  rtlFlashcards: [
    {
      id: "f1",
      category: "Digital Design",
      front: "What is a Glitch in combinational logic, and how can it be avoided?",
      back: "A glitch (or hazard) is a temporary unwanted transition at the output of a combinational circuit caused by different propagation delays of input signals along different paths. It can be avoided by: \n1) Inserting redundant terms in the Karnaugh map (hazard-free design).\n2) Registering (filtering) the output of the combinational logic with a flip-flop."
    },
    {
      id: "f2",
      category: "Clock Domain Crossing (CDC)",
      front: "Why is a Gray code preferred over binary for Asynchronous FIFO pointers?",
      back: "Gray code changes by only one bit at a time during transitions (e.g., 001 -> 011). If a binary counter is used (e.g., 011 -> 100, which changes 3 bits), different bits would arrive at the synchronizer in the destination clock domain with slight skew, resulting in illegal intermediate binary counts. Single-bit transitions in Gray code prevent this corruption."
    },
    {
      id: "f3",
      category: "Static Timing Analysis (STA)",
      front: "What is Clock Skew vs Clock Jitter?",
      back: "• Clock Skew is the difference in clock arrival times at different flip-flops due to different physical wire lengths and buffer delays in the clock distribution network. Skew can be positive (clock arrives at destination later than source) or negative.\n• Clock Jitter is the cycle-to-cycle variation in the clock period due to power supply noise, thermal variation, and PLL phase noise."
    },
    {
      id: "f4",
      category: "Bus Protocols",
      front: "Explain the AXI4 VALID/READY Handshake protocol.",
      back: "AXI uses a symmetric two-way handshaking mechanism:\n• The transmitter asserts VALID when data/control information is available.\n• The receiver asserts READY when it can accept the data.\n• A transfer occurs ONLY in the clock cycle where both VALID and READY are asserted high at the rising edge. Neither transmitter nor receiver must wait for the other to assert its signal."
    },
    {
      id: "f5",
      category: "Verilog / SystemVerilog",
      front: "What is the purpose of 'always_comb', 'always_ff', and 'always_latch' in SystemVerilog?",
      back: "They enforce design intent and allow tools (lint/synthesis) to flag errors:\n• `always_comb` checks that the block represents combinational logic (no latches generated, automatic sensitivity list).\n• `always_ff` checks that the block translates to flip-flops (requires a clock/reset trigger, flags warning if flip-flops are not created).\n• `always_latch` guarantees latch logic."
    },
    {
      id: "f6",
      category: "Clock Domain Crossing (CDC)",
      front: "Explain the concept of 'Reconvergence' in CDC.",
      back: "Reconvergence occurs when two signals synchronized separately from the same source clock domain are combined (passed into logic) in the destination clock domain. Even if both signals are correctly synchronized (e.g., via separate 2-FF synchronizers), their relative cycle relationship might be altered, leading to incorrect state transition in the destination domain. They must be grouped and synchronized together."
    }
  ],

  companies: [
    {
      name: "NVIDIA",
      type: "Fabless",
      focus: "High-performance GPU pipelines, tensor cores, cache architectures, PCIe/NVLink protocols, high-speed interconnects, and strict clock domain crossing (CDC) validation.",
      careersLink: "https://www.nvidia.com/en-us/about-nvidia/careers/",
      difficulty: 5,
      locations: ["Santa Clara, CA", "Austin, TX", "Bengaluru, India", "Hsinchu, Taiwan", "Shanghai, China"],
      keywords: ["Verilog", "SystemVerilog", "CDC", "AXI", "PCIe", "GPU", "NVLink", "cache", "pipelines"]
    },
    {
      name: "AMD",
      type: "Fabless",
      focus: "CPU/GPU core execution pipelines, branch predictors, cache coherency protocols (MOESI), Infinity Fabric routing logic, DDR/HBM memory controllers, and advanced RTL synthesis and static timing analysis.",
      careersLink: "https://www.amd.com/en/corporate/careers",
      difficulty: 5,
      locations: ["Austin, TX", "Boxborough, MA", "Bengaluru, India", "Shanghai, China", "Hsinchu, Taiwan"],
      keywords: ["Verilog", "SystemVerilog", "CPU", "GPU", "cache", "coherency", "DDR", "HBM", "STA", "synthesis"]
    },
    {
      name: "Intel",
      type: "IDM",
      focus: "X86 processor design, network-on-chip (NoC) systems, PCIe Gen5/Gen6 interfaces, low-power states, silicon debug logic, DFT (Design for Test) integration, and extensive SystemVerilog RTL.",
      careersLink: "https://www.intel.com/content/www/us/en/jobs/locations.html",
      difficulty: 4.5,
      locations: ["Hillsboro, OR", "Chandler, AZ", "Austin, TX", "Haifa, Israel", "Bengaluru, India"],
      keywords: ["Verilog", "SystemVerilog", "x86", "PCIe", "NoC", "DFT", "power gating", "debug"]
    },
    {
      name: "Qualcomm",
      type: "Fabless",
      focus: "Low-power mobile SoC architectures, ARM-based core integration, 5G/Wi-Fi modem baseband logic, power management (DVFS/power domains), AMBA AXI/AHB protocols, and formal verification.",
      careersLink: "https://www.qualcomm.com/company/careers",
      difficulty: 4.5,
      locations: ["San Diego, CA", "Austin, TX", "Bengaluru, India", "Hyderabad, India", "Munich, Germany"],
      keywords: ["Verilog", "SystemVerilog", "SoC", "UVM", "AXI", "AHB", "ARM", "modem", "low-power", "formal"]
    },
    {
      name: "Apple",
      type: "Fabless",
      focus: "Highly optimized custom CPU and GPU cores (M-series, A-series), neural engine blocks, tightly constrained area and power metrics, custom interconnects, and clock-gating methodologies.",
      careersLink: "https://www.apple.com/careers/",
      difficulty: 5,
      locations: ["Cupertino, CA", "Austin, TX", "Munich, Germany", "Herzliya, Israel", "Shenzhen, China"],
      keywords: ["Verilog", "SystemVerilog", "CPU", "GPU", "low-power", "clock gating", "neural engine", "cache", "performance"]
    },
    {
      name: "Broadcom",
      type: "Fabless",
      focus: "Extremely high-throughput switch fabrics, ethernet controllers, SerDes integration, buffer management logic, hardware packet parsers, and custom queue management systems.",
      careersLink: "https://www.broadcom.com/company/careers",
      difficulty: 4.5,
      locations: ["San Jose, CA", "Irvine, CA", "Bengaluru, India", "Tel Aviv, Israel", "Singapore"],
      keywords: ["Verilog", "SystemVerilog", "SerDes", "ethernet", "buffer", "packets", "queues", "high-throughput"]
    },
    {
      name: "ARM",
      type: "IP/EDA",
      focus: "IP block design, generic microprocessor architectures, AMBA protocol specification development (CHI/AXI/APB), pipeline safety/parity checks, and highly parameterized Verilog/SystemVerilog design.",
      careersLink: "https://www.arm.com/company/careers",
      difficulty: 4.8,
      locations: ["Cambridge, UK", "Austin, TX", "San Jose, CA", "Bengaluru, India", "Sophia Antipolis, France"],
      keywords: ["Verilog", "SystemVerilog", "ARM", "AMBA", "AXI", "CHI", "APB", "pipeline", "IP Design"]
    },
    {
      name: "Texas Instruments (TI)",
      type: "IDM",
      focus: "Mixed-signal IC design, MCU architectures, analog-digital interfaces (ADCs/DACs), SPI/I2C peripheral cores, low-power FSMs, and design for automotive safety standard ISO 26262.",
      careersLink: "https://careers.ti.com/",
      difficulty: 4,
      locations: ["Dallas, TX", "Freising, Germany", "Bengaluru, India", "Shanghai, China", "Tokyo, Japan"],
      keywords: ["Verilog", "SystemVerilog", "analog", "ADC", "DAC", "SPI", "I2C", "FSM", "automotive", "low-power"]
    },
    {
      name: "Synopsys",
      type: "IP/EDA",
      focus: "Designware IP blocks (USB, DDR, PCIe, HDMI), logic synthesis tool modeling, SystemVerilog compiler frontends, verification IP (VIP) development, and advanced EDA tool flows.",
      careersLink: "https://www.synopsys.com/careers.html",
      difficulty: 4.2,
      locations: ["Mountain View, CA", "Austin, TX", "Bengaluru, India", "Hsinchu, Taiwan", "Seoul, South Korea"],
      keywords: ["Verilog", "SystemVerilog", "UVM", "DDR", "PCIe", "USB", "synthesis", "VIP", "EDA"]
    },
    {
      name: "Cadence",
      type: "IP/EDA",
      focus: "Verification IP, PCIe/DDR controller IP blocks, emulation platforms (Palladium), synthesis compiler engines, and RTL-to-GDSII flow integration.",
      careersLink: "https://www.cadence.com/en_US/home/company/careers.html",
      difficulty: 4.2,
      locations: ["San Jose, CA", "Austin, TX", "Bengaluru, India", "Noida, India", "Munich, Germany"],
      keywords: ["Verilog", "SystemVerilog", "UVM", "DDR", "PCIe", "synthesis", "formal", "VIP", "EDA"]
    },
    {
      name: "Micron Technology",
      type: "IDM",
      focus: "DRAM/NAND flash memory controller logic, command schedulers, wear leveling hardware algorithms, DDR5/LPDDR5 physical interface control, and high-density memory array decoders.",
      careersLink: "https://www.micron.com/careers",
      difficulty: 4,
      locations: ["Boise, ID", "Milpitas, CA", "Bengaluru, India", "Taichung, Taiwan", "Singapore"],
      keywords: ["Verilog", "SystemVerilog", "DRAM", "NAND", "flash", "memory controller", "DDR5", "LPDDR5"]
    },
    {
      name: "Marvell Technology",
      type: "Fabless",
      focus: "Custom ASIC designs, high-speed storage controller architecture (PCIe NVMe SSDs), network packet processors, secure cryptoprocessors, and high-performance interconnects.",
      careersLink: "https://www.marvell.com/company/careers.html",
      difficulty: 4.3,
      locations: ["Santa Clara, CA", "Westborough, MA", "Pune, India", "Ettlingen, Germany", "Hsinchu, Taiwan"],
      keywords: ["Verilog", "SystemVerilog", "ASIC", "PCIe", "NVMe", "SSD", "network", "interconnect", "security"]
    }
  ],

  rtlTemplates: [
    {
      title: "Synchronous FIFO",
      description: "A classic RTL interview question. It requires designing a FIFO (First-In, First-Out) memory buffer where read and write operations are synchronized to the same clock. Focus points: pointer increments, full/empty generation, and avoiding read/write collisions.",
      code: `module sync_fifo #(
  parameter DATA_WIDTH = 8,
  parameter FIFO_DEPTH = 16,
  parameter ADDR_WIDTH = $clog2(FIFO_DEPTH)
)(
  input  wire                  clk,
  input  wire                  rst_n,
  input  wire                  wr_en,
  input  wire                  rd_en,
  input  wire [DATA_WIDTH-1:0] din,
  output reg  [DATA_WIDTH-1:0] dout,
  output wire                  full,
  output wire                  empty,
  output reg  [ADDR_WIDTH:0]   data_count // Includes extra bit for full/empty distinction
);

  // Memory array
  reg [DATA_WIDTH-1:0] mem [FIFO_DEPTH-1:0];
  
  // Read and write pointers
  reg [ADDR_WIDTH-1:0] wr_ptr;
  reg [ADDR_WIDTH-1:0] rd_ptr;

  // Status flags
  assign empty = (data_count == 0);
  assign full  = (data_count == FIFO_DEPTH);

  // Write operation
  always @(posedge clk or negedge rst_n) begin
    if (!rst_n) begin
      wr_ptr <= 0;
    end else if (wr_en && !full) begin
      mem[wr_ptr] <= din;
      wr_ptr      <= wr_ptr + 1;
    end
  end

  // Read operation
  always @(posedge clk or negedge rst_n) begin
    if (!rst_n) begin
      rd_ptr <= 0;
      dout   <= 0;
    end else if (rd_en && !empty) begin
      dout   <= mem[rd_ptr];
      rd_ptr <= rd_ptr + 1;
    end
  end

  // Data count tracking
  always @(posedge clk or negedge rst_n) begin
    if (!rst_n) begin
      data_count <= 0;
    end else begin
      case ({wr_en && !full, rd_en && !empty})
        2'b10:   data_count <= data_count + 1;
        2'b01:   data_count <= data_count - 1;
        default: data_count <= data_count; // No change on simultaneous write & read or idle
      endcase
    end
  end

endmodule`,
      keyPoints: [
        "**Full vs Empty**: Note that `wr_ptr == rd_ptr` occurs both when the FIFO is empty AND when it is full. This implementation uses a `data_count` register to distinguish between the two states.",
        "**Synthesis Latch Prevention**: Ensure the reset conditions initialize all state registers, and write arrays are mapped properly. `mem` synthesizes to RAM blocks.",
        "**Simultaneous Read/Write**: The case statement handles simultaneous read and write actions gracefully, keeping `data_count` unchanged."
      ]
    },
    {
      title: "Clock Divider (By 3, 50% Duty Cycle)",
      description: "An odd-number clock divider is a frequent brainteaser. Achieving a 50% duty cycle requires using both the rising and falling edges of the source clock and ORing their phase-shifted intermediate signals.",
      code: `module clk_div_3 (
  input  wire clk,
  input  wire rst_n,
  output wire clk_out
);

  reg [1:0] pos_cnt;
  reg [1:0] neg_cnt;

  // Rising-edge counter
  always @(posedge clk or negedge rst_n) begin
    if (!rst_n) begin
      pos_cnt <= 2'b00;
    end else begin
      if (pos_cnt == 2)
        pos_cnt <= 2'b00;
      else
        pos_cnt <= pos_cnt + 1;
    end
  end

  // Falling-edge counter
  always @(negedge clk or negedge rst_n) begin
    if (!rst_n) begin
      neg_cnt <= 2'b00;
    end else begin
      if (neg_cnt == 2)
        neg_cnt <= 2'b00;
      else
        neg_cnt <= neg_cnt + 1;
    end
  end

  // Intermediate clock signals (high for 1 cycle, low for 2 cycles)
  wire pos_clk = (pos_cnt < 1);
  wire neg_clk = (neg_cnt < 1);

  // Combine both signals to achieve a 50% duty cycle
  assign clk_out = pos_clk | neg_clk;

endmodule`,
      keyPoints: [
        "**Odd Division**: For a division by N (where N is odd), we count up to N-1 (0 to 2 for N=3).",
        "**Edge Mixing**: We use both `posedge` and `negedge` of the clock. Generally, mixing edges is discouraged in standard synchronous blocks, but is required for odd clock division with a strict 50% duty cycle.",
        "**Duty Cycle Math**: The OR gate shifts the falling-edge output relative to the rising-edge output, widening the active-high pulse duration to exactly 1.5 input clock cycles out of 3."
      ]
    },
    {
      title: "Gray Code Counter",
      description: "Gray code counters are useful for clock domain crossings (like in asynchronous FIFOs) because only a single bit changes state at any transition, eliminating transient decoding errors.",
      code: `module gray_counter #(
  parameter WIDTH = 4
)(
  input  wire             clk,
  input  wire             rst_n,
  input  wire             en,
  output reg  [WIDTH-1:0] gray_count
);

  reg [WIDTH-1:0] binary_count;
  wire [WIDTH-1:0] next_binary;
  wire [WIDTH-1:0] next_gray;

  // Increment the binary representation
  assign next_binary = binary_count + (en ? 1'b1 : 1'b0);

  // Convert binary to Gray: G = B ^ (B >> 1)
  assign next_gray = next_binary ^ (next_binary >> 1);

  always @(posedge clk or negedge rst_n) begin
    if (!rst_n) begin
      binary_count <= 0;
      gray_count   <= 0;
    end else begin
      binary_count <= next_binary;
      gray_count   <= next_gray;
    end
  end

endmodule`,
      keyPoints: [
        "**Binary to Gray Equation**: The fundamental equation is `G = B ^ (B >> 1)`. In this code, we compute the next binary value first, convert it to Gray, and register both outputs.",
        "**Glitch-free synchronization**: Because only one bit changes per clock cycle, this signal can be synchronized into another clock domain using a standard 2-FF synchronizer without risk of reading an illegal intermediate value."
      ]
    }
  ],

  greenhouseCompanies: [
    { name: "SiFive", type: "Greenhouse", token: "sifive" },
    { name: "Tenstorrent", type: "Greenhouse", token: "tenstorrent" },
    { name: "Groq", type: "Greenhouse", token: "groq" },
    { name: "Rivos", type: "Greenhouse", token: "rivos" },
    { name: "Cerebras Systems", type: "Greenhouse", token: "cerebras" },
    { name: "Ventana Micro Systems", type: "Greenhouse", token: "ventanamicro" },
    { name: "Ampere Computing", type: "Greenhouse", token: "amperecomputing" },
    { name: "SambaNova Systems", type: "Greenhouse", token: "sambanova" },
    { name: "Esperanto Technologies", type: "Greenhouse", token: "esperantotechnologies" },
    { name: "Encharge AI", type: "Greenhouse", token: "encharge" },
    { name: "Codasip", type: "Greenhouse", token: "codasip" },
    { name: "Astera Labs", type: "Greenhouse", token: "asteralabs" },
    { name: "Eliyan", type: "Greenhouse", token: "eliyan" },
    { name: "Syntiant", type: "Greenhouse", token: "syntiant" },
    { name: "Alphawave Semi", type: "Greenhouse", token: "alphawave" },
    { name: "Axiado", type: "Greenhouse", token: "axiado" },
    { name: "Untether AI", type: "Greenhouse", token: "untetherai" },
    { name: "DreamBig Semiconductor", type: "Greenhouse", token: "dreambig" },
    { name: "Habana Labs (Intel)", type: "Greenhouse", token: "habanalabs" },
    { name: "Lightmatter", type: "Greenhouse", token: "lightmatter" },
    { name: "Recogni", type: "Greenhouse", token: "recogni" },
    { name: "NextSilicon", type: "Greenhouse", token: "nextsilicon" },
    { name: "Mythic", type: "Greenhouse", token: "mythic" },
    { name: "FuriosaAI", type: "Greenhouse", token: "furiosa" },
    { name: "SiMa.ai", type: "Lever", token: "sima" },
    { name: "Axelera AI", type: "Lever", token: "axeleraai" }
  ],

  searchLinks: [
    { name: "NVIDIA Careers", url: "https://nvidia.wd5.myworkdayjobs.com/NVIDIACareers?q=RTL+design" },
    { name: "AMD Careers", url: "https://amd.wd1.myworkdayjobs.com/AMD_Careers?q=RTL+design" },
    { name: "Qualcomm Careers", url: "https://qualcomm.wd5.myworkdayjobs.com/Careers?q=RTL+design" },
    { name: "Intel Careers", url: "https://jobs.intel.com/en/search-jobs/RTL+design" },
    { name: "Apple Careers", url: "https://jobs.apple.com/en-us/search?search=RTL%20Design&sort=relevance" },
    { name: "Broadcom Careers", url: "https://broadcom.wd1.myworkdayjobs.com/External_Career?q=RTL" },
    { name: "Marvell Careers", url: "https://marvell.wd1.myworkdayjobs.com/MarvellCareers?q=RTL" },
    { name: "ARM Careers", url: "https://careers.arm.com/search-jobs/RTL" },
    { name: "Analog Devices (ADI)", url: "https://analog.wd1.myworkdayjobs.com/Careers?q=RTL" },
    { name: "Texas Instruments", url: "https://careers.ti.com/search-jobs/RTL" },
    { name: "Renesas Careers", url: "https://renesas.wd1.myworkdayjobs.com/Renesas_Careers?q=RTL" },
    { name: "Nordic Semi Careers", url: "https://nordicsemi.wd3.myworkdayjobs.com/Nordic_Semiconductor_Careers?q=RTL" },
    { name: "Skyworks Careers", url: "https://skyworks.wd1.myworkdayjobs.com/SkyworksCareersJobBoard?q=RTL" },
    { name: "Qorvo Careers", url: "https://qorvo.wd1.myworkdayjobs.com/Qorvo_Careers_Job_Board?q=RTL" },
    { name: "Wolfspeed Careers", url: "https://wolfspeed.wd5.myworkdayjobs.com/WolfspeedCareers?q=RTL" },
    { name: "Synopsys Careers", url: "https://synopsys.wd1.myworkdayjobs.com/SynopsysCareersJobBoard?q=RTL" },
    { name: "Cadence Careers", url: "https://cadence.wd1.myworkdayjobs.com/ExternalCareers?q=RTL" },
    { name: "Micron Careers", url: "https://micron.wd1.myworkdayjobs.com/Micron?q=RTL" }
  ]
};

// Make it compatible with both standard browser script loading and ESM if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = mockData;
}
