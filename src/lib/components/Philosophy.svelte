<script>
  import { onMount } from 'svelte';
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

  let philRef;

  onMount(() => {
    gsap.registerPlugin(ScrollTrigger);

    let ctx = gsap.context(() => {
      gsap.from(".phil-line-1", {
        y: 30,
        opacity: 0,
        duration: 1,
        scrollTrigger: {
          trigger: philRef,
          start: "top 70%",
        }
      });
      
      gsap.from(".phil-line-2", {
        y: 50,
        opacity: 0,
        duration: 1.5,
        ease: "power3.out",
        scrollTrigger: {
          trigger: philRef,
          start: "top 60%",
        }
      });
      
      gsap.to(".parallax-bg", {
        yPercent: 20,
        ease: "none",
        scrollTrigger: {
          trigger: philRef,
          scrub: true
        }
      });
    });

    return () => ctx.revert();
  });
</script>

<section bind:this={philRef} id="philosophy" class="relative w-full py-40 px-6 lg:px-16 bg-[#0D0D12] overflow-hidden flex items-center justify-center min-h-[80vh]">
  <div class="absolute inset-0 z-0 overflow-hidden">
    <img 
      src="https://images.unsplash.com/photo-1574621100236-d25061dbdc1b?q=80&w=2000&auto=format&fit=crop" 
      alt="Dark texture" 
      class="parallax-bg w-full h-[120%] object-cover opacity-10 absolute top-[-10%]"
    />
  </div>

  <div class="relative z-10 max-w-5xl w-full text-center">
    <p class="phil-line-1 text-[#FAF8F5]/60 text-lg md:text-2xl font-light mb-8">
      Most networking platforms focus on: <span class="text-[#FAF8F5]">algorithmic volume.</span>
    </p>
    <h2 class="phil-line-2 text-4xl md:text-7xl lg:text-8xl text-[#FAF8F5] leading-tight font-semibold">
      We focus on: <br/> <span class="font-drama text-[#C9A84C]">Curated Synergy.</span>
    </h2>
  </div>
</section>
