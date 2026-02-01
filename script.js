         // CONFIGURATION: SANITY CMS SETTINGS
        // Fill these in with your project details from https://www.sanity.io/manage
        const SANITY_PROJECT_ID = "hdn2ismf"; // e.g., "zs92c92"
        const SANITY_DATASET = "production"; 

         // --- State Management ---
        let chapters = []; // Will be populated by Sanity
        let currentChapterIndex = 0;

        // --- Functions ---
        
        // 1. Fetch from Sanity CMS (Chapters)
        async function fetchChapters() {
            // Show loading indicators
            document.getElementById('loading-indicator').classList.remove('hidden');
            document.getElementById('mobile-loading-indicator').classList.remove('hidden');

            if (!SANITY_PROJECT_ID) {
                console.warn("No Sanity Project ID provided.");
                chapters = [];
                finalizeDataLoad();
                return;
            }

            try {
                // Query: Get chapters sorted by ID
                const query = `*[_type == "chapter"] | order(id asc) {
                    id,
                    title,
                    subtitle,
                    content
                }`;
                
                const encodedQuery = encodeURIComponent(query);
                const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${SANITY_DATASET}?query=${encodedQuery}`;

                const response = await fetch(url);
                const resultWrapper = await response.json();
                
                if (resultWrapper.result && Array.isArray(resultWrapper.result) && resultWrapper.result.length > 0) {
                    chapters = resultWrapper.result;
                    console.log("Loaded from Sanity!", chapters);
                } else {
                    console.warn("Sanity returned no chapters.");
                    chapters = [];
                }

            } catch (error) {
                console.error("Failed to fetch from Sanity:", error);
                chapters = [];
            } finally {
                finalizeDataLoad();
            }
        }
        
        // 2. Fetch from Sanity CMS (Gallery - ALBUM MODE)
        async function fetchGallery() {
            const grid = document.getElementById('gallery-grid');
            
            if (!SANITY_PROJECT_ID) {
                grid.innerHTML = '<div class="p-8 text-center text-gray-400">Please configure Sanity Project ID to load gallery.</div>';
                return;
            }

            try {
                // NEW Query: Get Albums, but extract the photo URLs inside them
                const query = `*[_type == "album"] | order(date desc) {
                    title,
                    date,
                    "photos": photos[].asset->url
                }`;
                
                const encodedQuery = encodeURIComponent(query);
                const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${SANITY_DATASET}?query=${encodedQuery}`;

                const response = await fetch(url);
                const resultWrapper = await response.json();

                if (resultWrapper.result && resultWrapper.result.length > 0) {
                    // FLATTEN THE ALBUMS:
                    // We get [ {title: "Trip", photos: [url1, url2]}, {title: "Date", photos: [url3]} ]
                    // We want [ {url: url1, title: "Trip"}, {url: url2, title: "Trip"}, ... ]
                    
                    let allPhotos = [];
                    
                    resultWrapper.result.forEach(album => {
                        if (album.photos && Array.isArray(album.photos)) {
                            album.photos.forEach(photoUrl => {
                                allPhotos.push({
                                    url: photoUrl,
                                    title: album.title, // Use album title as caption
                                    date: album.date
                                });
                            });
                        }
                    });

                    renderGallery(allPhotos);
                } else {
                    grid.innerHTML = '<div class="p-8 text-center text-gray-400">No albums found in archive.</div>';
                }

            } catch (error) {
                console.error("Failed to fetch gallery:", error);
                grid.innerHTML = '<div class="p-8 text-center text-gray-400">Failed to load archive.</div>';
            }
        }

        function renderGallery(images) {
            const grid = document.getElementById('gallery-grid');
            grid.innerHTML = ''; // Clear loading state

            if (images.length === 0) {
                grid.innerHTML = '<div class="p-8 text-center text-gray-400">No photos found inside albums.</div>';
                return;
            }

            images.forEach(img => {
                // Create Card HTML
                const card = document.createElement('div');
                card.className = 'break-inside-avoid bg-white p-3 shadow-sm border border-gray-100 rounded-lg transform active:scale-[0.98] transition-transform duration-200';
                
                card.innerHTML = `
                    <div class="bg-gray-200 w-full overflow-hidden mb-3 relative group rounded-md">
                        <img src="${img.url}" alt="${img.title || 'Memory'}" class="w-full h-auto object-cover transition-opacity duration-700 opacity-0" onload="this.classList.remove('opacity-0')">
                        <div class="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                    </div>
                    ${img.title ? `<p class="font-serif text-center text-sm italic text-gray-600">"${img.title}"</p>` : ''}
                    ${img.date ? `<p class="text-center text-xs text-gray-400 mt-1">${formatDate(img.date)}</p>` : ''}
                `;
                
                grid.appendChild(card);
            });
        }
        
        function formatDate(dateString) {
            if(!dateString) return '';
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            return new Date(dateString).toLocaleDateString('en-US', options);
        }

        function finalizeDataLoad() {
            // Hide loaders
            document.getElementById('loading-indicator').classList.add('hidden');
            document.getElementById('mobile-loading-indicator').classList.add('hidden');
            
            // Render UI
            renderChapterList();
            loadChapter(0);
        }

        // 3. Helper: Converts plain text to HTML with University Series styling
        function parseStoryContent(text) {
            if (!text) return '';
            if (text.trim().startsWith('<')) return text;
            const paragraphs = text.split(/\n\s*\n/);
            return paragraphs.map((para, index) => {
                let cleanPara = para.trim();
                if (!cleanPara) return '';
                cleanPara = cleanPara.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
                cleanPara = cleanPara.replace(/\*(.*?)\*/g, '<em class="text-varsity-orange font-medium">$1</em>');
                if (cleanPara === 'To Be Continued...') {
                    return `<p class="text-center font-serif text-xl font-bold text-varsity-orange mt-8">${cleanPara}</p>`;
                }
                if (cleanPara.startsWith('>')) {
                    const quoteContent = cleanPara.replace(/^>\s*/, '');
                    return `<div class="my-6 md:my-8 border-l-4 border-varsity-orange pl-4 italic text-gray-500 font-serif bg-orange-50/50 py-2 pr-2 rounded-r">
                        ${quoteContent}
                    </div>`;
                }
                if (index === 0) {
                    return `<p class="mb-4 text-lg first-letter:text-5xl first-letter:font-serif first-letter:text-varsity-orange first-letter:mr-2 first-letter:float-left text-gray-700 leading-relaxed">
                        ${cleanPara}
                    </p>`;
                }
                return `<p class="mb-4 text-gray-700 leading-relaxed">
                    ${cleanPara}
                </p>`;
            }).join('');
        }

        // 4. Router Logic
        function router(viewName) {
            document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
            const selectedView = document.getElementById(`${viewName}-view`);
            if (selectedView) {
                selectedView.classList.remove('hidden');
                window.scrollTo(0, 0);
            }
            document.querySelectorAll('.nav-item').forEach(btn => {
                if(btn.innerText.toLowerCase().includes(viewName === 'students' ? 'students' : viewName)) {
                    btn.classList.add('text-varsity-orange');
                    btn.classList.remove('text-gray-500');
                } else {
                    btn.classList.remove('text-varsity-orange');
                    btn.classList.add('text-gray-500');
                }
            });
        }

        // 5. Mobile Menu Toggle
        function toggleMobileMenu() {
            const menu = document.getElementById('mobile-menu');
            const icon = document.getElementById('menu-icon');
            if (menu.classList.contains('hidden')) {
                menu.classList.remove('hidden');
                icon.classList.remove('ph-list');
                icon.classList.add('ph-x');
            } else {
                menu.classList.add('hidden');
                icon.classList.remove('ph-x');
                icon.classList.add('ph-list');
            }
        }

        // 6. Mobile Chapter List Toggle
        function toggleChapterList() {
            const list = document.getElementById('chapter-list-container');
            const icon = document.getElementById('chapter-toggle-icon');
            if (list.classList.contains('hidden')) {
                list.classList.remove('hidden');
                icon.style.transform = 'rotate(180deg)';
            } else {
                list.classList.add('hidden');
                icon.style.transform = 'rotate(0deg)';
            }
        }

        // 7. Render Chapter List
        function renderChapterList() {
            const listContainer = document.getElementById('chapter-list-container');
            listContainer.innerHTML = '';
            if (!chapters || chapters.length === 0) {
                 listContainer.innerHTML = `<div class="p-4 text-sm text-gray-400 italic">No chapters loaded.</div>`;
                 return;
            }
            chapters.forEach((chap, index) => {
                const btn = document.createElement('button');
                const isActive = index === currentChapterIndex;
                btn.className = `w-full text-left px-4 py-3 rounded-md transition-all duration-200 flex flex-col group ${isActive 
                    ? 'bg-orange-50 border-varsity-orange text-varsity-orange lg:border-l-2 border-l-4' 
                    : 'bg-transparent lg:border-l-2 border-transparent text-gray-600 hover:bg-orange-50 hover:text-gray-900 border-l-0'}`;
                btn.onclick = () => {
                    loadChapter(index);
                    if (window.innerWidth < 1024) toggleChapterList();
                };
                btn.innerHTML = `
                    <span class="font-serif font-bold text-sm ${isActive ? 'text-varsity-orange' : 'text-gray-700 group-hover:text-gray-900'}">${chap.title}</span>
                    <span class="text-xs ${isActive ? 'text-orange-400' : 'text-gray-400'} mt-1 truncate">${chap.subtitle}</span>
                `;
                listContainer.appendChild(btn);
            });
        }

        // 8. Load Specific Chapter
        function loadChapter(index) {
            const display = document.getElementById('chapter-display');
            if (!chapters || chapters.length === 0) {
                 display.innerHTML = `
                    <div class="text-center py-10">
                        <i class="ph ph-warning-circle text-4xl text-gray-300 mb-2"></i>
                        <h3 class="text-xl font-serif text-gray-500">No chapters found</h3>
                        <p class="text-sm text-gray-400 mt-2 max-w-md mx-auto">
                            ${!SANITY_PROJECT_ID 
                                ? 'The Sanity Project ID is missing. Please add it to the code.' 
                                : 'There are no published chapters in your Sanity Content Studio yet, or CORS is blocking the request.'}
                        </p>
                    </div>`;
                 return;
            }
            if (index < 0 || index >= chapters.length) index = 0;
            currentChapterIndex = index;
            const chap = chapters[index];
            display.style.opacity = '0';
            const parsedContent = parseStoryContent(chap.content);
            setTimeout(() => {
                display.innerHTML = `
                    <div class="border-b border-orange-100 pb-4 mb-4 md:pb-6 md:mb-6">
                        <span class="text-[10px] md:text-xs font-bold tracking-widest text-gray-400 uppercase">Archive Entry #${chap.id}</span>
                        <h2 class="text-2xl md:text-4xl font-serif font-bold text-gray-900 mt-2">${chap.title}</h2>
                        <p class="text-base md:text-lg text-varsity-orange font-serif italic mt-1 md:mt-2">${chap.subtitle}</p>
                    </div>
                    <div class="prose prose-sm md:prose-lg text-gray-600 font-sans max-w-none">
                        ${parsedContent}
                    </div>
                `;
                display.style.opacity = '1';
                display.style.transition = 'opacity 0.3s ease-in-out';
                renderChapterList();
                updatePaginationButtons();
                const headerOffset = 80;
                const elementPosition = display.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                if (window.innerWidth < 1024) {
                     window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                }
            }, 200);
        }

        // 9. Pagination Logic
        function changeChapter(direction) {
            const newIndex = currentChapterIndex + direction;
            if (newIndex >= 0 && newIndex < chapters.length) loadChapter(newIndex);
        }

        function updatePaginationButtons() {
            const prevBtn = document.getElementById('prev-btn');
            const nextBtn = document.getElementById('next-btn');
            const pageInfo = document.getElementById('chapter-pagination');
            if (!chapters || chapters.length === 0) {
                prevBtn.disabled = true;
                nextBtn.disabled = true;
                pageInfo.innerText = "Page 0 of 0";
                return;
            }
            prevBtn.disabled = currentChapterIndex === 0;
            nextBtn.disabled = currentChapterIndex === chapters.length - 1;
            pageInfo.innerText = `Chapter ${currentChapterIndex + 1} of ${chapters.length}`;
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            fetchChapters();
            fetchGallery();
            router('home');
        });