const products = [
  {id:1,title:'CURSO HTML',author:'Resti Team',price:10.00,category:'html',img:'https://picsum.photos/seed/html/400/300',desc:'Introducción a HTML: estructura, etiquetas y buenas prácticas.'},
  {id:2,title:'CURSO CSS',author:'Resti Team',price:10.00,category:'css',img:'https://picsum.photos/seed/css/400/300',desc:'Fundamentos de CSS: layouts, flexbox y responsive design.'},
  {id:3,title:'CURSO JS',author:'Resti Team',price:10.00,category:'js',img:'https://picsum.photos/seed/js2/400/300',desc:'JavaScript básico: DOM, eventos y lógica para la web.'}
];

const $courses = document.getElementById('courses');
const $cartButton = document.getElementById('cart-button');
const $cartModal = document.getElementById('cart-modal');
const $cartItems = document.getElementById('cart-items');
const $cartCount = document.getElementById('cart-count');
const $cartTotal = document.getElementById('cart-total');
const $closeCart = document.getElementById('close-cart');
const $search = document.getElementById('search');
const $category = document.getElementById('category-filter');

const $courseModal = document.getElementById('course-modal');
const $closeCourse = document.getElementById('close-course');
const $courseTitle = document.getElementById('course-title');
const $courseDesc = document.getElementById('course-desc');
const $courseRating = document.getElementById('course-rating');
const $reviewList = document.getElementById('review-list');
const $siteReviewList = document.getElementById('site-review-list');
const $reviewForm = document.getElementById('review-form');
const $reviewName = document.getElementById('review-name');
const $reviewRating = document.getElementById('review-rating');
const $reviewComment = document.getElementById('review-comment');
const $themeToggle = document.getElementById('theme-toggle');
const $goCourses = document.getElementById('go-courses');

let cart = JSON.parse(localStorage.getItem('cart')) || {};
let reviews = JSON.parse(localStorage.getItem('reviews')) || {};
let theme = localStorage.getItem('theme') || 'light';
// reseñas globales (carrusel) — 3 reseñas falsas iniciales
let siteReviews = JSON.parse(localStorage.getItem('siteReviews')) || [
  {name:'resti client', course:'CURSO HTML', rating:5, comment:'Excelente curso, ejercicios claros y prácticos.'},
  {name:'resti client', course:'CURSO CSS', rating:5, comment:'Muy buenas explicaciones sobre layouts y responsive.'},
  {name:'resti client', course:'CURSO JS', rating:5, comment:'Aprendí lo esencial del DOM y eventos.'}
];

const $carouselTrack = document.getElementById('carousel-track');
const $prevReview = document.getElementById('review-prev');
const $nextReview = document.getElementById('review-next');
const $carouselDots = document.getElementById('carousel-dots');
let currentSlide = 0;

// Aplicar tema guardado
if(theme === 'dark') document.body.classList.add('dark');
updateThemeButton();

function format(v){return '$'+v.toFixed(2)}

function renderCourses(list){
  $courses.innerHTML = '';
  list.forEach(p=>{
    const el = document.createElement('div'); el.className = 'card';
    el.innerHTML = `
      <div class="thumb" style="background-image:url('${p.img}')"></div>
      <div class="content">
        <h3 class="title">${p.title}</h3>
        <div class="meta">${p.author} · ${p.category}</div>
        <div class="price">${format(p.price)}</div>
        <div class="actions">
          <button class="add-btn">Añadir al carrito</button>
          <button class="details-btn">Ver detalles</button>
        </div>
      </div>
    `;
    el.querySelector('.add-btn').addEventListener('click',()=>addToCart(p.id));
    el.querySelector('.details-btn').addEventListener('click',()=>openCourse(p.id));
    $courses.appendChild(el);
  });
  observeCards();
}

function addToCart(id){
  cart[id] = (cart[id]||0)+1;
  saveCart();
  renderCart();
}

function saveCart(){
  localStorage.setItem('cart',JSON.stringify(cart));
}

function renderCart(){
  const items = Object.entries(cart);
  $cartItems.innerHTML = '';
  let total = 0, count = 0;
  if(items.length===0){ $cartItems.innerHTML = '<p>Carrito vacío</p>'; }
  items.forEach(([id,qty])=>{
    const p = products.find(x=>x.id==id);
    if(!p) return;
    count += qty; total += p.price*qty;
    const div = document.createElement('div'); div.className='cart-item';
    div.innerHTML = `<img src="${p.img}" alt=""><div><div>${p.title}</div><div class="meta">${format(p.price)} × ${qty}</div></div><div style="margin-left:auto"><button data-id="${id}" class="remove">−</button></div>`;
    div.querySelector('.remove').addEventListener('click',()=>{ removeItem(id); });
    $cartItems.appendChild(div);
  });
  $cartCount.textContent = count;
  $cartTotal.textContent = format(total);
}

