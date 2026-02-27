
(function(){
  const explicit = ['https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/pop2.mp3', 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/grow.mp3', 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/bubblefill2.mp3', 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/win2.mp3', 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/lose2.mp3', 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/Voltaic.mp3', 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/Robobozo.mp3', 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/AI1.mp3', 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/AI2.mp3', 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/AI3.mp3', 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/AI4.mp3', 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/AI5.mp3', 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/AI6.mp3', 'https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/AI7.mp3'];
  function resolve(u){
    if(typeof u !== 'string') return null;
    if(u.startsWith('locate:')) return window.location.origin + '/' + u.slice(7);
    return u;
  }
  function tryNow(){
    if(window.SfxManager && typeof window.SfxManager.preload === 'function'){
      const resolved = explicit.map(resolve).filter(Boolean);
      if(resolved.length){
        try{ window.SfxManager.preload(resolved); }catch(e){console.warn(e);} 
      }
      return true;
    }
    return false;
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tryNow); else tryNow();
})();

