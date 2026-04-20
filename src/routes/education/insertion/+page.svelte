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
    let speed = $state(600);
    let timer;
    let autoLoopTimer;

    const codeLines = [
        "function insertionSort(arr) {",
        "    let n = arr.length;",
        "    for (let i = 1; i < n; i++) {",
        "        let key = arr[i];",
        "        let j = i - 1;",
        "        while (j >= 0 && arr[j] > key) {",
        "            arr[j + 1] = arr[j];",
        "            j = j - 1;",
        "        }",
        "        arr[j + 1] = key;",
        "    }",
        "}"
    ];

    function highlightCode(line) {
        let hl = line.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        hl = hl.replace(/\b(function|let|for|while|if)\b/g, '<span class="syntax-keyword">$1</span>');
        hl = hl.replace(/\b(insertionSort|length)\b/g, '<span class="syntax-function">$1</span>');
        hl = hl.replace(/\b(arr|n|i|j|key)\b/g, '<span class="syntax-variable">$1</span>');
        hl = hl.replace(/\b(\d+)\b/g, '<span class="syntax-number">$1</span>');
        return hl;
    }

    function generateStates() {
        let newStates = [];
        let tempArr = [...originalArr];
        let n = tempArr.length;
        
        newStates.push({ arr: [...tempArr], line: 1, comparing: [], swapping: [], sorted: [] });
        newStates.push({ arr: [...tempArr], line: 2, comparing: [], swapping: [], sorted: [] });
        
        for (let i = 1; i < n; i++) {
            let sortedArr = Array.from({length: i}, (_, k) => k);
            newStates.push({ arr: [...tempArr], line: 3, comparing: [], swapping: [], sorted: sortedArr });
            
            let key = tempArr[i];
            newStates.push({ arr: [...tempArr], line: 4, comparing: [i], swapping: [], sorted: [...sortedArr, i] });
            
            let j = i - 1;
            newStates.push({ arr: [...tempArr], line: 5, comparing: [i], swapping: [], sorted: [...sortedArr, i] });
            
            while (j >= 0) {
                newStates.push({ arr: [...tempArr], line: 6, comparing: [j, j+1], swapping: [], sorted: [...sortedArr, i] });
                if (tempArr[j] > key) {
                    tempArr[j + 1] = tempArr[j];
                    newStates.push({ arr: [...tempArr], line: 7, comparing: [], swapping: [j, j+1], sorted: [...sortedArr, i] });
                    j = j - 1;
                    newStates.push({ arr: [...tempArr], line: 8, comparing: [], swapping: [], sorted: [...sortedArr, i] });
                    newStates.push({ arr: [...tempArr], line: 9, comparing: [], swapping: [], sorted: [...sortedArr, i] });
                } else {
                    break;
                }
            }
            newStates.push({ arr: [...tempArr], line: 6, comparing: [], swapping: [], sorted: [...sortedArr, i] });
            
            tempArr[j + 1] = key;
            newStates.push({ arr: [...tempArr], line: 10, comparing: [], swapping: [j+1], sorted: [...sortedArr, i] });
            newStates.push({ arr: [...tempArr], line: 11, comparing: [], swapping: [], sorted: [...sortedArr, i] });
        }
        
        let allSorted = Array.from({length: n}, (_, k) => k);
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

    /* Layout */
    .main {
        padding: 50px 24px 40px;
        max-width: 1300px;
        margin: auto;
    }

    .layout {
        display: grid;
        gap: 20px;
        margin-top: 40px;
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
        max-width: 1000px;
        padding-bottom: 30px;
        line-height: 1.6;
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
    .pink { color: #ff6c95; }
    .blue { color: #81ecff; }
    .green { color: #6bfad8; }

    /*  BOX  */
    .protocol-box {
        background: rgba(255, 255, 255, 0.03);
        border-radius: 20px;
        padding: 40px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 0 40px rgba(0, 0, 0, 0.6);
        position: relative;
        overflow: hidden;
    }

    .box1{
        position: absolute;
        top: 220px;
        right: -10px;
        width: 280px;
        height: 280px;
        border-radius: 50%;
        filter: blur(50px);
        background: rgba(79, 209, 255, 0.2);
    }	
    .box2{
        position: absolute;
        top: 50px;
        right: 1150px;
        width: 260px;
        height: 260px;
        border-radius: 50%;
        filter: blur(50px);
        background: rgba(100, 255, 200, 0.2);
    }
    .box3{
        position: absolute;
        top: 590px;
        right: 820px;
        width: 180px;
        height: 180px;
        border-radius: 50%;
        filter: blur(50px);
        background: rgba(255, 120, 150, 0.2);
    }

    /* ===== HEADER ===== */
    .protocol-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 40px;
        position: relative;
        z-index: 2;
    }

    .protocol-icon {
        width: 50px;
        height: 50px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .protocol-title {
        font-size: 28px;
        font-weight: 700;
    }

    .protocol-title span {
        color: #6bfad8;
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
        position: relative;
        z-index: 2;
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

    .protocol-number {
        font-size: 24px;
        font-weight: 900;
        color: rgba(255,255,255,0.2);
    }

    .protocol-content h4 {
        font-size: 16px;
        font-weight: 600;
        margin: 0 0 6px 0;
    }

    .protocol-content p {
        font-size: 14px;
        color: #9ca3af;
        line-height: 1.7;
        margin: 0;
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
        <h1 class="text-4xl font-black text-white uppercase">Insertion Sort</h1>
        <p>Insertion Sort คืออัลกอริทึมการเรียงลำดับที่จำลองพฤติกรรมการเรียงไพ่ในมือ โดยจะแยกข้อมูลออกเป็นสองส่วนคือส่วนที่เรียงแล้วและส่วนที่ยังไม่เรียง มันจะค่อยๆ หยิบข้อมูลตัวถัดไปมาแทรกในตำแหน่งที่ถูกต้องของส่วนที่เรียงแล้วทีละตัว เป็นวิธีที่มีประสิทธิภาพมากสำหรับข้อมูลที่มีขนาดเล็กหรือข้อมูลที่เกือบจะเรียงลำดับมาแล้ว</p>
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
                <p>Insertion Sort มีประสิทธิภาพโดดเด่นมาก (O(n)) หากข้อมูลมีการเรียงลำดับอยู่แล้วเป็นส่วนใหญ่</p>
            </div>
        </section>

        <!-- Right -->
        <section class="right">
            <div class="protocol-box">
                    <div class="protocol-header">
                        <div class="glow box1"></div>
                        <div class="glow box2"></div>
                        <div class="glow box3"></div>
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
                                <h4>Virtual Split</h4>
                                <p>แบ่งข้อมูลออกเป็นสองส่วน โดยถือว่าข้อมูลตำแหน่งแรกสุดเป็น "ส่วนที่ถูกเรียงแล้ว" เสมอ</p>
                            </div>
                        </div>
                        <div class="protocol-item">
                            <div class="protocol-number">02</div>
                            <div class="protocol-content">
                                <h4>Key Selection</h4>
                                <p>หยิบข้อมูลตัวแรกสุดจาก "ส่วนที่ยังไม่เรียง" มาเป็นตัวหลัก (Key) ในรอบนั้นๆ</p>
                            </div>
                        </div>
                        <div class="protocol-item">
                            <div class="protocol-number">03</div>
                            <div class="protocol-content">
                                <h4>Backward Scanning</h4>
                                <p>นำ Key ไปเปรียบเทียบย้อนหลังกับข้อมูลในส่วนที่เรียงแล้ว หากข้อมูลนั้นมากกว่า Key ให้ขยับขวาไป 1 ช่อง</p>
                            </div>
                        </div>
                        <div class="protocol-item">
                            <div class="protocol-number">04</div>
                            <div class="protocol-content">
                                <h4>Insertion</h4>
                                <p>เมื่อพบตำแหน่งที่ถูกต้อง (ค่าน้อยกว่า Key หรือถึงต้นอาเรย์) ให้แทรก Key ลงในตำแหน่งว่างนั้น</p>
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
