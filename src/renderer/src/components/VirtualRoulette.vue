<template>
    <div id="VirtualRoulette" ref="roulette">
        <div class="rouleBox" ref="rouleBox">
            <div class="btn-menu">
                <div class="btn-content">
                    <div class="imgBox">
                        <el-image :src="musicStore.nowMusic.al?.picUrl" />
                    </div>
                    <div class="nameBox">
                        <div class="musicName">{{ musicStore.nowMusic.name }}<span v-if="musicStore.nowMusic.tns"
                                class="tnsBox">（{{
                                    musicStore.nowMusic.tns?.join("/")
                                }}）</span></div>
                        <div class="arName">{{ musicStore.nowMusic.ar.map(i => i.name).join(",") }}</div>
                    </div>
                    <div class="occBox">
                        <acoustic theme="outline" />
                    </div>
                </div>
                <div class="btn-menu-item"
                    :style="{ transform: `translate(-100%, -100%) rotate(${(index + 1) * 60}deg) skew(15deg, 15deg)` }"
                    v-for="(item, index) in iconList">
                    <div class="btn-menu-item-text" @click="jumpPage(item.path, item.query)">
                        <div :style="{ transform: `rotate(-${(index + 1) * 60 - 15}deg)` }">
                            <div v-html="item.icon"></div>
                            <div>{{ item.name }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, } from 'vue';
import { Acoustic } from '@icon-park/vue-next';
import { useRouter } from 'vue-router';
import { useMusicStore } from '../store/music';
import { useUserStore } from '../store/user';
import anime from 'animejs/lib/anime.es.js';
import { userPlayListAPI } from '../api/index';

const emit = defineEmits(["changeRouleShow"]);

const router = useRouter();

const musicStore = useMusicStore();
const userStore = useUserStore();

const rouleBox = ref();
const roulette = ref();

const iconList = ref<{name: string, icon: string, path: string, query?: any}[]>([
    {
        name: "播放页",
        icon: '<?xml version="1.0" encoding="UTF-8"?><svg width="3.5vw" height="3.5vw" viewBox="0 0 47.5 47.5" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="8" width="38" height="32" rx="2" stroke="#ffffff" stroke-width="2"/><path d="M13 8V40" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="28" cy="24" r="9" fill="none" stroke="#ffffff" stroke-width="2"/><circle cx="28" cy="24" r="3" fill="#ffffff"/><path d="M5 16H13" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 24H13" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 32H13" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        path: "homepage"
    },
    {
        name: "搜索",
        icon: '<?xml version="1.0" encoding="UTF-8"?><svg width="3.5vw" height="3.5vw" viewBox="0 0 47.5 47.5" xmlns="http://www.w3.org/2000/svg"><path d="M21 38C30.3888 38 38 30.3888 38 21C38 11.6112 30.3888 4 21 4C11.6112 4 4 11.6112 4 21C4 30.3888 11.6112 38 21 38Z" fill="none" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/><path d="M26.657 14.3431C25.2093 12.8954 23.2093 12 21.0001 12C18.791 12 16.791 12.8954 15.3433 14.3431" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M33.2216 33.2217L41.7069 41.707" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        path: "search",
        query: musicStore.searchHistory
    },
    {
        name: "排行",
        icon: '<?xml version="1.0" encoding="UTF-8"?><svg width="3.5vw" height="3.5vw" viewBox="0 0 47.5 47.5" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 18H4V42H17V18Z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M30 6H17V42H30V6Z" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/><path d="M43 26H30V42H43V26Z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        path: "leaderboard"
    },
    {
        name: "分类",
        icon: '<?xml version="1.0" encoding="UTF-8"?><svg width="3.5vw" height="3.5vw" viewBox="0 0 47.5 47.5" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6H8C6.89543 6 6 6.89543 6 8V18C6 19.1046 6.89543 20 8 20H18C19.1046 20 20 19.1046 20 18V8C20 6.89543 19.1046 6 18 6Z" fill="none" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/><path d="M18 28H8C6.89543 28 6 28.8954 6 30V40C6 41.1046 6.89543 42 8 42H18C19.1046 42 20 41.1046 20 40V30C20 28.8954 19.1046 28 18 28Z" fill="none" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/><path d="M40 6H30C28.8954 6 28 6.89543 28 8V18C28 19.1046 28.8954 20 30 20H40C41.1046 20 42 19.1046 42 18V8C42 6.89543 41.1046 6 40 6Z" fill="none" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/><path d="M40 28H30C28.8954 28 28 28.8954 28 30V40C28 41.1046 28.8954 42 30 42H40C41.1046 42 42 41.1046 42 40V30C42 28.8954 41.1046 28 40 28Z" fill="none" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/></svg>',
        path: "classification"
    },
    {
        name: "收藏",
        icon: '<?xml version="1.0" encoding="UTF-8"?><svg width="3.5vw" height="3.5vw" viewBox="0 0 47.5 47.5" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M23.9986 5L17.8856 17.4776L4 19.4911L14.0589 29.3251L11.6544 43L23.9986 36.4192L36.3454 43L33.9586 29.3251L44 19.4911L30.1913 17.4776L23.9986 5Z" fill="none" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/></svg>',
        path: "collection"
    },
    {
        name: "我喜欢的音乐",
        icon: '<?xml version="1.0" encoding="UTF-8"?><svg width="3.5vw" height="3.5vw" viewBox="0 0 47.5 47.5" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 8C8.92487 8 4 12.9249 4 19C4 30 17 40 24 42.3262C31 40 44 30 44 19C44 12.9249 39.0751 8 33 8C29.2797 8 25.9907 9.8469 24 12.6738C22.0093 9.8469 18.7203 8 15 8Z" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        path: "playlistdetail",
        query: { id: null }
    }
])

