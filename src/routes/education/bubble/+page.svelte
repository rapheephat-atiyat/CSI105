<script>
    import { onMount } from 'svelte';

    function generateRandomArray(size = 10, min = 1, max = 99) {
        return Array.from({ length: size }, () => Math.floor(Math.random() * (max - min + 1)) + min);
    }
    
    let originalArr = $state(generateRandomArray());
    let arr = $state([...originalArr]);
    
    let states = $state([]);
    let currentStep = $state(0);
    let isPlaying = $state(false);
    let speed = $state(100);
    let timer;
    let autoLoopTimer;

    const codeLines = [
        "function bubbleSort(arr) {",
        "    let n = arr.length;",
        "    for (let i = 0; i < n - 1; i++) {",
        "        for (let j = 0; j < n - i - 1; j++) {",
        "            if (arr[j] > arr[j+1]) {",
        "                let temp = arr[j];",
        "                arr[j] = arr[j+1];",
        "                arr[j+1] = temp;",
        "            }",
        "        }",
        "    }",
        "}"
    ];

    function highlightCode(line) {
        if (line === "function bubbleSort(arr) {") {
            return `<span class="syntax-keyword">function</span> <span class="syntax-function">bubbleSort</span>(<span class="syntax-variable">arr</span>) {`;
        }
        if (line === "    let n = arr.length;") {
            return `    <span class="syntax-keyword">let</span> <span class="syntax-variable">n</span> = <span class="syntax-variable">arr</span>.<span class="syntax-function">length</span>;`;
        }
        if (line === "    for (let i = 0; i < n - 1; i++) {") {
            return `    <span class="syntax-keyword">for</span> (<span class="syntax-keyword">let</span> <span class="syntax-variable">i</span> = <span class="syntax-number">0</span>; <span class="syntax-variable">i</span> &lt; <span class="syntax-variable">n</span> - <span class="syntax-number">1</span>; <span class="syntax-variable">i</span>++) {`;
        }
        if (line === "        for (let j = 0; j < n - i - 1; j++) {") {
            return `        <span class="syntax-keyword">for</span> (<span class="syntax-keyword">let</span> <span class="syntax-variable">j</span> = <span class="syntax-number">0</span>; <span class="syntax-variable">j</span> &lt; <span class="syntax-variable">n</span> - <span class="syntax-variable">i</span> - <span class="syntax-number">1</span>; <span class="syntax-variable">j</span>++) {`;
        }
        if (line === "            if (arr[j] > arr[j+1]) {") {
            return `            <span class="syntax-keyword">if</span> (<span class="syntax-variable">arr</span>[<span class="syntax-variable">j</span>] &gt; <span class="syntax-variable">arr</span>[<span class="syntax-variable">j</span>+<span class="syntax-number">1</span>]) {`;
        }
        if (line === "                let temp = arr[j];") {
            return `                <span class="syntax-keyword">let</span> <span class="syntax-variable">temp</span> = <span class="syntax-variable">arr</span>[<span class="syntax-variable">j</span>];`;
        }
        if (line === "                arr[j] = arr[j+1];") {
            return `                <span class="syntax-variable">arr</span>[<span class="syntax-variable">j</span>] = <span class="syntax-variable">arr</span>[<span class="syntax-variable">j</span>+<span class="syntax-number">1</span>];`;
        }
        if (line === "                arr[j+1] = temp;") {
            return `                <span class="syntax-variable">arr</span>[<span class="syntax-variable">j</span>+<span class="syntax-number">1</span>] = <span class="syntax-variable">temp</span>;`;
        }
        if (line === "            }") { return `            }`; }
        if (line === "        }") { return `        }`; }
        if (line === "    }") { return `    }`; }
        if (line === "}") { return `}`; }
        return line;
    }

    function getSortedIndices(i, n) {
        let sorted = [];
        for (let k = n - i; k < n; k++) {
            sorted.push(k);
        }
        return sorted;
    }

    function generateStates() {
        let newStates = [];
        let tempArr = [...originalArr];
        let n = tempArr.length;
        
        newStates.push({ arr: [...tempArr], line: 1, comparing: [], swapping: [], sorted: [] });
        newStates.push({ arr: [...tempArr], line: 2, comparing: [], swapping: [], sorted: [] });
        
        for (let i = 0; i < n - 1; i++) {
            newStates.push({ arr: [...tempArr], line: 3, comparing: [], swapping: [], sorted: getSortedIndices(i, n) });
            
            for (let j = 0; j < n - i - 1; j++) {
                newStates.push({ arr: [...tempArr], line: 4, comparing: [j, j+1], swapping: [], sorted: getSortedIndices(i, n) });
                newStates.push({ arr: [...tempArr], line: 5, comparing: [j, j+1], swapping: [], sorted: getSortedIndices(i, n) });
                
                if (tempArr[j] > tempArr[j+1]) {
                    newStates.push({ arr: [...tempArr], line: 6, comparing: [], swapping: [j, j+1], sorted: getSortedIndices(i, n) });
                    
                    let temp = tempArr[j];
                    tempArr[j] = tempArr[j+1];
                    newStates.push({ arr: [...tempArr], line: 7, comparing: [], swapping: [j, j+1], sorted: getSortedIndices(i, n) });
                    
                    tempArr[j+1] = temp;
                    newStates.push({ arr: [...tempArr], line: 8, comparing: [], swapping: [j, j+1], sorted: getSortedIndices(i, n) });
                    
                    newStates.push({ arr: [...tempArr], line: 9, comparing: [], swapping: [], sorted: getSortedIndices(i, n) });
                }
                newStates.push({ arr: [...tempArr], line: 10, comparing: [], swapping: [], sorted: getSortedIndices(i, n) });
            }
            newStates.push({ arr: [...tempArr], line: 11, comparing: [], swapping: [], sorted: getSortedIndices(i + 1, n) });
        }
        
        let allSorted = Array.from({length: n}, (_, i) => i);
        newStates.push({ arr: [...tempArr], line: 12, comparing: [], swapping: [], sorted: allSorted });
        
        states = newStates;
        return states;
    }

    onMount(() => {
        generateStates();
        // Kickstart auto loop playback
        setTimeout(() => {
            play();
        }, 500);
    });

    function play() {
        if (currentStep >= states.length - 1) {
            reset();
            return; // reset triggers auto play anyway now if we refactor loop
        }
        if (!isPlaying) {
            isPlaying = true;
            nextStepAuto();
        }
    }

    function pause() {
        isPlaying = false;
        clearTimeout(timer);
        clearTimeout(autoLoopTimer);
    }

    function nextStepAuto() {
        if (!isPlaying) return;
        if (currentStep < states.length - 1) {
            currentStep++;
            timer = setTimeout(nextStepAuto, speed);
        } else {
            // Auto loop after finish
            autoLoopTimer = setTimeout(() => {
                if (isPlaying) {
                    reset();
                    // Instead of play(), directly set true
                    isPlaying = true;
                    setTimeout(() => {
                        play();
                    }, speed);
                }
            }, 1000); // 1s delay
        }
    }

    function step() {
        pause();
        if (currentStep < states.length - 1) {
            currentStep++;
        }
    }

    function reset() {
        pause();
        currentStep = 0;
        originalArr = generateRandomArray();
        generateStates();
    }

    let currentState = $derived(states[currentStep] || { arr: originalArr, line: 1, comparing: [], swapping: [], sorted: [] });
    let maxVal = $derived(Math.max(...originalArr) || 100);