function removeItem(id){
  if(!cart[id]) return;
  cart[id]--;
  if(cart[id]<=0) delete cart[id];
  saveCart(); renderCart();
}

function toggleCart(show){
  if(show) $cartModal.classList.remove('hidden'); else $cartModal.classList.add('hidden');
}

// Theme toggle
function updateThemeButton(){
  if(!$themeToggle) return;
  const isDark = document.body.classList.contains('dark');
  $themeToggle.textContent = isDark ? '☀️' : '🌙';
  $themeToggle.title = isDark ? 'Activar modo claro' : 'Activar modo noche';
  $themeToggle.setAttribute('aria-label', isDark ? 'Activar modo claro' : 'Activar modo noche');
}

if($themeToggle){
  $themeToggle.addEventListener('click', ()=>{
    document.body.classList.toggle('dark');
    theme = document.body.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    updateThemeButton();
  });
}

// Ir a cursos desde hero
if($goCourses){
  $goCourses.addEventListener('click', ()=>{
    document.getElementById('courses').scrollIntoView({behavior:'smooth'});
  });
}

function applyFilters(){
  const q = $search.value.trim().toLowerCase();
  const cat = $category.value;
  const list = products.filter(p=>{
    if(cat!=='all' && p.category!==cat) return false;
    if(q && !(p.title.toLowerCase().includes(q) || p.author.toLowerCase().includes(q))) return false;
    return true;
  });
  renderCourses(list);
}

function openCourse(id){
  const p = products.find(x=>x.id==id);
  if(!p) return;
  $courseTitle.textContent = p.title;
  $courseDesc.textContent = p.desc;
  renderReviews(id);
  $courseModal.dataset.courseId = id;
  $courseModal.classList.remove('hidden');
}

function closeCourse(){
  $courseModal.classList.add('hidden');
}

function renderReviews(courseId){
  const list = reviews[courseId] || [];
  if(list.length===0){ $reviewList.innerHTML = '<p>No hay reseñas aún.</p>'; $courseRating.textContent = 'Valoración: —'; return; }
  $reviewList.innerHTML = '';
  let sum = 0;
  list.forEach(r=>{
    sum += Number(r.rating);
    // force display name to 'resti client'
    const div = document.createElement('div'); div.className='review';
    div.innerHTML = `<div class="who">${escapeHtml('resti client')} · ${'★'.repeat(r.rating)}</div><div class="text">${escapeHtml(r.comment)}</div>`;
    $reviewList.appendChild(div);
  });
  const avg = (sum/list.length).toFixed(1);
  $courseRating.textContent = `Valoración: ${avg} / 5 (${list.length})`;
}

// Renderizar reseñas globales (debajo de los cursos)
function renderSiteReviews(){
  // ahora renderizamos el carrusel usando siteReviews y también incluimos reseñas por curso
  // combinar reseñas por curso (más recientes) con siteReviews existentes
  const all = siteReviews.slice();
  Object.keys(reviews).forEach(courseId=>{
    const course = products.find(p=>p.id==courseId);
    (reviews[courseId]||[]).forEach(r=> all.unshift({course: course?course.title:'Curso', name:r.name, rating:r.rating, comment:r.comment}));
  });
  // guardar siteReviews persistente (mantener iniciales si no hay otras)
  localStorage.setItem('siteReviews', JSON.stringify(siteReviews));
  renderCarousel(all);
}

function renderCarousel(list){
  if(!$carouselTrack) return;
  $carouselTrack.innerHTML = '';
  // render only the main slides; map each slide to the corresponding product title when possible
  list.forEach((item, idx)=>{
    // force display name to 'resti client' and prefer item's course value
    const displayName = 'resti client';
    const courseTitle = item.course || ((products[idx] && products[idx].title) ? products[idx].title : 'Curso');
    const slide = document.createElement('div'); slide.className = 'review-slide';
    slide.innerHTML = `<div class="review-card"><div class="who">${escapeHtml(displayName)} · <span style="font-weight:600;color:var(--accent)">${escapeHtml(courseTitle)}</span> · ${'★'.repeat(item.rating)}</div><div class="text">${escapeHtml(item.comment)}</div></div>`;
    $carouselTrack.appendChild(slide);
  });
  // clone first slide to create seamless loop illusion
  if(list.length>0){
    const firstClone = $carouselTrack.children[0].cloneNode(true);
    firstClone.classList.add('clone');
    $carouselTrack.appendChild(firstClone);
  }
  // crear dots
  renderDots(list.length);
  currentSlide = 0;
  updateCarousel();
}

