<template>
    <div id="MusicHistory">
        <div ref="scrollBox">
            <el-scrollbar max-height="100%" ref="scrollbar">
                <ul>
                    <li v-for="item in musicStore.musicList" :class="{ select: item.id === musicStore.nowMusic?.id }"
                        @click="playMusic(item)" ref="li">
                        <div>
                            <div class="nameBox">{{ item.name }}</div>
                            <div class="arBox">{{ item.ar.map(i => i.name).join("/") }}</div>
                        </div>
                        <div class="dtBox">{{ dayjs(item.dt).format("mm:ss") }}</div>
                    </li>
                </ul>
            </el-scrollbar>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import dayjs from 'dayjs';
import { useMusicStore } from '../store/music';
import anime from 'animejs/lib/anime.es.js';

const musicStore = useMusicStore();

const scrollBox = ref();
const scrollbar = ref();
const li = ref();

const playMusic = (item: object) => {
    musicStore.nowMusic = item;
}

onMounted(async () => {
    anime({
        targets: scrollBox.value,
        translateX: "-10%",
        skewX: "-15deg",
        translateY: [{
            value: "-100%",
            duration: 0
        }, {
            value: "0",
            duration: 400,
        }],
        duration: 0,
        easing: 'easeInOutSine',
        begin: () => {
            const index = musicStore.musicList.findIndex(i => i.id == musicStore.nowMusic.id);
            scrollbar.value.setScrollTop(li.value[index].offsetTop)
        }

    });
})

onBeforeUnmount(() => {
    anime({
        targets: scrollBox.value,
        translateX: "-10%",
        skewX: "-15deg",
        translateY: [{
            value: "0",
            duration: 0
        }, {
            value: "100%",
            duration: 400,
        }],
        duration: 0,
        easing: 'easeInOutSine',
    });
})
</script>
<style scoped lang="less">
.select {
    background-color: @whiteGreyColor !important;

    * {
        color: @maxColor;
        font-family: 'Harmony_Bold', sans-serif;
    }
}

#MusicHistory {
    .absolutely();
    position: absolute;
    z-index: 9999;
    background-color: rgba(0, 0, 0, 0.75);

    >div {
        .absolutely();
    }

    .el-scrollbar {
        width: 25%;
        height: 100%;
        background-image: linear-gradient(@hslColor, @maxColor);
        position: absolute;
        right: 0;

        ul {
            padding: 2vw 0;

            li:hover {
                background-color: @maxColor;
            }

            li {
                list-style: none;
                padding: 1vw 2vw;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: space-between;
                transition: all .25s ease-in-out;

                * {
                    transition: all .25s ease-in-out;
                }

                >div:first-child {
                    margin-right: 1vw
                }

                .nameBox {
                    font-size: 1vw;
                }

                .arBox {
                    font-family: 'Harmony_Light', sans-serif;
                }
            }
        }
    }


}
</style>