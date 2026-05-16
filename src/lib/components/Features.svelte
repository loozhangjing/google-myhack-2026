<script>
  import { onMount } from 'svelte';
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

  let typeWriterRef;
  let cursorRef;

  onMount(() => {
    gsap.registerPlugin(ScrollTrigger);

    let ctx = gsap.context(() => {
      // Typewriter Effect
      gsap.to(".typing-text", {
        text: "Analyzing market data... Match confidence: 98.4%. Initiating secure handshake protocol.",
        duration: 3,
        ease: "none",
        scrollTrigger: {
          trigger: typeWriterRef,
          start: "top 80%",
        }
      });

      // Cursor Scheduler Effect
      let tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
      tl.to(".animated-cursor", { x: 100, y: 50, duration: 1, ease: "power2.inOut" })
        .to(".animated-cursor", { scale: 0.8, duration: 0.1, yoyo: true, repeat: 1 })
        .to(".calendar-day-3", { backgroundColor: "#C9A84C", color: "#0D0D12", duration: 0.2 })
        .to(".animated-cursor", { x: 200, y: 150, duration: 1, ease: "power2.inOut" }, "+=0.5")
        .to(".animated-cursor", { scale: 0.8, duration: 0.1, yoyo: true, repeat: 1 })
        .to(".save-btn", { backgroundColor: "#FAF8F5", color: "#0D0D12", duration: 0.2 })
        .to(".animated-cursor", { opacity: 0, duration: 0.3 });
    });

    return () => ctx.revert();
  });
</script>

<section class="w-full py-24 px-6 lg:px-16 bg-[#0D0D12] text-[#FAF8F5]">
  <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
    
    <!-- Telemetry Typewriter -->
    <div bind:this={typeWriterRef} class="bg-[#2A2A35]/30 border border-[#FAF8F5]/10 rounded-[2rem] p-10 flex flex-col justify-between min-h-[400px] shadow-lg relative overflow-hidden">
      <div>
        <div class="flex items-center gap-3 mb-8">
          <span class="w-3 h-3 rounded-full bg-[#C9A84C] animate-pulse"></span>
          <span class="font-mono text-xs text-[#FAF8F5]/60 uppercase tracking-widest">Live Feed</span>
        </div>
        <h3 class="text-3xl font-semibold mb-4 tracking-tight">Market Telemetry</h3>
        <p class="text-[#FAF8F5]/70 text-sm">Real-time signal processing of global talent availability.</p>
      </div>
      
      <div class="bg-[#0D0D12]/80 rounded-xl p-6 border border-[#2A2A35] font-mono text-sm text-[#C9A84C] h-32 relative">
        <span class="typing-text"></span><span class="animate-pulse">_</span>
      </div>
    </div>

    <!-- Cursor Protocol Scheduler -->
    <div bind:this={cursorRef} class="bg-[#2A2A35]/30 border border-[#FAF8F5]/10 rounded-[2rem] p-10 flex flex-col justify-between min-h-[400px] shadow-lg relative overflow-hidden">
      <div>
        <h3 class="text-3xl font-semibold mb-4 tracking-tight">Precision Scheduling</h3>
        <p class="text-[#FAF8F5]/70 text-sm">Automated interview coordination protocol.</p>
      </div>
      
      <div class="relative bg-[#0D0D12]/80 rounded-xl p-6 border border-[#2A2A35] mt-8">
        <div class="grid grid-cols-7 gap-2 mb-6">
          {#each ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as day}
            <div class="text-center font-mono text-xs text-[#FAF8F5]/40 pb-2">{day}</div>
          {/each}
          {#each Array(14) as _, i}
            <div class="aspect-square rounded border border-[#2A2A35] flex items-center justify-center text-xs font-mono calendar-day-{i}">
              {i + 1}
            </div>
          {/each}
        </div>
        <div class="w-full h-10 rounded border border-[#2A2A35] flex items-center justify-center text-xs font-mono uppercase tracking-widest text-[#FAF8F5]/60 save-btn transition-colors">
          Confirm Block
        </div>

        <!-- Animated SVG Cursor -->
        <svg class="animated-cursor absolute top-0 left-0 w-6 h-6 text-[#FAF8F5] drop-shadow-lg z-20 pointer-events-none" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 2.871L21.365 11.2a1 1 0 0 1 .135 1.777l-6.89 3.444-3.445 6.89a1 1 0 0 1-1.777-.135L2.871 4a1 1 0 0 1 1.129-1.129z" />
        </svg>
      </div>
    </div>

  </div>
</section>
