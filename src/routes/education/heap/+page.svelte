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
        "function heapSort(arr) {",
        "    let n = arr.length;",
        "    for (let i = Math.floor(n/2) - 1; i >= 0; i--)",
        "        heapify(arr, n, i);",
        "    for (let i = n - 1; i > 0; i--) {",
        "        let temp = arr[0]; arr[0] = arr[i]; arr[i] = temp;",
        "        heapify(arr, i, 0);",
        "    }",
        "}",
        "function heapify(arr, n, i) {",
        "    let largest = i;",
        "    let l = 2 * i + 1;",
        "    let r = 2 * i + 2;",
        "    if (l < n && arr[l] > arr[largest]) largest = l;",
        "    if (r < n && arr[r] > arr[largest]) largest = r;",
        "    if (largest !== i) {",
        "        let temp = arr[i]; arr[i] = arr[largest]; arr[largest] = temp;",
        "        heapify(arr, n, largest);",
        "    }",
        "}"
    ];

    function highlightCode(line) {
        let hl = line.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        hl = hl.replace(/\b(function|let|for|if)\b/g, '<span class="syntax-keyword">$1</span>');
        hl = hl.replace(/\b(heapSort|heapify|length|Math|floor)\b/g, '<span class="syntax-function">$1</span>');
        hl = hl.replace(/\b(arr|n|i|l|r|largest|temp)\b/g, '<span class="syntax-variable">$1</span>');
        hl = hl.replace(/\b(\d+)\b/g, '<span class="syntax-number">$1</span>');
        return hl;
    }

    function generateStates() {
        let newStates = [];
        let tempArr = [...originalArr];
        let n = tempArr.length;
        let fullySorted = [];

        function hpf(sz, i) {
            newStates.push({ arr: [...tempArr], line: 10, comparing: [], swapping: [], sorted: [...fullySorted] });
            let largest = i;
            newStates.push({ arr: [...tempArr], line: 11, comparing: [largest], swapping: [], sorted: [...fullySorted] });
            let l = 2 * i + 1;
            newStates.push({ arr: [...tempArr], line: 12, comparing: [largest, l < sz ? l : largest], swapping: [], sorted: [...fullySorted] });
            let r = 2 * i + 2;
            newStates.push({ arr: [...tempArr], line: 13, comparing: [largest, r < sz ? r : largest], swapping: [], sorted: [...fullySorted] });
            
            newStates.push({ arr: [...tempArr], line: 14, comparing: [l < sz ? l : largest, largest], swapping: [], sorted: [...fullySorted] });
            if (l < sz && tempArr[l] > tempArr[largest]) {
                largest = l;
            }
            
            newStates.push({ arr: [...tempArr], line: 15, comparing: [r < sz ? r : largest, largest], swapping: [], sorted: [...fullySorted] });
            if (r < sz && tempArr[r] > tempArr[largest]) {
                largest = r;
            }
            
            newStates.push({ arr: [...tempArr], line: 16, comparing: [i, largest], swapping: [], sorted: [...fullySorted] });
            if (largest !== i) {
                newStates.push({ arr: [...tempArr], line: 17, comparing: [], swapping: [i, largest], sorted: [...fullySorted] });
                let temp = tempArr[i];
                tempArr[i] = tempArr[largest];
                tempArr[largest] = temp;
                newStates.push({ arr: [...tempArr], line: 17, comparing: [], swapping: [i, largest], sorted: [...fullySorted] });
                
                newStates.push({ arr: [...tempArr], line: 18, comparing: [], swapping: [], sorted: [...fullySorted] });
                hpf(sz, largest);
            }
            newStates.push({ arr: [...tempArr], line: 19, comparing: [], swapping: [], sorted: [...fullySorted] });
            newStates.push({ arr: [...tempArr], line: 20, comparing: [], swapping: [], sorted: [...fullySorted] });
        }

        newStates.push({ arr: [...tempArr], line: 1, comparing: [], swapping: [], sorted: [...fullySorted] });
        newStates.push({ arr: [...tempArr], line: 2, comparing: [], swapping: [], sorted: [...fullySorted] });
        
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            newStates.push({ arr: [...tempArr], line: 3, comparing: [i], swapping: [], sorted: [...fullySorted] });
            newStates.push({ arr: [...tempArr], line: 4, comparing: [], swapping: [], sorted: [...fullySorted] });
            hpf(n, i);
        }
        
        for (let i = n - 1; i > 0; i--) {
            newStates.push({ arr: [...tempArr], line: 5, comparing: [0, i], swapping: [], sorted: [...fullySorted] });
            
            newStates.push({ arr: [...tempArr], line: 6, comparing: [], swapping: [0, i], sorted: [...fullySorted] });
            let temp = tempArr[0];
            tempArr[0] = tempArr[i];
            tempArr[i] = temp;
            newStates.push({ arr: [...tempArr], line: 6, comparing: [], swapping: [0, i], sorted: [...fullySorted] });
            
            fullySorted.push(i);
            newStates.push({ arr: [...tempArr], line: 7, comparing: [], swapping: [], sorted: [...fullySorted] });
            hpf(i, 0);
            
            newStates.push({ arr: [...tempArr], line: 8, comparing: [], swapping: [], sorted: [...fullySorted] });
        }
        
        fullySorted.push(0);
        newStates.push({ arr: [...tempArr], line: 9, comparing: [], swapping: [], sorted: [...fullySorted] });
        
        let allSorted = Array.from({length: n}, (_, k) => k);
        newStates.push({ arr: [...tempArr], line: 9, comparing: [], swapping: [], sorted: allSorted });
        
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

    const nodeCoords = [
        { x: 50, y: 15 },
        { x: 30, y: 40 },
        { x: 70, y: 40 },
        { x: 15, y: 65 },
        { x: 45, y: 65 },
        { x: 55, y: 65 },
        { x: 85, y: 65 },
        { x: 5, y: 90 },
        { x: 25, y: 90 },
        { x: 35, y: 90 }
    ];
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
    .tree-container {
        position: relative;
        width: 100%;
        height: 250px;
        margin-bottom: 1rem;
        border-radius: 12px;
        overflow: hidden;
    }

    .tree-edges {
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        pointer-events: none;
    }

    .tree-node {
        position: absolute;
        width: 40px; height: 40px;
        margin-left: -20px;
        margin-top: -20px;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
        color: white;
        transition: all 0.3s ease;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        z-index: 2;
    }

    .tree-node .value {
        font-size: 1rem;
    }

    .sorted-result {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 3.5rem; /* space for legend */
        padding: 0.75rem;
        background: rgba(107, 250, 216, 0.1);
        border: 1px solid rgba(107, 250, 216, 0.3);
        border-radius: 8px;
    }

    .result-val {
        width: 30px; height: 30px;
        display: flex; justify-content: center; align-items: center;
        background: rgba(255,255,255,0.1);
        border-radius: 4px;
        font-weight: 500;
        font-size: 0.85rem;
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
        <h1 class="text-4xl font-black text-white uppercase">Heap Sort</h1>
        <p>Heap Sort คือสุดยอดอัลกอริทึมที่ใช้โครงสร้างข้อมูลแบบ "ต้นไม้ (Binary Heap)" เข้ามาช่วยในการจัดการ โดยมันจะทำให้อาร์เรย์กลายเป็นโครงสร้างต้นไม้ที่โหนดแม่มีค่ามากกว่าลูกเสมอ (Max-Heap) ทำให้ค่าที่สูงที่สุดจะไปกองอยู่บนยอดสุด (Root) ของต้นไม้ตลอดเวลา จากนั้นจึงสลับยอดต้นไม้ไปไว้ท้ายสุดของอาร์เรย์แล้วสร้างโครงสร้างใหม่วนไปเรื่อยๆ จนกว่าจะเรียงเสร็จ เป็นวิธีการที่ประหยัดหน่วยความจำมหาศาลและรักษาความเร็ว O(n log n) ไว้ได้เสมอ</p>
    </header>
    <!-- Grid -->
    <div class="layout">
        <!-- Left -->
        <section class="left">
            <div class="card">
                <h3>Time Complexity</h3>

                <div class="row">
                    <span>Worst Time</span>
                    <strong class="pink">O(n log n)</strong>
                </div>
                <div class="bar" style="width: 100%; height: 6px; background: rgba(255, 255, 255, 0.1); border-radius: 3px; margin-top: 5px; overflow: hidden;"><div class="fill pink" style="width: 50%; height: 100%; background: #ff6c95;"></div></div>

                <div class="row">
                    <span>Average Time</span>
                    <strong class="blue">O(n log n)</strong>
                </div>
                <div class="bar" style="width: 100%; height: 6px; background: rgba(255, 255, 255, 0.1); border-radius: 3px; margin-top: 5px; overflow: hidden;"><div class="fill blue" style="width: 50%; height: 100%; background: #81ecff;"></div></div>

                <div class="row">
                    <span>Best Time</span>
                    <strong class="green">O(n log n)</strong>
                </div>
                <div class="bar" style="width: 100%; height: 6px; background: rgba(255, 255, 255, 0.1); border-radius: 3px; margin-top: 5px; overflow: hidden;"><div class="fill green small" style="width: 50%; height: 100%; background: #6bfad8;"></div></div>
                
                <h3 style="margin-top: 30px;">Auxiliary Space</h3>
                <div class="row">
                    <span>Space</span>
                    <strong>O(1)</strong>
                </div>
            </div>

            <div class="glass">
                <p>Heap Sort มีความเร็วคงที่เสมอในทุกกรณี (O(n log n)) ทั้งยังประหยัดหน่วยความจำได้อย่างยอดเยี่ยม (O(1)) แม้จะไม่เป็น Stable Sort ก็ตาม</p>
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
                                <h4>Build Max-Heap</h4>
                                <p>จัดเรียงอาร์เรย์ใหม่ทั้งหมดให้กลายเป็นโครงสร้าง Max-Heap โดยค่าที่มากที่สุดจะถูกดันขึ้นไปอยู่ตำแหน่งแรกเสมอ</p>
                            </div>
                        </div>
                        <div class="protocol-item">
                            <div class="protocol-number">02</div>
                            <div class="protocol-content">
                                <h4>Extract Root</h4>
                                <p>สลับค่าที่มากที่สุด (ตำแหน่งแรกสุด) ไปไว้ที่ตำแหน่งสุดท้ายของส่วนที่ยังไม่ได้เรียง เพื่อถือว่ามันถูกจัดเรียงแล้ว</p>
                            </div>
                        </div>
                        <div class="protocol-item">
                            <div class="protocol-number">03</div>
                            <div class="protocol-content">
                                <h4>Heapify</h4>
                                <p>หลังจากสลับเสร็จ โครงสร้าง Heap จะพังลง จึงต้องทำกระบวนการ Heapify เพื่อจัดระเบียบต้นไม้ให้กลับมาเป็น Max-Heap อีกครั้ง</p>
                            </div>
                        </div>
                        <div class="protocol-item">
                            <div class="protocol-number">04</div>
                            <div class="protocol-content">
                                <h4>Instability</h4>
                                <p>Heap Sort มีกระบวนการสลับข้ามตำแหน่งไกลๆ ในระดับต้นไม้เพื่อประสิทธิภาพสูงสุด ทำให้มันไม่ใช่ Stable Sort</p>
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
                    <div class="tree-container">
                        <svg class="tree-edges">
                            {#each currentState.arr as _, i}
                                {#if 2 * i + 1 < currentState.arr.length}
                                    <line 
                                        x1="{nodeCoords[i].x}%" y1="{nodeCoords[i].y}%" 
                                        x2="{nodeCoords[2 * i + 1].x}%" y2="{nodeCoords[2 * i + 1].y}%"
                                        stroke="rgba(255,255,255,0.2)" stroke-width="2" />
                                {/if}
                                {#if 2 * i + 2 < currentState.arr.length}
                                    <line 
                                        x1="{nodeCoords[i].x}%" y1="{nodeCoords[i].y}%" 
                                        x2="{nodeCoords[2 * i + 2].x}%" y2="{nodeCoords[2 * i + 2].y}%"
                                        stroke="rgba(255,255,255,0.2)" stroke-width="2" />
                                {/if}
                            {/each}
                        </svg>
                        {#each currentState.arr as val, index}
                            <div class="tree-node 
                                {currentState.swapping.includes(index) ? 'bg-swapping' :
                                currentState.comparing.includes(index) ? 'bg-comparing' :
                                currentState.sorted.includes(index) ? 'bg-sorted' : 'bg-unsorted'}" 
                                style="left: {nodeCoords[index].x}%; top: {nodeCoords[index].y}%;">
                                <span class="value">{val}</span>
                            </div>
                        {/each}
                    </div>
                    
                    {#if currentState.sorted.length === currentState.arr.length}
                        <div class="sorted-result">
                            <span style="color: #6bfad8; margin-right: 0.5rem; font-weight: bold;">Result:</span>
                            {#each currentState.arr as val}
                                <span class="result-val">{val}</span>
                            {/each}
                        </div>
                    {/if}

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