</script>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&family=Inter:wght@400;500;600&display=swap');

    :global(body) {
        margin: 0;
        background: #0b0f1a;
        color: #ffffff;
        font-family: 'Inter', sans-serif;
    }

    body {
		margin: 0;
		background: #0b0f1a;
		color: #fff;
		font-family: sans-serif;
	}

	/* Layout */
	.main {
		padding: 100px 24px 40px;
		max-width: 1300px;
		margin: auto;
	}

	.layout {
		display: grid;
		gap: 20px;
	}

	@media (min-width: 1024px) {
		.layout {
			grid-template-columns: 4fr 8fr;
		}
	}

	/* Header */
	.header h1 {
		font-size: 60px;
		margin: 10px 0;
	}

	.header p {
		color: #94a3b8;
		max-width: 600px;
		padding-bottom: 30px;
	}

	.line {
		width: 100px;
		height: 10px;
		background: rgba(100, 255, 200, 0.4);
		border-radius: 10px;
	}

	/* Card */
	.card {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 20px;
		padding: 20px;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.glass {
		padding-top: 20px;
		color: #94a3b8;
	}

	/* Rows */
	.row {
		display: flex;
		justify-content: space-between;
		margin-top: 15px;
	}

	.row span {
		color: #94a3b8;
	}

	.row strong {
		font-size: 20px;
	}

	/* Colors */
	.pink {
		color: #ff6c95;
	}
	.blue {
		color: #81ecff;
	}
	.green {
		color: #6bfad8;
	}

	/*  BOX  */
	.protocol-box {
		background: rgba(255, 255, 255, 0.03);
		border-radius: 20px;
		padding: 40px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow: 0 0 40px rgba(0, 0, 0, 0.6);
	}

	.box1{
		position: absolute;
		top: 300px;
		right: -10px;
		width: 280px;
		height: 280px;
		border-radius: 50%;
		filter: blur(50px);
	}	
	.box2{
		position: absolute;
		top: 50px;
		right: 1150px;
		width: 260px;
		height: 260px;
		border-radius: 50%;
		filter: blur(50px);
	}
	.box3{
		position: absolute;
		top: 700px;
		right: 820px;
		width: 180px;
		height: 180px;
		border-radius: 50%;
		filter: blur(50px);
	}
    .box4{
		position: absolute;
		top: 1100px;
		right: 620px;
		width: 180px;
		height: 180px;
		border-radius: 50%;
		filter: blur(50px);
	}
	.box1 {
		background: rgba(79, 209, 255, 0.2);
	}
	.box2 {
		background: rgba(100, 255, 200, 0.2);
	}
	.box3 {
		background: rgba(255, 120, 150, 0.2);
	}
    .box4 {
		background: rgba(255, 253, 120, 0.2);
	}

	/* ===== HEADER ===== */
	.protocol-header {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 40px;
	}

	.protocol-icon {
		width: 50px;
		height: 50px;
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.05);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.protocol-title {
		font-size: 28px;
		font-weight: 700;
	}

	.protocol-sub {
		font-size: 11px;
		color: #6b7280;
		letter-spacing: 2px;
	}

	/* ===== GRID ===== */
	.protocol-grid {
		display: grid;
		gap: 30px;
	}

	@media (min-width: 768px) {
		.protocol-grid {
			grid-template-columns: 1fr 1fr;
		}
	}

	/* ===== ITEM ===== */
	.protocol-item {
		display: flex;
		gap: 15px;
		align-items: flex-start;
	}

	/*  TEXT */
	.protocol-content h4 {
		font-size: 16px;
		font-weight: 600;
		margin-bottom: 6px;
	}

	.protocol-content p {
		font-size: 14px;
		color: #9ca3af;
		line-height: 1.7;
	}

    /* ===== MY VISUALIZER STYLES ===== */
    .visualizer-container {
        margin: 0;
        padding: 0;
    }

    .top-buttons {
        display: flex;
        gap: 1rem;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
    }

    .algo-btn {
        background-color: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        color: #94a3b8;
        padding: 0.5rem 1.5rem;
        border-radius: 8px;
        font-family: 'Inter', sans-serif;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
    }
    .algo-btn:hover {
        background-color: rgba(255,255,255,0.1);
        color: #fff;
    }

    .algo-btn:first-child {
        color: #6bfad8;
        border-color: rgba(107, 250, 216, 0.4);
        background-color: rgba(107, 250, 216, 0.1);
    }

    .panels {
        display: flex;
        gap: 1.5rem;
        margin-bottom: 1.5rem;
        flex-direction: column;
    }
    @media (min-width: 1024px) {
        .panels {
            flex-direction: row;
        }
    }

    .panel {
        background: rgba(255, 255, 255, 0.03);
        border-radius: 20px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 0 40px rgba(0, 0, 0, 0.3);
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        color: #e5e5e5;
    }

    .panel-header {
        display: flex;
        justify-content: space-between;
        padding: 1.25rem;
        font-size: 0.875rem;
        font-weight: 600;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        color: #81ecff;
    }

    .panel-content {
        padding: 1rem;
        height: 350px;
        position: relative;
    }

    /* Execution Trace */
    .code-container {
        font-family: 'Fira Code', monospace;
        font-size: 0.875rem;
        line-height: 1.6;
        overflow-y: auto;
        height: 100%;
        margin: 0;
        padding: 0;
    }

    .code-line {
        display: flex;
        padding: 0 1rem;
    }

    .code-line.active {
        background-color: rgba(107, 250, 216, 0.1);
        border-left: 3px solid #6bfad8;
        padding-left: calc(1rem - 3px);
    }

    .line-number {
        color: #64748b;
        width: 2rem;
        text-align: right;
        margin-right: 1.5rem;
        user-select: none;
    }

    .code-line.active .line-number {
        color: #6bfad8;
    }

    .line-text {
        white-space: pre;
    }

    /* Visualization */
    .bars-container {
        display: flex;
        justify-content: space-around;
        height: 250px;
        padding-bottom: 1rem;
    }

    .bar-wrapper {
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: center;
        width: 8%;
        height: 100%;
    }

    .bar {
        width: 100%;
        border-radius: 4px 4px 0 0;
        transition: height 0.2s ease, background-color 0.2s ease;
    }

    .value {
        margin-top: 0.5rem;
        font-size: 0.875rem;
        color: #d4d4d4;
    }

    .legend {
        display: flex;
        gap: 1.5rem;
        position: absolute;
        bottom: 1rem;
        left: 1rem;
        font-size: 0.875rem;
    }

    .legend-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .color-box {
        width: 12px;
        height: 12px;
        border-radius: 3px;
    }

    /* Controls */
    .controls-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: rgba(255, 255, 255, 0.02);
        padding: 1rem;
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .playback-controls {
        display: flex;
        gap: 1rem;
    }

    .btn {
        background-color: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #e2e8f0;
        padding: 0.5rem 1.25rem;
        border-radius: 8px;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.2s;
    }

    .btn:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }
    .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .speed-control {
        display: flex;
        align-items: center;
        gap: 1rem;
        color: #94a3b8;
        font-size: 0.875rem;
    }

    .speed-slider {
        -webkit-appearance: none;
        width: 100px;
        height: 6px;
        background: rgba(255,255,255,0.1);
        border-radius: 3px;
        outline: none;
    }

    .speed-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #81ecff;
        cursor: pointer;
    }

    .step-counter {
        margin-top: 1rem;
        color: #94a3b8;
        font-size: 0.875rem;
        text-align: right;
    }

    /* Array States Colors */
    .bg-unsorted { background-color: #3b82f6; }
    .bg-comparing { background-color: #f59e0b; }
    .bg-swapping { background-color: #ff6c95; }
    .bg-sorted { background-color: #6bfad8; }

    /* Syntax Highlighting */
    :global(.syntax-keyword) { color: #ff7b72; }
    :global(.syntax-function) { color: #d2a8ff; }
    :global(.syntax-variable) { color: #79c0ff; }
    :global(.syntax-number) { color: #a5d6ff; }
</style>

<main class="main">
    <!-- Header -->
    <header class="header">
        <div class="line"></div>
        <h1 class="text-4xl font-black text-white uppercase">Bubble Sort</h1>
        <p>Bubble Sort คืออัลกอริทึมการเรียงลำดับที่เรียบง่าย เปรียบเสมือนฟองอากาศที่ค่อย ๆ ลอยขึ้นสู่ผิวน้ำ โดยทำการเปรียบเทียบค่าที่อยู่ติดกันและสลับตำแหน่งหากลำดับไม่ถูกต้อง กระบวนการนี้จะดำเนินซ้ำไปเรื่อย ๆ จนทุกองค์ประกอบอยู่ในตำแหน่งที่เหมาะสม แม้จะเข้าใจง่าย แต่กลับไม่เหมาะกับข้อมูลจำนวนมาก เนื่องจากใช้เวลาในการประมวลผลค่อนข้างสูง</p>
    </header>
    <!-- Grid -->
    <div class="layout">
        <!-- Left -->
        <section class="left">
            <div class="card">
                <h3>Time Complexity</h3>

                <div class="row">
                    <span>Worst Time</span>
                    <strong class="pink">O(n²)</strong>
                </div>
                <div class="bar" style="width: 100%; height: 6px; background: rgba(255, 255, 255, 0.1); border-radius: 3px; margin-top: 5px; overflow: hidden;"><div class="fill pink" style="width: 100%; height: 100%; background: #ff6c95;"></div></div>

                <div class="row">
                    <span>Average Time</span>
                    <strong class="blue">O(n²)</strong>
                </div>
                <div class="bar" style="width: 100%; height: 6px; background: rgba(255, 255, 255, 0.1); border-radius: 3px; margin-top: 5px; overflow: hidden;"><div class="fill blue" style="width: 100%; height: 100%; background: #81ecff;"></div></div>

                <div class="row">
                    <span>Best Time</span>
                    <strong class="green">O(n)</strong>
                </div>
                <div class="bar" style="width: 100%; height: 6px; background: rgba(255, 255, 255, 0.1); border-radius: 3px; margin-top: 5px; overflow: hidden;"><div class="fill green small" style="width: 20%; height: 100%; background: #6bfad8;"></div></div>
                
                <h3 style="margin-top: 30px;">Auxiliary Space</h3>
                <div class="row">
                    <span>Space</span>
                    <strong>O(1)</strong>
                </div>
            </div>

            <div class="glass">
                <p>Bubble Sort เหมาะสำหรับข้อมูลขนาดเล็ก หรือเกือบเรียงแล้ว</p>
            </div>
        </section>

        <!-- Right -->
        <section class="right">
            <div class="protocol-box">
                    <div class="protocol-header">
                        <div class="glow box1"></div>
                        <div class="glow box2"></div>
                        <div class="glow box3"></div>
                        <div class="glow box4"></div>
                        <div class="protocol-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 24px; height: 24px;">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
                            </svg>
                        </div>
                        <div>
                            <div class="protocol-title">หลักการทำงานของ <span>Protocol</span></div>
                            <div class="protocol-sub">PROCESS METHODOLOGY</div>
                        </div>
                    </div>
                    <div class="protocol-grid">
                        <div class="protocol-item">
                            <div class="protocol-number">01</div>
                            <div class="protocol-content">
                                <h4>Adjacent Comparison</h4>
                                <p>เริ่มต้นเปรียบเทียบข้อมูลจากตำแหน่งแรก โดยเทียบกับตำแหน่งที่อยู่ถัดไปทันที</p>
                            </div>
                        </div>
                        <div class="protocol-item">
                            <div class="protocol-number">02</div>
                            <div class="protocol-content">
                                <h4>Data Swapping</h4>
                                <p>ถ้าค่าในตำแหน่งปัจจุบันมากกว่าตำแหน่งถัดไป ให้สลับที่กันเพื่อให้ค่าที่มากกว่าเลื่อนไปข้างหลัง</p>
                            </div>
                        </div>
                        <div class="protocol-item">
                            <div class="protocol-number">03</div>
                            <div class="protocol-content">
                                <h4>Iterative Pass</h4>
                                <p>ทำซ้ำแบบเดิมไปเรื่อยๆ จนจบแถวข้อมูล ข้อมูลตัวที่มากที่สุดจะไปอยู่ที่ตำแหน่งสุดท้าย</p>
                            </div>
                        </div>
                        <div class="protocol-item">
                            <div class="protocol-number">04</div>
                            <div class="protocol-content">
                                <h4>Stability</h4>
                                <p>Bubble Sort เป็น Stable Sort คือถ้าค่าเท่ากันจะไม่มีการเปลี่ยนลำดับสัมพัทธ์เดิม</p>
                            </div>
                        </div>
                    </div>
            </div>
        </section>
    </div>
	<!-- My Visualizer inserted here -->
    <div class="visualizer-container">
        <div class="panels">
            <!-- VISUALIZATION PANEL -->
            <div class="panel">
                <div class="panel-header">
                    <span>VISUALIZATION</span>
                    <span>Step: {currentStep}</span>
                </div>
                <div class="panel-content">
                    <div class="bars-container">
                        {#each currentState.arr as val, index}
                            <div class="bar-wrapper">
                                <div class="bar 
                                    {currentState.swapping.includes(index) ? 'bg-swapping' :
                                    currentState.comparing.includes(index) ? 'bg-comparing' :
                                    currentState.sorted.includes(index) ? 'bg-sorted' : 'bg-unsorted'}" 
                                    style="height: {(val / maxVal) * 100}%">
                                </div>
                                <div class="value">{val}</div>
                            </div>
                        {/each}
                    </div>
                    <div class="legend">
                        <div class="legend-item"><div class="color-box bg-unsorted"></div>unsorted</div>
                        <div class="legend-item"><div class="color-box bg-comparing"></div>comparing</div>
                        <div class="legend-item"><div class="color-box bg-swapping"></div>swapping</div>
                        <div class="legend-item"><div class="color-box bg-sorted"></div>sorted</div>
                    </div>
                </div>
            </div>

            <!-- EXECUTION TRACE PANEL -->
            <div class="panel">
                <div class="panel-header">
                    <span>EXECUTION_TRACE</span>
                    <span>start</span>
                </div>
                <div class="panel-content" style="padding: 1rem 0;">
                    <div class="code-container">
                        {#each codeLines as line, i}
                            <div class="code-line {currentState.line === i + 1 ? 'active' : ''}">
                                <div class="line-number">{i + 1}</div>
                                <div class="line-text">{@html highlightCode(line)}</div>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
        </div>

        <!-- CONTROLS -->
        <div class="controls-row">
            <div class="playback-controls">
                <button class="btn" on:click={reset}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    Reset
                </button>
                <button class="btn" on:click={isPlaying ? pause : play}>
                    {#if isPlaying}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                        Pause
                    {:else}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        Play
                    {/if}
                </button>
                <button class="btn" on:click={step} disabled={isPlaying}>
                    Step &rarr;
                </button>
            </div>

            <div class="speed-control">
                <span>Speed</span>
                <input type="range" min="10" max="1000" bind:value={speed} class="speed-slider">
                <span>{speed}ms</span>
            </div>
        </div>

        <div class="step-counter">
            Step {currentStep} of {states.length > 0 ? states.length - 1 : 0}
        </div>
    </div>
</main>
