<script>
  import Navbar from '$lib/components/Navbar.svelte';
  import Hero from '$lib/components/Hero.svelte';
  import SwipeDeck from '$lib/components/SwipeDeck.svelte';
  import Features from '$lib/components/Features.svelte';
  import Philosophy from '$lib/components/Philosophy.svelte';
  import Protocol from '$lib/components/Protocol.svelte';
  import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
  <title>Connect | Midnight Luxe</title>
</svelte:head>

<main class="w-full bg-[#0D0D12] text-[#FAF8F5] overflow-x-hidden">
  <Navbar />
  <Hero />
  <SwipeDeck />
  <Features />
  <Philosophy />
  <Protocol />
  <Footer />
</main>
