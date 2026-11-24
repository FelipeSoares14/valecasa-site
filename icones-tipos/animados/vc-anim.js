// Ícones animados ValeCasa: toca a animação inteira (1,1 s) ao passar o mouse, focar ou tocar
// no ícone .vc-anim ou no elemento que o contém (link, botão ou [data-vc-anim]).
// Sem este script a animação também toca pelo CSS (:hover), mas para se o mouse sair antes do fim.
(() => {
  const play = (svg) => {
    svg.classList.remove('is-playing');
    svg.getBoundingClientRect(); // reinicia a animação
    svg.classList.add('is-playing');
    clearTimeout(svg._vcAnim);
    svg._vcAnim = setTimeout(() => svg.classList.remove('is-playing'), 1700);
  };
  const host = (el) => el && el.closest && el.closest('a,button,[data-vc-anim],.vc-anim');
  const run = (h) => (h.matches('.vc-anim') ? [h] : h.querySelectorAll('.vc-anim')).forEach(play);
  document.addEventListener('pointerover', (e) => {
    const h = host(e.target);
    if (h && !h.contains(e.relatedTarget)) run(h);
  });
  document.addEventListener('focusin', (e) => { const h = host(e.target); if (h) run(h); });
  document.addEventListener('click', (e) => { const h = host(e.target); if (h) run(h); });
})();
