function toggleMenu(){
  const nav = document.querySelector('.nav');
  nav.classList.toggle('open');
}
document.getElementById('y').textContent = new Date().getFullYear();

// Smooth scroll for in-page links
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const id = a.getAttribute('href');
    if(id.length > 1){
      e.preventDefault();
      document.querySelector(id).scrollIntoView({behavior:'smooth', block:'start'});
      document.querySelector('.nav').classList.remove('open');
    }
  });
});
