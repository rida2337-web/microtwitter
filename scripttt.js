// Utilisateurs fictifs pour l'exemple
const users = [
    {
        username: "rida2337-web",
        name: "Rida",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        bio: "Développeur passionné & créateur de MicroTwitter.",
    },
    {
        username: "sami-tech",
        name: "Sami",
        avatar: "https://randomuser.me/api/portraits/men/67.jpg",
        bio: "Adepte des réseaux sociaux et nouvelles tech.",
    },
    {
        username: "lina-design",
        name: "Lina",
        avatar: "https://randomuser.me/api/portraits/women/58.jpg",
        bio: "Designer UI/UX, amoureuse du minimalisme.",
    }
];

// Posts (tweets) fictifs
let posts = [
    {
        id: 1,
        user: users[0],
        date: "10 sept. 2025, 10:45",
        msg: "Bienvenue sur MicroTwitter, le réseau social ultra moderne ! 🚀",
    },
    {
        id: 2,
        user: users[2],
        date: "10 sept. 2025, 09:30",
        msg: "Le design minimaliste, c’est la clé de l’expérience utilisateur. #UIUX",
    },
    {
        id: 3,
        user: users[1],
        date: "9 sept. 2025, 18:12",
        msg: "Un bon réseau social, c’est avant tout une bonne communauté 💙",
    }
];

// Utilisateur connecté (dans un vrai projet, ce serait dynamique)
const currentUser = users[0];

// Gestion des likes en localStorage
function getLikes() {
    let likes = localStorage.getItem('microtwitter_likes');
    return likes ? JSON.parse(likes) : {};
}
function setLikes(likes) {
    localStorage.setItem('microtwitter_likes', JSON.stringify(likes));
}
function getLikeCount(postId) {
    let likeData = getLikes();
    return likeData[postId]?.count || 0;
}
function isLikedByUser(postId) {
    let likeData = getLikes();
    return likeData[postId]?.users?.includes(currentUser.username) || false;
}
function toggleLike(postId) {
    let likeData = getLikes();
    if (!likeData[postId]) {
        likeData[postId] = { count: 0, users: [] };
    }
    if (likeData[postId].users.includes(currentUser.username)) {
        // Unlike
        likeData[postId].count = Math.max(0, likeData[postId].count - 1);
        likeData[postId].users = likeData[postId].users.filter(u => u !== currentUser.username);
    } else {
        // Like
        likeData[postId].count += 1;
        likeData[postId].users.push(currentUser.username);
    }
    setLikes(likeData);
    renderPosts();
    function readImageAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
}
// Gestion des commentaires en localStorage
function getComments() {
    let comments = localStorage.getItem('microtwitter_comments');
    return comments ? JSON.parse(comments) : {};
}
function setComments(comments) {
    localStorage.setItem('microtwitter_comments', JSON.stringify(comments));
}
function addComment(postId, user, text) {
    let comments = getComments();
    if (!comments[postId]) comments[postId] = [];
    comments[postId].push({
        user: user,
        text: text,
        date: formatDate(new Date())
    });
    setComments(comments);
    renderPosts();
}
function getPostComments(postId) {
    let comments = getComments();
    return comments[postId] || [];
}
function showFeed() {
    document.getElementById('show-feed').classList.add('active');
    document.getElementById('show-profile').classList.remove('active');
    const main = document.getElementById('main-content');
    main.innerHTML = '';

    // Formulaire de création de post
    const form = document.createElement('form');
    form.className = 'feed-form';
    form.innerHTML = `
    <img src="${currentUser.avatar}" alt="${currentUser.name}">
    <textarea id="feed-msg" rows="3" maxlength="280" placeholder="Quoi de neuf, ${currentUser.name} ?" required></textarea>
    <input type="file" id="feed-image" accept="image/*,.gif" style="margin:0.5rem 0;">
    <button type="submit">Tweeter</button>
`;
    form.onsubmit = async e => {
    e.preventDefault();
    const textarea = document.getElementById('feed-msg');
    const text = textarea.value.trim();
    const fileInput = document.getElementById('feed-image');
    const file = fileInput.files[0];

    if (text.length === 0 && !file) return;

    let imageSrc = null;
    if (file) {
        imageSrc = await readImageAsDataURL(file);
    }

    // Ajout du post
    posts.unshift({
        id: Date.now(),
        user: currentUser,
        date: formatDate(new Date()),
        msg: text,
        image: imageSrc
    });
    textarea.value = '';
    fileInput.value = '';
    renderPosts();
};

    main.appendChild(form);

    // Liste des posts
    const feedList = document.createElement('div');
    feedList.className = 'feed-list';
    feedList.id = 'feed-list';
    main.appendChild(feedList);

    renderPosts();
}

