<template>
    <div id="LyricModal" ref="lyricModal" @mouseenter="isEnter = true">
        <div class="lyricInnerBox">
            <div class="settingBox">
                <div ref="triggerBox" v-show="isEnter">
                    <lock theme="outline" @click="locked(true, 1)" v-if="isNore == 0" />
                    <unlock theme="outline" @click="locked(true, 0)" v-else />
                </div>
            </div>
            <div class="bottomBox">
                <div class="lyricBox">{{ lyric?.lrc }}</div>
                <div class="tLyricBox" v-if="lyric?.tLrc">{{ lyric.tLrc }}</div>
            </div>
        </div>
    </div>
    <div id="outerBox" @mouseenter="isEnter = false"></div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useIpcRenderer } from "@vueuse/electron";
import { Lock, Unlock } from '@icon-park/vue-next';
const ipcRenderer = useIpcRenderer();

const lyric = ref<{lrc: string, tLrc: string}>();
const isEnter = ref<boolean>(false);
const isNore = ref<number>(0);

const triggerBox = ref();

const locked = (type: boolean, flag: number) => {
    if (type) isNore.value = flag;
    ipcRenderer.send("lock-lyricModal", flag);
}

onMounted(() => {
    ipcRenderer.on('lyricModal-on', async (_, lyricItem) => {
        lyric.value = lyricItem;
    });

    triggerBox.value.onmouseenter = () => {
        locked(false, 0);
        isEnter.value = true;
    }
    triggerBox.value.onmouseleave = () => {
        locked(false, isNore.value)
    }
})
</script>
<style lang="less">
#outerBox {
    .absolutely();
    position: absolute;
    left: 0;
    top: 0;
    z-index: 0;
}

#LyricModal {
    .flexCenter();
    width: 95%;
    height: 85%;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
    padding: v-bind('isEnter ? 0 : "15px"');
    z-index: 1;

    .lyricInnerBox {
        .absolutely();
        -webkit-app-region: drag;
        padding: v-bind('isEnter ? "15px" : 0');

        .settingBox {
            .flexCenter();
            height: 20%;
            font-size: 4vw;

            >* {
                -webkit-app-region: no-drag;
                cursor: pointer;
            }
        }

        .bottomBox {
            display: flex;
            flex-direction: column;
            justify-content: center;
            font-size: 5vw;
            overflow: hidden;
            color: @maxColor;
            mix-blend-mode: difference;

            >div {
                .flexCenter()
            }

            .lyricBox {
                font-family: 'Harmony_Bold', sans-serif;

            }

            .tLyricBox {
                font-size: 4vw;
                color: rgba(127.5, 127.5, 127.5);
            }
        }
    }
}
</style>