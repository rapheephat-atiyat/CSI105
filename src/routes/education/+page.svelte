<script lang="ts">
	import { ArrowRight, Cpu } from 'lucide-svelte';

	const algorithms = [
		{
			name: 'Bubble Sort',
			type: 'Quadratic',
			complexity: 'O(n²)',
			desc: 'เปรียบเทียบเลขคู่ติดกันและสลับที่กันไปเรื่อยๆ จนกว่าเลขที่มากที่สุดจะไปอยู่ท้ายสุด',
			preview: 'bubble'
		},
		{
			name: 'Selection Sort',
			type: 'Selection-Based',
			complexity: 'O(n²)',
			desc: 'ค้นหาตัวเลขที่น้อยที่สุดในส่วนที่ยังไม่เรียงลำดับ แล้วนำมาสลับไว้ข้างหน้าสุด',
			preview: 'selection'
		},
		{
			name: 'Insertion Sort',
			type: 'Adaptive',
			complexity: 'O(n²)',
			desc: 'หยิบตัวเลขออกมาทีละตัวแล้วนำไปแทรกในตำแหน่งที่ถูกต้องในส่วนที่เรียงลำดับแล้ว',
			preview: 'insertion'
		},
		{
			name: 'Quick Sort',
			type: 'Divide & Conquer',
			complexity: 'O(n log n)',
			desc: 'เลือก Pivot แล้วแบ่งข้อมูลเป็นสองฝั่ง (น้อยกว่า/มากกว่า Pivot) แล้วทำซ้ำแบบ Recursive',
			preview: 'quick'
		},
		{
			name: 'Merge Sort',
			type: 'Stable Sort',
			complexity: 'O(n log n)',
			desc: 'แบ่งข้อมูลออกเป็นส่วนย่อยที่สุดแล้วค่อยๆ นำกลับมารวมกัน (Merge) โดยเรียงลำดับไปด้วย',
			preview: 'merge'
		},
		{
			name: 'Heap Sort',
			type: 'Binary Tree',
			complexity: 'O(n log n)',
			desc: 'ใช้โครงสร้างข้อมูลแบบ Heap เพื่อดึงค่าที่มากที่สุดออกไปวางไว้ท้ายสุดของ Array',
			preview: 'heap'
		}
	];
</script>