const jumpPage = async (name: string, query: any = null) => {
    if (name == "playlistdetail" || name == "collection") if (!userStore.notLogin()) return;;
    if (name == "playlistdetail") iconList.value[iconList.value.findIndex(i => i.path == name)].query.id = { ...await userPlayListAPI({ uid: userStore.userDetail.userId }) }.data.playlist[0].id;
    router.push({
        name,
        query
    });
}

onMounted(async () => {
    window.onclick = () => {
        emit("changeRouleShow");
    }
    anime({
        targets: rouleBox.value,
        keyframes: [
            { scale: 1.1, duration: 200 },
            { scale: 1, duration: 400 }
        ],
        easing: 'easeInOutSine'
    });
})

onBeforeUnmount(() => {
    window.onclick = null;
    anime({
        targets: rouleBox.value,
        scale: 0,
        duration: 600,
        easing: 'easeInOutSine'
    });
})
</script>
<style scoped lang="less">
@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.spin-element {
    animation: spin 2s linear infinite;
    /* 其他样式，比如宽高、颜色等 */
}

#VirtualRoulette {
    position: absolute;
    z-index: 9999;
    -webkit-app-region: no-drag;
    left: 50%;
    top: 44%;
    transform: translateX(-50%) translateY(-50%);

    // background-color: rgba(0, 0, 0, 0.75);

    .rouleBox {
        width: 36vw;
        height: 36vw;
        border-radius: 50%;
        position: relative;
        top: -5%;
        transform: scale(0);
        box-shadow: 0 0 3vw .5vw rgba(127.5, 127.5, 127.5, .2);

        .btn-content {
            .flexCenter();
            flex-direction: column;
            width: 52.5%;
            height: 52.5%;
            border-radius: 50%;
            position: absolute;
            z-index: 1;
            left: 50%;
            top: 50%;
            transform: translateX(-50%) translateY(-50%) rotateZ(15deg);
            background-color: @bgiSColor;
            overflow: hidden;

            .imgBox {
                .flexCenter();
                flex: 1;
                overflow: hidden;
            }

            .nameBox {
                .flexCenter();
                width: 80%;
                flex: 1;
                flex-direction: column;

                .musicName {
                    margin: -5% 0 5% 0;
                    overflow: hidden;
                    display: -webkit-box;
                    -webkit-box-orient: vertical;
                    -webkit-line-clamp: 2;
                    text-align: center;
                    font-size: 1vw;

                    span {
                        color: @whiteGreyColor;
                        font-family: 'Harmony_Light', sans-serif;
                    }
                }

                .arName {
                    color: @whiteGreyColor;
                }
            }

            .occBox {
                width: 2.5vw;
                height: 2.5vw;
                background-color: @bgiSColor;
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translateX(-50%) translateY(-50%);
                border-radius: 50%;
                .flexCenter();

                span {
                    font-size: 1.5vw
                }
            }
        }

        .btn-menu {
            .absolutely();
            border-radius: 50%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotateZ(-15deg);
            overflow: hidden;

            .btn-menu-item:hover {
                background: @maxColor;
            }

            .btn-menu-item {
                .absolutely();
                display: flex;
                justify-content: flex-end;
                position: absolute;
                left: 50%;
                top: 50%;
                transform-origin: bottom right;
                overflow: hidden;
                cursor: pointer;
                transition: all .25s ease-in-out;

                // transform: translate(-100%, -100%) rotate(45deg) skew(15deg, 15deg);
                .btn-menu-item-text {
                    width: 50%;
                    height: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    transform-origin: bottom right;
                    transform: skew(-15deg, -15deg);
                    position: absolute;
                    bottom: 4%;
                    right: 4%;
                    // border-radius: 50%;
                    transition: all .25s ease-in-out;

                    >div {
                        .flexCenter();
                        flex-direction: column;

                        >div {
                            .flexCenter();
                            font-size: 1vw;
                        }
                    }

                    span {
                        font-size: 4vw;
                    }
                }
            }
        }

    }

    .rouleBox::before {
        .absolutely();
        content: "";
        border-radius: 50%;
        position: absolute;
        opacity: .6;
        background: -webkit-radial-gradient(circle closest-side, transparent 60%, @bgiSColor 40%);
    }
}
</style>