// Use this URL to fetch NASA APOD JSON data.
const apodData = 'https://cdn.jsdelivr.net/gh/GCA-Classroom/apod/data.json';

// Elements
const gallery = document.getElementById('gallery');
const fetchBtn = document.getElementById('getImageBtn');
const modal = document.getElementById('modal');
const modalMedia = document.getElementById('modal-media');
const modalTitle = document.getElementById('modal-title');
const modalDate = document.getElementById('modal-date');
const modalExplanation = document.getElementById('modal-explanation');
const modalCredit = document.getElementById('modal-credit');

// Loading message element (inserted before the gallery)
const loading = document.createElement('div');
loading.id = 'loading';
loading.className = 'loading';
loading.innerHTML = '<div class="loading-inner"><div class="spinner" aria-hidden="true"></div><span class="loading-text">Loading data…</span></div>';
loading.style.display = 'none';
gallery.parentNode.insertBefore(loading, gallery);

function showLoading(msg){
	const text = loading.querySelector('.loading-text');
	if(text) text.textContent = msg || 'Loading data…';
	loading.style.display = 'flex';
	loading.setAttribute('aria-hidden','false');
}
function hideLoading(){
	loading.style.display = 'none';
	loading.setAttribute('aria-hidden','true');
}

// Helper: format a date string (YYYY-MM-DD) to a nicer label
function formatDate(d){
	try{ return new Date(d).toLocaleDateString(); }catch(e){ return d; }
}

// Open / close modal
function openModal(){
	modal.setAttribute('aria-hidden','false');
	modal.classList.add('open');
	document.body.style.overflow = 'hidden';
}
function closeModal(){
	modal.setAttribute('aria-hidden','true');
	modal.classList.remove('open');
	document.body.style.overflow = '';
	modalMedia.innerHTML = '';
}

// Close when click on backdrop or on elements with data-close
modal.addEventListener('click',(e)=>{
	if(e.target.dataset && e.target.dataset.close === 'true') closeModal();
});
document.addEventListener('keydown',(e)=>{ if(e.key === 'Escape') closeModal(); });

// Render gallery items
function renderGallery(items){
	gallery.innerHTML = '';
	if(!items || items.length === 0){
		gallery.innerHTML = '<div class="placeholder"><div class="placeholder-icon">🛰️</div><p>No items found.</p></div>';
		return;
	}

	items.forEach((item, idx) => {
		const card = document.createElement('article');
		card.className = 'gallery-item';
		card.tabIndex = 0;

		// media element (image or video thumbnail)
		const mediaWrap = document.createElement('div');
		mediaWrap.className = 'media-wrap';

		const thumb = document.createElement('img');
		thumb.alt = item.title || 'APOD image';
		if(item.media_type === 'image'){
			thumb.src = item.url;
			thumb.loading = 'lazy';
		} else if(item.media_type === 'video'){
			// prefer thumbnail if available
			thumb.src = item.thumbnail_url || item.url || '';
			thumb.loading = 'lazy';
			thumb.classList.add('video-thumb');
			const play = document.createElement('div');
			play.className = 'play-overlay';
			play.innerText = '►';
			mediaWrap.appendChild(play);
		} else {
			thumb.src = item.url || '';
		}

		mediaWrap.appendChild(thumb);
		card.appendChild(mediaWrap);

		const title = document.createElement('h1');
		title.className = 'item-title';
		title.textContent = item.title || 'Untitled';
		card.appendChild(title);

		const date = document.createElement('p');
		date.className = 'item-date';
		date.textContent = formatDate(item.date || '');
		card.appendChild(date);

		// click / keyboard open modal
		function showDetails(){
			modalTitle.textContent = item.title || '';
			modalDate.textContent = formatDate(item.date || '');
			modalExplanation.textContent = item.explanation || '';
			modalCredit.textContent = item.copyright ? ('Credit: ' + item.copyright) : '';

			// media: use hdurl for larger image when available
			modalMedia.innerHTML = '';
			if(item.media_type === 'image'){
				const img = document.createElement('img');
				img.src = item.hdurl || item.url;
				img.alt = item.title || 'APOD image';
				img.className = 'modal-image';
				modalMedia.appendChild(img);
			} else if(item.media_type === 'video'){
				// embed if it's an embeddable url, else provide a link
				if(item.url && item.url.includes('youtube')){
					const iframe = document.createElement('iframe');
					iframe.src = item.url;
					iframe.width = '100%';
					iframe.height = '480';
					iframe.frameBorder = '0';
					iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
					iframe.allowFullscreen = true;
					modalMedia.appendChild(iframe);
				} else {
					const link = document.createElement('a');
					link.href = item.url;
					link.target = '_blank';
					link.rel = 'noopener noreferrer';
					link.textContent = 'Open video';
					modalMedia.appendChild(link);
				}
			}

			openModal();
		}

		card.addEventListener('click', showDetails);
		card.addEventListener('keydown', (e)=>{ if(e.key === 'Enter' || e.key === ' ') showDetails(); });

		gallery.appendChild(card);
	});
}

// Fetch handler
async function fetchAndRender(){
	fetchBtn.disabled = true;
	fetchBtn.textContent = 'Loading...';
	showLoading('Loading data...');
	try{
		const res = await fetch(apodData);
		if(!res.ok) throw new Error('Network response was not ok');
		const data = await res.json();

		// Sort newest first if date present
		data.sort((a,b)=> (b.date || '').localeCompare(a.date || ''));
		renderGallery(data);
	}catch(err){
		console.error(err);
		gallery.innerHTML = '<div class="placeholder"><p>Error loading data. Try again later.</p></div>';
	}finally{
		fetchBtn.disabled = false;
		fetchBtn.textContent = 'Fetch Space Images';
		hideLoading();
    runRandomFactGenerator();
	}
}

fetchBtn.addEventListener('click', fetchAndRender);

function runRandomFactGenerator() {
  const facts = [
    "The Milky Way galaxy is estimated to contain 100-400 billion stars.",
    "A day on Venus is longer than its year.",
    "Neutron stars are so dense that a sugar-cube-sized amount of neutron star material would weigh about a billion tons on Earth.",
    "The largest volcano in the solar system is Olympus Mons on Mars, which is about 13.6 miles (22 kilometers) high.",
    "Saturn's rings are made primarily of ice particles, with a smaller amount of rocky debris and dust.",
    "The Hubble Space Telescope has helped determine the age of the universe to be approximately 13.8 billion years.",
    "Jupiter's Great Red Spot is a giant storm that has been raging for at least 400 years.",
    "The footprints left by astronauts on the Moon will remain there for millions of years due to the lack of atmosphere and weather."
  ];

  function displayRandomFact() {
    const factText = document.getElementById('fact-text');
    const randomIndex = Math.floor(Math.random() * facts.length);
    factText.textContent = facts[randomIndex];
  }

  // Display a random fact every 10 seconds
  setInterval(displayRandomFact, 10000);
  // Display an initial fact
  displayRandomFact();
}