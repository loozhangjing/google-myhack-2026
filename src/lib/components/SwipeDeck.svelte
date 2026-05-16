<script>
  import { spring } from 'svelte/motion';
  import { swipeProfiles } from '../data';
  import { X, Check } from 'lucide-svelte';

  let profiles = $state([...swipeProfiles]);
  
  let x = spring(0, { stiffness: 0.1, damping: 0.4 });
  let y = spring(0, { stiffness: 0.1, damping: 0.4 });
  let rotation = spring(0, { stiffness: 0.1, damping: 0.4 });

  let isDragging = false;
  let startX = 0;
  let startY = 0;

  function handlePointerDown(e) {
    if (profiles.length === 0) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    e.target.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e) {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    x.set(dx);
    y.set(dy);
    rotation.set(dx * 0.05);
  }

  function handlePointerUp(e) {
    if (!isDragging) return;
    isDragging = false;
    const currentX = $x;
    
    if (Math.abs(currentX) > window.innerWidth * 0.25) {
      const direction = currentX > 0 ? 1 : -1;
      x.set(window.innerWidth * direction);
      
      setTimeout(() => {
        let currentProfile = profiles[0];
        profiles = [...profiles.slice(1), currentProfile];
        x.set(0, { hard: true });
        y.set(0, { hard: true });
        rotation.set(0, { hard: true });
      }, 300);
    } else {
      x.set(0);
      y.set(0);
      rotation.set(0);
    }
  }

  function swipeButton(direction) {
    x.set(window.innerWidth * direction);
    setTimeout(() => {
        let currentProfile = profiles[0];
        profiles = [...profiles.slice(1), currentProfile];
        x.set(0, { hard: true });
        y.set(0, { hard: true });
        rotation.set(0, { hard: true });
    }, 300);
  }
</script>

<section id="deck" class="w-full min-h-[80vh] py-24 flex flex-col items-center justify-center relative overflow-hidden bg-[#0D0D12]">
  <div class="text-center mb-12 relative z-10">
    <h2 class="text-3xl md:text-5xl font-semibold text-[#FAF8F5]">Evaluate <span class="font-drama text-[#C9A84C]">Talent.</span></h2>
    <p class="text-[#FAF8F5]/60 mt-4 font-mono text-sm uppercase tracking-widest">Live Telemetry Data</p>
  </div>

  <div class="relative w-full max-w-[360px] md:max-w-[420px] aspect-[3/4] z-10 perspective-1000">
    {#each profiles as profile, i (profile.id)}
      {@const isTop = i === 0}
      {@const scale = isTop ? 1 : 1 - (i * 0.05)}
      {@const translateY = isTop ? 0 : i * 15}
      {@const zIndex = profiles.length - i}
      {@const opacity = i < 3 ? 1 : 0}

      <div 
        class="absolute inset-0 rounded-system bg-[#2A2A35] shadow-2xl overflow-hidden border border-[#FAF8F5]/10 select-none touch-none"
        style="
          z-index: {zIndex};
          opacity: {opacity};
          transform: {isTop ? `translate3d(${$x}px, ${$y}px, 0) rotate(${$rotation}deg)` : `translate3d(0, ${translateY}px, 0) scale(${scale})`};
          transition: {isTop && isDragging ? 'none' : 'transform 0.3s ease-out'};
        "
        onpointerdown={isTop ? handlePointerDown : null}
        onpointermove={isTop ? handlePointerMove : null}
        onpointerup={isTop ? handlePointerUp : null}
        onpointercancel={isTop ? handlePointerUp : null}
      >
        <div class="relative w-full h-full bg-[#1A1A24]">
          <div class="absolute inset-0 bg-gradient-to-t from-[#0D0D12] via-[#0D0D12]/40 to-transparent z-10 pointer-events-none"></div>
          <img src={profile.image} alt={profile.name} class="w-full h-full object-cover pointer-events-none" draggable="false" />
          
          <div class="absolute bottom-0 left-0 w-full p-8 z-20 pointer-events-none">
            <h3 class="text-3xl font-semibold text-[#FAF8F5] leading-tight">{profile.name}</h3>
            <p class="text-[#C9A84C] font-mono mt-1 text-sm">{profile.role}</p>
            <p class="text-[#FAF8F5]/80 mt-4 text-sm leading-relaxed">{profile.bio}</p>
            
            <div class="flex flex-wrap gap-2 mt-6">
              {#each profile.expertise as skill}
                <span class="px-3 py-1 rounded-full border border-[#FAF8F5]/20 text-[#FAF8F5]/90 text-xs backdrop-blur-md">
                  {skill}
                </span>
              {/each}
            </div>
          </div>

          <!-- Swipe Indicators -->
          {#if isTop}
            <div class="absolute top-8 left-8 z-20 border-2 border-red-500 text-red-500 rounded-lg px-4 py-1 font-bold text-xl uppercase tracking-widest pointer-events-none" style="opacity: {Math.max(0, -$x / 100)}; transform: rotate(-15deg);">Pass</div>
            <div class="absolute top-8 right-8 z-20 border-2 border-green-500 text-green-500 rounded-lg px-4 py-1 font-bold text-xl uppercase tracking-widest pointer-events-none" style="opacity: {Math.max(0, $x / 100)}; transform: rotate(15deg);">Match</div>
          {/if}
        </div>
      </div>
    {/each}
  </div>

  <div class="flex items-center gap-8 mt-12 z-10 relative">
    <button onclick={() => swipeButton(-1)} class="w-16 h-16 rounded-full bg-[#2A2A35] flex items-center justify-center text-[#FAF8F5] hover:bg-[#FAF8F5] hover:text-[#0D0D12] transition-colors shadow-lg">
      <X size={28} strokeWidth={2.5} />
    </button>
    <button onclick={() => swipeButton(1)} class="w-16 h-16 rounded-full bg-[#C9A84C] flex items-center justify-center text-[#0D0D12] hover:bg-[#FAF8F5] transition-colors shadow-lg shadow-[#C9A84C]/20">
      <Check size={28} strokeWidth={2.5} />
    </button>
  </div>
</section>
