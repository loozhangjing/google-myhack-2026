<script>
  import { onMount } from 'svelte';
  import gsap from 'gsap';

  let heroRef;

  onMount(() => {
    let ctx = gsap.context(() => {
      gsap.from(".hero-text", {
        y: 40,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: "power3.out",
        delay: 0.2
      });
    }, heroRef);

    return () => ctx.revert();
  });
</script>

<section bind:this={heroRef} class="relative w-full h-[100dvh] flex items-end pb-24 lg:pb-32 px-6 lg:px-16 overflow-hidden">
  <div class="absolute inset-0 z-0">
    <img 
      src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop" 
      alt="Dark luxury architecture" 
      class="w-full h-full object-cover"
    />
    <div class="absolute inset-0 bg-gradient-to-t from-[#0D0D12] via-[#0D0D12]/60 to-transparent"></div>
  </div>

  <div class="relative z-10 max-w-4xl">
    <h1 class="flex flex-col text-[#FAF8F5] leading-[1.1]">
      <span class="hero-text text-3xl md:text-5xl font-semibold tracking-tight uppercase">Elite potential meets</span>
      <span class="hero-text text-7xl md:text-9xl font-drama text-[#C9A84C] mt-2">Precision.</span>
    </h1>
    <p class="hero-text text-[#FAF8F5]/80 text-lg md:text-xl mt-8 max-w-xl font-light">
      Connecting world-class talent with visionary seekers. Enter the private network.
    </p>
    <div class="hero-text mt-10">
      <button class="btn-magnetic bg-[#C9A84C] text-[#0D0D12] px-8 py-4 rounded-full font-medium text-lg flex items-center gap-2">
        <span class="btn-content">Initiate Search</span>
      </button>
    </div>
  </div>
</section>
