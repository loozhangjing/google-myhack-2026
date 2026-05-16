<script>
  import { onMount } from 'svelte';
  
  let scrolled = $state(false);

  onMount(() => {
    const handleScroll = () => {
      scrolled = window.scrollY > 50;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });
</script>

<nav class="fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-in-out {scrolled ? 'bg-[#0D0D12]/80 backdrop-blur-xl border border-[#2A2A35] px-8 py-4 rounded-full' : 'bg-transparent px-4 py-4'}">
  <div class="flex items-center gap-12">
    <div class="text-[#FAF8F5] font-bold text-xl tracking-tight">Connect</div>
    <div class="hidden md:flex items-center gap-8 text-sm text-[#FAF8F5]/80">
      <a href="#deck" class="hover:text-[#C9A84C] transition-colors">Network</a>
      <a href="#philosophy" class="hover:text-[#C9A84C] transition-colors">Philosophy</a>
      <a href="#protocol" class="hover:text-[#C9A84C] transition-colors">Protocol</a>
    </div>
    <button class="btn-magnetic bg-[#C9A84C] text-[#0D0D12] px-6 py-2 rounded-full font-medium text-sm">
      <span class="btn-content">Join Network</span>
    </button>
  </div>
</nav>
