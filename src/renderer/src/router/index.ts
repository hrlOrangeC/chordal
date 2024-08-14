import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/', name: 'home', redirect: "homepage", component: () => import('../pages/Home/index.vue'), children: [
                { path: 'homepage', name: 'homepage', meta: { latency: true }, component: () => import('../pages/HomePage/index.vue') },
                { path: 'search', name: 'search', component: () => import('../pages/Search/index.vue') },
                { path: 'playlistdetail', name: 'playlistdetail', component: () => import('../pages/PlayListDetail/index.vue') },
                { path: 'albumdetail', name: 'albumdetail', component: () => import('../pages/AlbumDetail/index.vue') },
                { path: 'singerdetail', name: 'singerdetail', component: () => import('../pages/SingerDetail/index.vue') },
                { path: 'mvdetail', name: 'mvdetail', component: () => import('../pages/MVDetail/index.vue') },
                { path: 'userdetail', name: 'userdetail', component: () => import('../pages/UserDetail/index.vue') },
                { path: 'comments', name: 'comments', component: () => import('../pages/Comments/index.vue') },
                { path: 'leaderboard', name: 'leaderboard', component: () => import('../pages/LeaderBoard/index.vue') },
                { path: 'classification', name: 'classification', component: () => import('../pages/Classification/index.vue') },
                { path: 'collection', name: 'collection', component: () => import('../pages/Collection/index.vue') },
                { path: 'setting', name: 'setting', component: () => import('../pages/Setting/index.vue') }
            ]
        },
        { path: '/login', name: 'login', component: () => import('../pages/Login/index.vue') },
        { path: '/lyricmodal', name: 'lyricmodal', component: () => import('../pages/LyricModal/index.vue') },
        { path: '/welcome', name: 'welcome', component: () => import('../pages/Welcome/index.vue') }
    ]
});

/*router.beforeEach(async (to, from) => {
    if (from.name == "home") {
        setTimeout(() => {
            return true;
        }, 1000)
    }
    return true
})*/

export default router;
