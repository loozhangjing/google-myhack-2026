<script>
  import { onMount } from 'svelte';
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

  let sectionRef;
  let cardRefs = [];

  onMount(() => {
    gsap.registerPlugin(ScrollTrigger);

    let ctx = gsap.context(() => {
      cardRefs.forEach((card, i) => {
        if (i === 0) return;
        
        gsap.to(cardRefs[i - 1], {
          scale: 0.9,
          opacity: 0.5,
          filter: "blur(20px)",
          scrollTrigger: {
            trigger: card,
            start: "top bottom",
            end: "top top",
            scrub: true,
          }
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  });
</script>

<section id="protocol" bind:this={sectionRef} class="w-full bg-[#0D0D12] relative">
  <!-- Card 1 -->
  <div bind:this={cardRefs[0]} class="sticky top-0 w-full h-[100dvh] flex items-center justify-center p-6 lg:p-16 bg-[#0D0D12]">
    <div class="w-full max-w-6xl h-full max-h-[800px] bg-[#1A1A24] rounded-[3rem] border border-[#2A2A35] flex flex-col md:flex-row items-center p-12 gap-12 overflow-hidden shadow-2xl relative">
      <div class="flex-1 z-10">
        <span class="font-mono text-[#C9A84C] text-lg">01</span>
        <h3 class="text-4xl md:text-6xl font-semibold text-[#FAF8F5] mt-4 mb-6">Identification</h3>
        <p class="text-[#FAF8F5]/70 text-lg max-w-md">Our intelligence layer scans private networks to surface passive, elite candidates matching your exact technical requirements.</p>
      </div>
      <div class="flex-1 flex justify-center items-center relative h-full min-h-[300px]">
        <!-- Rotating Geometric Motif -->
        <svg class="w-full max-w-[300px] text-[#C9A84C]/20 animate-[spin_20s_linear_infinite]" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="0.5">
          <circle cx="50" cy="50" r="40" />
          <circle cx="50" cy="50" r="30" />
          <circle cx="50" cy="50" r="20" />
          <path d="M50 10 L50 90 M10 50 L90 50 M21.7 21.7 L78.3 78.3 M21.7 78.3 L78.3 21.7" />
        </svg>
      </div>
    </div>
  </div>

  <!-- Card 2 -->
  <div bind:this={cardRefs[1]} class="sticky top-0 w-full h-[100dvh] flex items-center justify-center p-6 lg:p-16 bg-[#0D0D12]">
    <div class="w-full max-w-6xl h-full max-h-[800px] bg-[#111118] rounded-[3rem] border border-[#2A2A35] flex flex-col md:flex-row items-center p-12 gap-12 overflow-hidden shadow-2xl relative">
      <div class="flex-1 z-10">
        <span class="font-mono text-[#C9A84C] text-lg">02</span>
        <h3 class="text-4xl md:text-6xl font-semibold text-[#FAF8F5] mt-4 mb-6">Evaluation</h3>
        <p class="text-[#FAF8F5]/70 text-lg max-w-md">Every candidate passes through a rigorous technical and cultural assessment protocol before they reach your network.</p>
      </div>
      <div class="flex-1 flex justify-center items-center relative h-full min-h-[300px] overflow-hidden">
        <!-- Scanning Laser -->
        <div class="w-full max-w-[300px] aspect-square relative border border-[#2A2A35]">
          <div class="absolute inset-0 grid grid-cols-10 grid-rows-10 gap-1 p-2">
            {#each Array(100) as _}
              <div class="bg-[#FAF8F5]/5 rounded-sm"></div>
            {/each}
          </div>
          <div class="absolute top-0 left-0 w-full h-[2px] bg-[#C9A84C] shadow-[0_0_15px_#C9A84C] animate-[bounce_3s_infinite_ease-in-out]"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Card 3 -->
  <div bind:this={cardRefs[2]} class="sticky top-0 w-full h-[100dvh] flex items-center justify-center p-6 lg:p-16 bg-[#0D0D12]">
    <div class="w-full max-w-6xl h-full max-h-[800px] bg-[#0A0A10] rounded-[3rem] border border-[#C9A84C]/30 flex flex-col md:flex-row items-center p-12 gap-12 overflow-hidden shadow-2xl relative">
      <div class="flex-1 z-10">
        <span class="font-mono text-[#C9A84C] text-lg">03</span>
        <h3 class="text-4xl md:text-6xl font-semibold text-[#FAF8F5] mt-4 mb-6">Integration</h3>
        <p class="text-[#FAF8F5]/70 text-lg max-w-md">Seamlessly merge top-tier talent into your existing workflows with synchronized scheduling and automated compliance.</p>
      </div>
      <div class="flex-1 flex justify-center items-center relative h-full min-h-[300px]">
        <!-- Pulsing Waveform -->
        <svg class="w-full max-w-[300px] text-[#C9A84C]" viewBox="0 0 200 100" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M0 50 L40 50 L50 20 L60 80 L70 50 L110 50 L120 10 L130 90 L140 50 L200 50" stroke-dasharray="300" stroke-dashoffset="300">
            <animate attributeName="stroke-dashoffset" values="300;0" dur="2s" repeatCount="indefinite" />
          </path>
        </svg>
      </div>
    </div>
  </div>
</section>