function renderDots(n){
  if(!$carouselDots) return;
  $carouselDots.innerHTML = '';
  for(let i=0;i<n;i++){
    const d = document.createElement('div'); d.className='carousel-dot';
    if(i===0) d.classList.add('active');
    d.addEventListener('click',()=>{ currentSlide=i; updateCarousel(); });
    $carouselDots.appendChild(d);
  }
}

function updateCarousel(){
  if(!$carouselTrack) return;
  // move by pixels to avoid percentage-based sizing issues
  const slideEl = $carouselTrack.querySelector('.review-slide');
  const slideH = slideEl ? slideEl.offsetHeight : 120;
  $carouselTrack.style.transform = `translateY(-${currentSlide * slideH}px)`;
  // update dots
  const dots = $carouselDots ? Array.from($carouselDots.children) : [];
  dots.forEach((dot,idx)=>{ dot.classList.toggle('active', idx===currentSlide); });
}

// Only allow moving down (next). Prev arrow is hidden via CSS.
// Prev: permitir mover hacia arriba (retroceder)
if($prevReview) $prevReview.addEventListener('click', ()=>{
  const n = $carouselTrack ? ($carouselTrack.children.length - 1) : 0;
  currentSlide = Math.max(0, currentSlide - 1);
  if($carouselTrack) $carouselTrack.style.transition = $carouselTrack.style.transition || 'transform .45s cubic-bezier(.22,.9,.32,1)';
  updateCarousel();
});

// Next: avanzar hacia abajo
if($nextReview) $nextReview.addEventListener('click', ()=>{
  const n = $carouselTrack ? ($carouselTrack.children.length - 1) : 0; // number of real slides
  currentSlide = currentSlide + 1;
  // ensure transition is set (in case it was removed during reset)
  if($carouselTrack) $carouselTrack.style.transition = $carouselTrack.style.transition || 'transform .45s cubic-bezier(.22,.9,.32,1)';
  updateCarousel();
});

// handle transition end to loop seamlessly
if($carouselTrack){
  $carouselTrack.addEventListener('transitionend', ()=>{
    const n = $carouselTrack.children.length - 1; // last is clone
    if(currentSlide >= n){
      // jumped to clone, reset to first instantly using pixel translation
      $carouselTrack.style.transition = 'none';
      currentSlide = 0;
      const slideEl = $carouselTrack.querySelector('.review-slide');
      const slideH = slideEl ? slideEl.offsetHeight : 120;
      $carouselTrack.style.transform = `translateY(-${currentSlide * slideH}px)`;
      // force reflow then restore transition
      void $carouselTrack.offsetWidth;
      $carouselTrack.style.transition = 'transform .45s cubic-bezier(.22,.9,.32,1)';
      updateCarousel();
    }
  });
}

function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]); }

function saveReviews(){
  localStorage.setItem('reviews',JSON.stringify(reviews));
}

$reviewForm.addEventListener('submit', e=>{
  e.preventDefault();
  const id = $courseModal.dataset.courseId;
  if(!id) return;
  // force all submitted reviews to be from 'resti client'
  const r = { name: 'resti client', rating: $reviewRating.value, comment: $reviewComment.value || '' };
  reviews[id] = reviews[id] || [];
  reviews[id].unshift(r);
  saveReviews();
  renderReviews(id);
  // añadir también al carrusel global
  const course = products.find(p=>p.id==id);
  siteReviews.unshift({ name: 'resti client', course: course?course.title:'Curso', rating: r.rating, comment: r.comment });
  localStorage.setItem('siteReviews', JSON.stringify(siteReviews));
  renderSiteReviews();
  $reviewForm.reset();
});

// Intersección para animar cards al desplazarse
function observeCards(){
  const cards = document.querySelectorAll('.card');
  const obs = new IntersectionObserver((entries,observer)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){ entry.target.classList.add('in-view'); observer.unobserve(entry.target); }
    });
  },{threshold:0.12});
  cards.forEach(c=>obs.observe(c));
}

// Eventos
$cartButton.addEventListener('click',()=>toggleCart(true));
$closeCart.addEventListener('click',()=>toggleCart(false));
$search.addEventListener('input',applyFilters);
$category.addEventListener('change',applyFilters);
document.getElementById('checkout').addEventListener('click',()=>{
  alert('Pago simulado. Gracias por su compra.'); cart = {}; saveCart(); renderCart(); toggleCart(false);
});
$closeCourse.addEventListener('click',closeCourse);

// Asegurar que los modales estén ocultos al inicio
document.addEventListener('DOMContentLoaded', ()=>{
  // Forzar estado oculto con la clase que ahora tiene prioridad
  $cartModal.classList.add('hidden');
  $courseModal.classList.add('hidden');
});

// Inicio
renderCourses(products);
renderCart();
renderSiteReviews();

