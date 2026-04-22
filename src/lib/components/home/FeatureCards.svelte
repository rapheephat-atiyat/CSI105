<script>
	import { goto } from "$app/navigation";

</script>
<div>
	<section class="section">
		<div class="grid">
			<!-- Card 1 EDUCATION -->
			<div class="card">
				<div class="glow primary"></div>
				<div class="card-content">
					<div class="icon primary">
						<span class="material-symbols-outlined">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
								<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
							</svg>
						</span>
					</div>
					<h3>EDUCATION</h3>
					<p>Explore the Algorithm Catalog. Learn Big O and logic through interactive visualizers.</p>
				</div>
				<div class="card-footer">
					<ul>
						<li>Visual Big O Notations</li>
						<li>Step-by-step Execution</li>
					</ul>
					<button class="btn primary" onclick={() => goto("/education")}>ENTER CLASSROOM »</button>
				</div>
			</div>
			<!-- Card 2 COMPETITION -->
			<div class="card highlight">
				<div class="glow secondary"></div>
				<div class="card-content">
					<div class="icon secondary">
						<span class="material-symbols-outlined">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
								<path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
							</svg>
						</span>
					</div>
					<h3>COMPETITION</h3>
					<p>Join live sort-wars. Input codes and rank globally against top-tier architects.</p>
				</div>
				<div class="card-footer">
					<button class="btn secondary" onclick={() => goto("/lobby")}>JOIN BATTLE »</button>
				</div>
			</div>
			<!-- Card 3 PRACTICE -->
			<div class="card">
				<div class="glow tertiary"></div>
				<div class="card-content">
					<div class="icon tertiary">
						<span class="material-symbols-outlined">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
								<path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
							</svg>
						</span>
					</div>
					<h3>PRACTICE</h3>
					<p>Laboratory workbench. Easy and Hard modes for active experimentation with raw data.</p>
				</div>
				<div class="card-footer">
					<button class="btn tertiary" onclick={() => goto("/practice")}>OPEN WORKBENCH »</button>
				</div>
			</div>
		</div>
	</section>
</div>

<style>
	.section {
		max-width: 1200px;
		padding: 40px 20px;
		margin: auto;
	}

	.grid {
		display: grid;
		gap: 24px;
	}

	@media (min-width: 768px) {
		.grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	/* card */
	.card {
		position: relative;
		background: rgb(225, 225, 225, 0.05);
		backdrop-filter: blue(20px);
		border-radius: 30px;
		padding: 20px;
		min-height: 400px;
		display: flex;
		flex-direction: column;
		border: 1px solid rgba(255, 255, 255, 0.1);
		transition: 0.4s;
	}

	.card:hover {
		border-color: white;
	}

	.highlight {
		transform: scale(1.05);
		background: rgb(225, 225, 225, 0.08);
	}

	/* Glow */
	.glow {
		position: absolute;
		top: -50px;
		right: -50px;
		width: 180px;
		height: 180px;
		border-radius: 50%;
		filter: blur(80px);
	}

	.primary {
		background: rgba(79, 209, 255, 0.2);
	}
	.secondary {
		background: rgba(100, 255, 200, 0.2);
	}
	.tertiary {
		background: rgba(255, 120, 150, 0.2);
	}

	/* Content */
	.card-content {
		margin-bottom: 30px;
	}

	.card h3 {
		font-size: 24px;
		font-weight: bold;
		margin-bottom: 10px;
	}

	.card p {
		color: #aaa;
	}

	/* Icon */
	.icon {
		width: 50px;
		height: 50px;
		border-radius: 15px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 20px;
	}

	/* Footer */
	.card-footer {
		margin-top: auto;
	}

	/* List */
	ul {
		margin-bottom: 20px;
	}

	ul li {
		font-size: 14px;
		margin-bottom: 8px;
	}

	/* Button */
	.btn {
		width: 100%;
		padding: 12px;
		border-radius: 12px;
		border: none;
		font-weight: bold;
		cursor: pointer;
		transition: 0.3s;
	}

	.btn.primary {
		background: #1f2937;
		color: #4fd1ff;
	}
	.btn.primary:hover {
		background: #4fd1ff;
		color: #000;
	}

	.btn.secondary {
		background: #1f2937;
		color: #67f73c;
	}
	.btn.secondary:hover {
		background: #67f73c;
		color: #000;
	}

	.btn.tertiary {
		background: #1f2937;
		color: #ff5151;
	}
	.btn.tertiary:hover {
		background: #ff5151;
		color: #000;
	}
</style>