<div class="min-h-screen">
	<div class="pointer-events-none fixed inset-0 z-0">
		<div class="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] bg-[size:40px_40px]"></div>
		<div class="absolute top-0 right-0 h-[50%] w-[50%] rounded-full bg-blue-600/5 blur-[120px]"></div>
	</div>

	<main class="relative z-10 mx-auto max-w-7xl px-6 pt-32 pb-24 md:px-12">
		<header class="mb-24 max-w-3xl">
			<div class="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-3 py-1 text-[10px] font-black tracking-[0.2em] text-blue-400 uppercase">
				<Cpu size={12} /> Laboratory Manual
			</div>
			<h1 class="mb-8 text-[clamp(3rem,8vw,5rem)] leading-[0.9] font-black tracking-tighter uppercase">
				Algorithm <br />
				<span class="bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">Catalog.</span>
			</h1>
			<p class="text-xl leading-relaxed font-medium text-zinc-500">ถอดรหัสตรรกะคอมพิวเตอร์ผ่านภาพจำลอง ค้นพบกลไกเบื้องหลังความเร็วของอัลกอริทึมระดับมาตรฐานโลก</p>
		</header>

		<section class="mb-32">
			<div class="mb-8 flex items-center gap-3">
				<div class="h-px flex-1 bg-white/5"></div>
				<h2 class="text-xs font-black tracking-[0.3em] text-zinc-600 uppercase">Complexity Matrix</h2>
				<div class="h-px flex-1 bg-white/5"></div>
			</div>

			<div class="overflow-x-auto rounded-[2rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl">
				<table class="w-full min-w-[800px] border-collapse text-left">
					<thead>
						<tr class="border-b border-white/5 bg-white/[0.02]">
							<th class="px-10 py-6 text-[10px] font-black tracking-widest text-zinc-500 uppercase">Algorithm</th>
							<th class="px-10 py-6 text-[10px] font-black tracking-widest text-zinc-500 uppercase">Best Case</th>
							<th class="px-10 py-6 text-[10px] font-black tracking-widest text-zinc-500 uppercase">Average Case</th>
							<th class="px-10 py-6 text-[10px] font-black tracking-widest text-zinc-500 uppercase">Worst Case</th>
							<th class="px-10 py-6 text-right text-[10px] font-black tracking-widest text-zinc-500 uppercase">Space</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-white/5 font-mono">
						{#each [['Bubble Sort', 'O(n)', 'O(n²)', 'O(n²)', 'O(1)'], ['Quick Sort', 'O(n log n)', 'O(n log n)', 'O(n²)', 'O(log n)'], ['Merge Sort', 'O(n log n)', 'O(n log n)', 'O(n log n)', 'O(n)']] as row}
							<tr class="group transition-colors hover:bg-white/[0.02]">
								<td class="px-10 py-6 text-sm font-bold tracking-tight text-white">{row[0]}</td>
								<td class="px-10 py-6 text-xs font-bold text-blue-400">{row[1]}</td>
								<td class="px-10 py-6 text-xs text-zinc-400">{row[2]}</td>
								<td class="px-10 py-6 text-xs text-red-500/80">{row[3]}</td>
								<td class="px-10 py-6 text-right text-xs text-zinc-500">{row[4]}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>

		<section class="mb-32 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each algorithms as algo}
				<a href="/education/{algo.preview}" class="group relative flex flex-col overflow-hidden rounded-[2rem] border border-white/5 bg-neutral-950 p-8 transition-all duration-500 hover:border-blue-500/30">
					<div class="pointer-events-none absolute inset-0 bg-blue-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

					<div class="mb-10 flex items-start justify-between">
						<span class="rounded-full border border-white/5 bg-white/5 px-3 py-1 text-[9px] font-black tracking-widest text-zinc-500 uppercase">{algo.type}</span>
						<span class="font-mono text-sm font-black text-blue-500">{algo.complexity}</span>
					</div>

					<h3 class="mb-4 text-2xl font-black tracking-tight text-white uppercase">{algo.name}</h3>
					<p class="mb-10 flex-1 text-sm leading-relaxed font-medium text-zinc-500">{algo.desc}</p>

					<div class="relative mb-8 flex h-24 items-center justify-center overflow-hidden rounded-2xl border border-white/5 bg-black/50 group-hover:border-blue-500/20">
						{#if algo.preview === 'bubble'}
							<div class="bubble-scene flex h-14 items-end gap-1 px-4">
								<div class="bar bar-b1"></div>
								<div class="bar bar-b2"></div>
								<div class="bar bar-b3"></div>
								<div class="bar bar-b4"></div>
								<div class="bar bar-b5"></div>
								<div class="bar bar-b6"></div>
							</div>
						{:else if algo.preview === 'selection'}
							<div class="sel-scene relative flex h-14 items-end gap-1 px-4">
								<div class="bar bar-s1"></div>
								<div class="bar bar-s2"></div>
								<div class="bar bar-s3"></div>
								<div class="bar bar-s4"></div>
								<div class="bar bar-s5"></div>
								<div class="bar bar-s6"></div>
								<div class="sel-scanner"></div>
							</div>
						{:else if algo.preview === 'insertion'}
							<div class="ins-scene relative flex h-14 items-end gap-1 px-4">
								<div class="bar bar-i1"></div>
								<div class="bar bar-i2"></div>
								<div class="bar bar-i3"></div>
								<div class="bar bar-i4"></div>
								<div class="bar bar-i5"></div>
								<div class="bar bar-i6 ins-key"></div>
							</div>
						{:else if algo.preview === 'quick'}
							<div class="qk-scene relative flex h-14 items-end gap-1 px-4">
								<div class="bar bar-q1 qk-left"></div>
								<div class="bar bar-q2 qk-left"></div>
								<div class="bar bar-q3 qk-left"></div>
								<div class="bar bar-q4 qk-pivot"></div>
								<div class="bar bar-q5 qk-right"></div>
								<div class="bar bar-q6 qk-right"></div>
								<div class="bar bar-q7 qk-right"></div>
							</div>
						{:else if algo.preview === 'merge'}
							<div class="mg-scene relative flex h-14 items-end gap-1 px-4">
								<div class="bar bar-m1 mg-left"></div>
								<div class="bar bar-m2 mg-left"></div>
								<div class="bar bar-m3 mg-left"></div>
								<div class="bar bar-m4 mg-right"></div>
								<div class="bar bar-m5 mg-right"></div>
								<div class="bar bar-m6 mg-right"></div>
							</div>
						{:else if algo.preview === 'heap'}
							<div class="hp-scene relative flex h-full w-full items-center justify-center">
								<div class="hp-node hp-n0" style="top:12px;left:50%;transform:translateX(-50%)"></div>
								<div class="hp-node hp-n1" style="top:34px;left:30%"></div>
								<div class="hp-node hp-n2" style="top:34px;left:60%"></div>
								<div class="hp-node hp-n3" style="top:56px;left:18%"></div>
								<div class="hp-node hp-n4" style="top:56px;left:38%"></div>
								<div class="hp-node hp-n5" style="top:56px;left:52%"></div>
								<div class="hp-node hp-n6" style="top:56px;left:70%"></div>
								<svg class="absolute inset-0 h-full w-full" style="pointer-events:none">
									<line class="hp-edge" x1="50%" y1="20" x2="33%" y2="38" />
									<line class="hp-edge" x1="50%" y1="20" x2="67%" y2="38" />
									<line class="hp-edge" x1="33%" y1="38" x2="22%" y2="60" />
									<line class="hp-edge" x1="33%" y1="38" x2="42%" y2="60" />
									<line class="hp-edge" x1="67%" y1="38" x2="56%" y2="60" />
									<line class="hp-edge" x1="67%" y1="38" x2="74%" y2="60" />
								</svg>
							</div>
						{/if}
					</div>

					<div class="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase transition-colors group-hover:text-blue-500">
						Learn Protocol <ArrowRight size={12} class="transition-transform group-hover:translate-x-1" />
					</div>
				</a>
			{/each}
		</section>

		<section class="relative flex flex-col items-center justify-between gap-12 overflow-hidden rounded-[3rem] border border-white/5 bg-zinc-950 p-12 text-center md:flex-row md:p-20 md:text-left">
			<div class="pointer-events-none absolute top-0 right-0 h-full w-[40%] bg-blue-600/5 blur-[100px]"></div>
			<div class="relative z-10">
				<h2 class="mb-6 text-3xl font-black tracking-tight text-white uppercase md:text-4xl">Ready for field testing?</h2>
				<p class="max-w-md leading-relaxed font-medium text-zinc-500">นำความรู้ทฤษฎีไปทดสอบในเครื่องจำลอง Benchmark อัลกอริทึมเหล่านี้ด้วยชุดข้อมูลที่คุณสร้างเอง</p>
			</div>
			<a href="/practice" class="relative z-10 rounded-2xl bg-white px-10 py-5 text-sm font-black tracking-widest text-black uppercase shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-all hover:bg-zinc-200 active:scale-95"> Start Simulation </a>
		</section>
	</main>
</div>

<style>
	/* =========================================
	   BASE STYLES
	========================================= */
	.bar {
		width: 10px;
		border-radius: 3px 3px 0 0;
		background: #27272a;
		flex-shrink: 0;
		position: relative;
	}

	/* =========================================
	   1. BUBBLE SORT (Compare -> Hop -> Swap)
	========================================= */
	.bar-b1 {
		height: 28px;
	}
	.bar-b2 {
		height: 44px;
		animation: bub-tall 4s ease-in-out infinite;
		z-index: 2;
	}
	.bar-b3 {
		height: 20px;
		animation: bub-short 4s ease-in-out infinite;
		z-index: 1;
	}
	.bar-b4 {
		height: 36px;
		animation: bub-idle 4s ease-in-out infinite;
	}
	.bar-b5 {
		height: 52px;
		animation: bub-idle 4s ease-in-out infinite;
	}
	.bar-b6 {
		height: 56px;
		background: #1d4ed8;
	}

	@keyframes bub-idle {
		0%,
		15% {
			background: #27272a;
		}
		20%,
		30% {
			background: #3f3f46;
		} /* แท่งอื่นสว่างขึ้นเล็กน้อยตอนทำงาน */
		35%,
		100% {
			background: #27272a;
		}
	}
	@keyframes bub-tall {
		/* ตัวสูงกระโดดข้าม */
		0%,
		10% {
			transform: translate(0, 0);
			background: #27272a;
		}
		15%,
		25% {
			transform: translate(0, 0);
			background: #ef4444;
		} /* แดง = ผิดลำดับ */
		30%,
		45% {
			transform: translate(14px, -15px);
			background: #3b82f6;
		} /* ยกข้ามไปทางขวา */
		50%,
		65% {
			transform: translate(14px, 0);
			background: #22c55e;
		} /* ลงจอด (เขียว) */
		75%,
		100% {
			transform: translate(0, 0);
			background: #27272a;
		}
	}
	@keyframes bub-short {
		/* ตัวเตี้ยมุดซ้าย */
		0%,
		10% {
			transform: translate(0, 0);
			background: #27272a;
		}
		15%,
		25% {
			transform: translate(0, 0);
			background: #ef4444;
		}
		30%,
		45% {
			transform: translate(-14px, 0);
			background: #3b82f6;
		} /* มุดซ้าย */
		50%,
		65% {
			transform: translate(-14px, 0);
			background: #22c55e;
		}
		75%,
		100% {
			transform: translate(0, 0);
			background: #27272a;
		}
	}

	/* =========================================
	   2. SELECTION SORT (Scan Min -> Swap)
	========================================= */
	.sel-scene {
		position: relative;
	}
	.bar-s1 {
		height: 44px;
		animation: sel-s1 4s ease-in-out infinite;
		z-index: 1;
	}
	.bar-s2 {
		height: 20px;
	}
	.bar-s3 {
		height: 36px;
	}
	.bar-s4 {
		height: 52px;
	}
	.bar-s5 {
		height: 28px;
	}
	.bar-s6 {
		height: 16px;
		animation: sel-s6 4s ease-in-out infinite;
		z-index: 2;
	}

	.sel-scanner {
		position: absolute;
		top: -5px;
		bottom: 0;
		width: 4px;
		background: rgba(59, 130, 246, 0.5);
		border-radius: 2px;
		animation: sel-scan 4s linear infinite;
		pointer-events: none;
	}

	@keyframes sel-scan {
		0%,
		5% {
			left: 4%;
			opacity: 0;
			background: #3b82f6;
		}
		10% {
			left: 4%;
			opacity: 1;
		}
		35% {
			left: 93%;
			background: #3b82f6;
		}
		40%,
		60% {
			left: 93%;
			background: #ef4444;
			opacity: 1;
			box-shadow: 0 0 10px #ef4444;
		} /* เจอตัวน้อยสุดแล้วแดง */
		65%,
		100% {
			opacity: 0;
			left: 93%;
		}
	}
	@keyframes sel-s1 {
		/* ตัวหน้าสุดหลบไปขวา */
		0%,
		45% {
			transform: translate(0, 0);
			background: #27272a;
		}
		50%,
		65% {
			transform: translate(70px, 0);
			background: #3b82f6;
		}
		70%,
		85% {
			transform: translate(70px, 0);
			background: #27272a;
		}
		95%,
		100% {
			transform: translate(0, 0);
			background: #27272a;
		}
	}
	@keyframes sel-s6 {
		/* ตัวน้อยสุดกระโดดมาหน้าสุด */
		0%,
		35% {
			transform: translate(0, 0);
			background: #27272a;
		}
		40%,
		45% {
			transform: translate(0, 0);
			background: #ef4444;
		} /* โดนสแกนเจอ */
		50%,
		65% {
			transform: translate(-70px, -15px);
			background: #eab308;
		} /* กระโดดมาซ้ายสุด */
		70%,
		85% {
			transform: translate(-70px, 0);
			background: #22c55e;
		} /* จัดเรียงแล้ว */
		95%,
		100% {
			transform: translate(0, 0);
			background: #27272a;
		}
	}

	/* =========================================
	   3. INSERTION SORT (Pull -> Shift -> Insert)
	========================================= */
	.bar-i1 {
		height: 20px;
	}
	.bar-i2 {
		height: 32px;
		animation: ins-shift 4s ease-in-out infinite;
	}
	.bar-i3 {
		height: 44px;
		animation: ins-shift 4s ease-in-out infinite;
	}
	.bar-i4 {
		height: 52px;
		animation: ins-shift 4s ease-in-out infinite;
	}
	.bar-i5 {
		height: 36px;
		animation: ins-shift 4s ease-in-out infinite;
	}
	.bar-i6 {
		height: 24px;
		animation: ins-key 4s ease-in-out infinite;
		z-index: 2;
	}

	@keyframes ins-key {
		/* แท่งเป้าหมายที่ดึงออกมา */
		0%,
		10% {
			transform: translate(0, 0);
			background: #27272a;
		}
		15%,
		25% {
			transform: translate(0, -20px);
			background: #f59e0b;
		} /* ดึงลอยขึ้น */
		35%,
		45% {
			transform: translate(-56px, -20px);
			background: #3b82f6;
		} /* บินข้ามหัวตัวอื่น */
		50%,
		70% {
			transform: translate(-56px, 0);
			background: #22c55e;
		} /* แทรกลงช่องว่าง */
		85%,
		100% {
			transform: translate(0, 0);
			background: #27272a;
		}
	}
	@keyframes ins-shift {
		/* แท่งอื่นหลบทางขวา */
		0%,
		30% {
			transform: translateX(0);
		}
		40%,
		75% {
			transform: translateX(14px);
			background: #3f3f46;
		} /* แหวกช่องว่าง */
		85%,
		100% {
			transform: translateX(0);
		}
	}

	/* =========================================
	   4. QUICK SORT (Pivot & Partition)
	========================================= */
	.bar-q1 {
		height: 36px;
	}
	.bar-q2 {
		height: 52px;
		animation: qk-swap-right 3s ease-in-out infinite;
	}
	.bar-q3 {
		height: 20px;
	}
	.bar-q4 {
		height: 40px;
		animation: qk-pivot 3s ease-in-out infinite;
		background: #f59e0b;
		z-index: 3;
	}
	.bar-q5 {
		height: 28px;
	}
	.bar-q6 {
		height: 48px;
	}
	.bar-q7 {
		height: 16px;
		animation: qk-swap-left 3s ease-in-out infinite;
		z-index: 2;
	}

	@keyframes qk-pivot {
		0%,
		100% {
			box-shadow: 0 0 5px rgba(245, 158, 11, 0.5);
		}
		50% {
			box-shadow: 0 0 15px rgba(245, 158, 11, 1);
			transform: scaleY(1.05);
		}
	}
	@keyframes qk-swap-right {
		0%,
		20% {
			transform: translateX(0);
			background: #27272a;
		}
		30%,
		40% {
			transform: translateX(0);
			background: #ef4444;
		}
		50%,
		75% {
			transform: translate(70px, -10px);
			background: #3b82f6;
		}
		85%,
		100% {
			transform: translateX(0);
			background: #27272a;
		}
	}
	@keyframes qk-swap-left {
		0%,
		20% {
			transform: translateX(0);
			background: #27272a;
		}
		30%,
		40% {
			transform: translateX(0);
			background: #ef4444;
		}
		50%,
		75% {
			transform: translate(-70px, 10px);
			background: #3b82f6;
		}
		85%,
		100% {
			transform: translateX(0);
			background: #27272a;
		}
	}

	/* =========================================
	   5. MERGE SORT (Split & Interleave)
	========================================= */
	.bar-m1 {
		height: 28px;
		animation: mg-left-group 3s ease-in-out infinite;
	}
	.bar-m2 {
		height: 44px;
		animation: mg-left-group 3s ease-in-out infinite 0.1s;
	}
	.bar-m3 {
		height: 20px;
		animation: mg-left-group 3s ease-in-out infinite 0.2s;
	}
	.bar-m4 {
		height: 36px;
		animation: mg-right-group 3s ease-in-out infinite;
	}
	.bar-m5 {
		height: 52px;
		animation: mg-right-group 3s ease-in-out infinite 0.1s;
	}
	.bar-m6 {
		height: 24px;
		animation: mg-right-group 3s ease-in-out infinite 0.2s;
	}

	@keyframes mg-left-group {
		0%,
		15% {
			transform: translate(0, 0);
			background: #27272a;
		}
		25%,
		45% {
			transform: translate(-8px, -10px);
			background: #3b82f6;
		}
		60%,
		80% {
			transform: translate(0, 0);
			background: #22c55e;
		}
		90%,
		100% {
			transform: translate(0, 0);
			background: #27272a;
		}
	}
	@keyframes mg-right-group {
		0%,
		15% {
			transform: translate(0, 0);
			background: #27272a;
		}
		25%,
		45% {
			transform: translate(8px, -10px);
			background: #8b5cf6;
		}
		60%,
		80% {
			transform: translate(0, 0);
			background: #22c55e;
		}
		90%,
		100% {
			transform: translate(0, 0);
			background: #27272a;
		}
	}

	/* =========================================
	   6. HEAP SORT (Extract Max & Bubble Down)
	========================================= */
	.hp-node {
		position: absolute;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: #27272a;
		border: 1px solid #3f3f46;
	}
	.hp-edge {
		stroke: #27272a;
		stroke-width: 1;
	}

	.hp-n0 {
		animation: heap-root 3s ease-in-out infinite;
	}
	.hp-n1 {
		animation: heap-child 3s ease-in-out infinite 0.2s;
	}
	.hp-n2 {
		animation: heap-child 3s ease-in-out infinite 0.4s;
	}
	.hp-n6 {
		animation: heap-leaf 3s ease-in-out infinite;
	}

	@keyframes heap-root {
		0%,
		15% {
			transform: translateX(-50%) scale(1);
			background: #27272a;
			opacity: 1;
		}
		25%,
		40% {
			transform: translateX(-50%) scale(1.4);
			background: #ef4444;
			opacity: 1;
			box-shadow: 0 0 10px #ef4444;
		}
		50%,
		70% {
			transform: translateX(-50%) translateY(-20px);
			opacity: 0;
		}
		80%,
		100% {
			transform: translateX(-50%) scale(1);
			background: #27272a;
			opacity: 1;
		}
	}
	@keyframes heap-leaf {
		0%,
		40% {
			transform: translate(0, 0);
			background: #27272a;
			opacity: 1;
		}
		50%,
		70% {
			transform: translate(-70px, -44px);
			background: #f59e0b;
			opacity: 1;
		}
		80%,
		100% {
			transform: translate(0, 0);
			background: #27272a;
			opacity: 1;
		}
	}
	@keyframes heap-child {
		0%,
		60% {
			background: #27272a;
			transform: scale(1);
		}
		70%,
		80% {
			background: #3b82f6;
			transform: scale(1.2);
		}
		90%,
		100% {
			background: #27272a;
			transform: scale(1);
		}
	}
</style>