function renderPosts() {
    const feedList = document.getElementById('feed-list');
    feedList.innerHTML = '';
    posts.forEach(post => {
        const card = document.createElement('div');
        card.className = 'feed-card';

        // Likes
        const likeCount = getLikeCount(post.id);
        const liked = isLikedByUser(post.id);
        const postComments = getPostComments(post.id);

        card.innerHTML = `
            <img src="${post.user.avatar}" alt="${post.user.name}" class="feed-avatar">
            <div class="feed-content">
                <span class="feed-user">@${post.user.username}</span>
                <span class="feed-date">${post.date}</span>
                <div class="feed-msg">${escapeHTML(post.msg)}</div>
                ${post.image ? `<img src="${post.image}" class="feed-image" style="max-width:220px;max-height:220px;border-radius:7px;margin:0.5rem 0;">` : ""}
    
                <div class="feed-actions">
                    <button class="action-btn ${liked ? 'liked' : ''}" title="Like" onclick="toggleLike(${post.id})">
                        ❤️ <span class="like-count">${likeCount}</span>
                    </button>
                    <button class="action-btn" title="Commentaire" onclick="focusCommentInput(${post.id})">
                        💬
                   </button>
                   <button class="action-btn" title="Partager" onclick="sharePost(${post.id})">
                        🔗
                 </button>
             </div>
                <div class="comment-section" style="margin-top:1.1rem;">
            <form onsubmit="event.preventDefault(); submitComment(${post.id});" class="comment-form" style="display:flex;gap:0.5rem;align-items:center;">
                <input type="text" id="comment-input-${post.id}" placeholder="Commenter..." maxlength="140" style="flex:1;padding:0.4rem 0.7rem;border-radius:7px;border:1px solid #eee;">
                <button type="submit" style="border:none;padding:0.4rem 1rem;background:var(--accent);color:#fff;border-radius:7px;cursor:pointer;">Envoyer</button>
            </form>
            <div class="comments-list" style="margin-top:0.5rem;">
                ${postComments.map(c => `
                    <div class="comment-item" style="background:var(--card-bg);padding:0.4rem 0.7rem;border-radius:7px;margin-bottom:0.4rem;">
                       <span class="comment-user">@${c.user.username}</span>
                       <span class="menu-logo"></span>
                        <span style="color:#888;font-size:0.92rem;margin-left:0.5rem;">${c.date}</span><br>
                        <span>${escapeHTML(c.text)}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>
    `;

        feedList.appendChild(card);
    });
}
function readImageAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
// Profil utilisateur connecté
function showProfile() {
    document.getElementById('show-feed').classList.remove('active');
    document.getElementById('show-profile').classList.add('active');
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div class="profile-card">
            <img src="${currentUser.avatar}" alt="${currentUser.name}" class="profile-avatar">
            <div class="profile-name">${currentUser.name}</div>
            <div class="profile-username">@${currentUser.username}</div>
            <div class="profile-bio">${currentUser.bio}</div>
            <div class="profile-counts">
                <div><span class="pcount">${posts.filter(p => p.user.username === currentUser.username).length}</span><br>Posts</div>
                <div><span class="pcount">3</span><br>Abonnés</div>
                <div><span class="pcount">2</span><br>Abonnements</div>
            </div>
        </div>
    `;
}

// Formatage date
function formatDate(date) {
    const d = date;
    return `${d.getDate()} ${["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."][d.getMonth()]} ${d.getFullYear()}, ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

// Sécurité : échappe le HTML des messages
function escapeHTML(str) {
    return str.replace(/[&<>"']/g, function(m) {
        return ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[m];
    });
}
function toggleDarkMode() {
    document.body.classList.toggle("dark");
    localStorage.setItem("microtwitter_dark", document.body.classList.contains("dark") ? "1" : "");
    updateDarkBtn();
}

function updateDarkBtn() {
    document.getElementById("toggle-dark").textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
}

// Appliquer la préférence au chargement
window.onload = function() {
    if (localStorage.getItem("microtwitter_dark") === "1") {
        document.body.classList.add("dark");
    }
    showFeed();
    updateDarkBtn();
}

// Permet d'utiliser toggleLike depuis le HTML
window.toggleLike = toggleLike;

window.onload = showFeed;

function submitComment(postId) {
    const input = document.getElementById('comment-input-' + postId);
    const text = input.value.trim();
    if (text.length === 0 || text.length > 140) return;
    addComment(postId, currentUser, text);
    input.value = '';
}
window.submitComment = submitComment;

function showVideos() {
    document.getElementById('main-content').innerHTML = `
        <section style="padding:2.5rem 1.5rem;">
            <h2 style="font-size:2rem;color:var(--primary);font-family:Montserrat,sans-serif;">Vidéo</h2>
            <p>Fonctionnalité vidéo à venir…</p>
        </section>
    `;
}
function showChat() {
    document.getElementById('main-content').innerHTML = `
        <section style="padding:2.5rem 1.5rem;">
            <h2 style="font-size:2rem;color:var(--primary);font-family:Montserrat,sans-serif;">Chat</h2>
            <p>Fonctionnalité chat à venir…</p>
        </section>
    `;
}
function showCommunities() {
    document.getElementById('main-content').innerHTML = `
        <section style="padding:2.5rem 1.5rem;">
            <h2 style="font-size:2rem;color:var(--primary);font-family:Montserrat,sans-serif;">Communautés</h2>
            <p>Fonctionnalité communautés à venir…</p>
        </section>
    `;
}
function showBookmarks() {
    document.getElementById('main-content').innerHTML = `
        <section style="padding:2.5rem 1.5rem;">
            <h2 style="font-size:2rem;color:var(--primary);font-family:Montserrat,sans-serif;">Signets</h2>
            <p>Fonctionnalité signets à venir…</p>
        </section>
    `;
}
function showLists() {
    document.getElementById('main-content').innerHTML = `
        <section style="padding:2.5rem 1.5rem;">
            <h2 style="font-size:2rem;color:var(--primary);font-family:Montserrat,sans-serif;">Listes</h2>
            <p>Fonctionnalité listes à venir…</p>
        </section>
    `;
}
function showSpaces() {
    document.getElementById('main-content').innerHTML = `
        <section style="padding:2.5rem 1.5rem;">
            <h2 style="font-size:2rem;color:var(--primary);font-family:Montserrat,sans-serif;">Spaces</h2>
            <p>Fonctionnalité Spaces à venir…</p>
        </section>
    `;
}
function showMonetization() {
    document.getElementById('main-content').innerHTML = `
        <section style="padding:2.5rem 1.5rem;">
            <h2 style="font-size:2rem;color:var(--primary);font-family:Montserrat,sans-serif;">Monétisation</h2>
            <p>Fonctionnalité monétisation à venir…</p>
        </section>
    `;
}// Ouvre/Ferme le menu latéral drawer
function openDrawerMenu() {
    document.getElementById('drawer-menu').classList.add('drawer-open');
    document.getElementById('drawer-menu').classList.remove('hidden-menu');
    showOverlayMenu();
}
function closeDrawerMenu() {
    document.getElementById('drawer-menu').classList.remove('drawer-open');
    document.getElementById('drawer-menu').classList.add('hidden-menu');
    hideOverlayMenu();
}
function showOverlayMenu() {
    let overlay = document.createElement('div');
    overlay.className = 'overlay-menu';
    overlay.id = 'drawer-overlay';
    overlay.onclick = closeDrawerMenu;
    document.body.appendChild(overlay);
}
function hideOverlayMenu() {
    let overlay = document.getElementById('drawer-overlay');
    if (overlay) overlay.remove();
}

// Sur mobile, click sur bulle PP = ouvre drawer
document.getElementById('profile-bubble').onclick = function() {
    openDrawerMenu();
};

// Pour les liens du menu, ferme le drawer après click
document.querySelectorAll('.menu-item').forEach(btn => {
    btn.onclick = function() {
        closeDrawerMenu();
    };

    async function submitPost() {
    const text = document.getElementById('post-input').value;
    const fileInput = document.getElementById('image-input');
    const file = fileInput.files[0];

    if (!text.trim() && !file) return alert("Le post ne peut pas être vide !");

    let imageSrc = null;
    if (file) {
        // Lire le fichier en base64
        imageSrc = await readImageAsDataURL(file);
    }

    // Récupère les anciens posts
    let posts = JSON.parse(localStorage.getItem("posts")) || [];
    posts.push({
        id: Date.now(),
        text: text,
        image: imageSrc,
        likes: 0,
        comments: []
    });
    localStorage.setItem("posts", JSON.stringify(posts));
    document.getElementById('post-input').value = '';
    fileInput.value = '';
    renderPosts();
}

// Fonction utilitaire pour lire le fichier en base64
function readImageAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
    });
}
});



