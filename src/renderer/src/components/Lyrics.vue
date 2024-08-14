<template>
    <div id="ringMode" v-if="musicStore.lyricMode">
        <div :id="iItem.id" v-for="iItem in iconList">
            <div class="lyricList">
                <span v-for="(item, index) in ifLrc(iItem.type)"
                    :style="{ transform: `rotate(${computeDeg(ifLrc(iItem.type).slice(0, index + 1))}deg)` }">{{
                        item
                    }}</span>
            </div>
            <div class="tLyricList">
                <span v-for="(item, index) in ifTLrc(iItem.type)"
                    :style="{ transform: `rotate(${computeDeg(ifTLrc(iItem.type)!.slice(0, index + 1))}deg)` }">{{ item
                    }}</span>
            </div>
        </div>
        <div id="imgBox">
            <el-image :src="musicStore.nowMusic?.al?.picUrl" />
        </div>
    </div>
    <div id="lineMode" v-else>
        <div class="lineBox">
            <ul v-if="lyricMode">
                <li v-for="(item, index) in mergetLrc" :class="{ lineSelect: getIndex == index }">
                    <div>{{ item.text }}</div>
                    <div>{{ item.tText }}</div>
                </li>
            </ul>
            <ul v-else>
                <li :class="{ yrcLi: true, lineYrcSelect: getIndex == index, lineElapse: index < getIndex }"
                    v-for="(item, index) in mergetYrc">
                    <div class="lineYrcBox">
                        <div class="sliderBox">
                            <div class="moveBox">
                                <!--<span :class="{ opaC: sItem.time[0] + sItem.time[1] < props.playbackProgress * 1000 }"
                                    v-for="sItem in item.arr">{{ sItem.text }}</span>-->
                                {{ item.arr.map(i => i.text).join("").trim() }}
                            </div>
                        </div>
                        <div class="textBox">
                            <!--<span :class="{ whiteC: sItem.time[0] <= playbackProgress * 1000 }"
                                v-for="sItem in item.arr">{{ sItem.text
                                }}</span>-->
                            <span v-for="sItem in item.arr">{{ sItem.text
                                }}</span>
                        </div>
                    </div>
                    <div>{{ item.text }}</div>
                </li>
            </ul>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { newLyricAPI } from '../api/index';
import anime from 'animejs/lib/anime.es.js';
import { useMusicStore } from '../store/music';
import { useColorStore } from '../store/color';
import { useIpcRenderer } from "@vueuse/electron";
import { duration } from 'dayjs';
import { spaceItemProps, translate } from 'element-plus';


const ipcRenderer = useIpcRenderer();

const colorStore = useColorStore();
const musicStore = useMusicStore();

const props = defineProps(["recordDeg", "musicId", "playbackProgress"]);

const textYrc = ref<Array<{ time: number[], text: string }>[]>();
const yTextYrc = ref<{ text: string, time: number }[]>([])
const musicYrc = ref<{ text: string, time: number }[]>([]);
const musicTYrc = ref<{ text: string, time: number }[]>([]);
const animation = ref<{ completed: boolean, add: any, pause(): object, play(): object, restart(): object, seek(timeStamp: number): object }>();
const iconList = ref<{ id: string, type: number }[]>([{
    id: "outerRing",
    type: 0
},
{
    id: "innerRing",
    type: 1
}])
const lyricMode = ref<boolean>(true);

// const outerRing = ref();
// const tLyricList = ref();
// const lineMode = ref();

const getTime = (time: string) => {
    return Math.round((parseFloat(time.slice(0, 2)) * 60 + parseFloat(time.slice(3))) * 1000) / 1000
}

// 解析歌词
const changeYrc = (lyric: string) => {
    return lyric.split("\n")
        .filter(i => i != "" && i.slice(0, 1) != "{")
        .map(i => {
            return {
                time: getTime(i.match(/(.*)\]/)?.[1].slice(1) as string),
                text: i.match(/\](.*)/)?.[1].trim() as string
            }
        })
}

// 解析逐字歌词
const changeTextYrc = (lyric: string) => {
    return lyric
        .replace(/\)[\(\)]\(/g, ")(")
        .replace(/\)[\(\)]\n/g, ")\n")
        .replace(/\'/g, "’")
        .replace(/\(/g, "'}, {time:[")
        .replace(/\)/g, "], text:'")
        .split("\n")
        .filter(i => i != "" && i.substring(0, 1) != "{")
        .map(i => {
            return Function('"use strict";return (' + `[${i.match(/\}\,(.*)/)?.[1].trim()}'}]` + ")")()
        })
}

// 获取歌词
const getLyric = async (id: number | string) => {
    const { lrc, yrc, tlyric, ytlrc } = { ...await newLyricAPI({ id }) }.data;
    if (lrc?.lyric) musicYrc.value = changeYrc(lrc.lyric);
    if (tlyric?.lyric) {
        musicTYrc.value = changeYrc(tlyric.lyric);
        if (isNaN(musicTYrc.value[0].time)) musicTYrc.value.shift();
    }
    if (yrc?.lyric) {
        lyricMode.value = false;
        textYrc.value = changeTextYrc(yrc.lyric);
        console.log(textYrc.value);

        if (ytlrc?.lyric) yTextYrc.value = changeYrc(ytlrc.lyric);
        console.log(yTextYrc.value);

    } else {
        lyricMode.value = true;
    }
}


// 计算角度 
const computeDeg = (text: string) => {
    return text.split("").reduce((prev, cur) => prev + ifDeg(cur), 0)
}

const ifLrc = (type: number) => {
    return lyricMode.value ? mergetLrc.value[getIndex.value + type]?.text : mergetYrc.value![getIndex.value + type]?.arr.map(i => i.text).join('')
}

const ifTLrc = (type: number) => {
    return lyricMode.value ? mergetLrc.value[getIndex.value + type]?.tText : mergetYrc.value![getIndex.value + type]?.text
}

// 合并逐字歌词
const mergetYrc = computed(() => {
    return [{ time: 0, text: null, arr: [{ text: "......", time: [0, textYrc.value![0][0].time[0], 0] }] }, ...textYrc.value!.map(item => {
        return {
            time: item[0].time[0] / 1000,
            text: yTextYrc.value.find(i => i.time == item[0].time[0] / 1000)?.text || " ",
            arr: item
        }
    })]
})

// 合并歌词
const mergetLrc = computed(() => {
    return [{ time: 0, text: "......", tText: null }, ...musicYrc.value.map(item => {
        return {
            time: item.time,
            text: item.text || "......",
            tText: musicTYrc.value.find(i => i.time == item.time)?.text
        }
    })]
})

const getIndex = computed(() => {
    const index = (lyricMode.value ? mergetLrc : mergetYrc).value!.findIndex((item: { time: number }, index: number, arr: { time: number }[]) =>
        props.playbackProgress >= item.time && props.playbackProgress <= (arr[index + 1]?.time || props.playbackProgress));
    return index == -1 ? 0 : index
})

// 判断角度
const ifDeg = (text: string) => {
    if (!text.trim()) return 4;
    const dta = {
        "[A-Z]": 6,
        "[a-z0-9]": 4,
        //"[\u4E00-\u9FA5]+": 8,
    }
    for (let k in dta) {
        if (new RegExp(k).test(text))
            return dta[k];
    }
    return 8;
}

// ring歌词动画
const musicYrcAnime = (newVal: number) => {
    const deg = computeDeg(musicYrc.value[newVal].text) / 2;
    const time = musicYrc.value[newVal + 1].time - musicYrc.value[newVal].time;
    animation.value = anime({
        targets: document.querySelector("#outerRing")?.children,
        translateX: [{
            value: "-50%",
            duration: 0
        }],
        translateY: [{
            value: "-50%",
            duration: 0
        }],
        opacity: [{
            value: 0,
            duration: 0
        },
        {
            value: 1,
            duration: time * 100,

        }, {
            value: 0,
            duration: time * 100,
            delay: time * 800
        }],
        rotateZ: [{
            value: 10,
            duration: 0
        }, {
            value: 10 - deg,
            duration: time * 100
        }, {
            value: -deg,
            duration: time * 800
        }, {
            value: -180 - 10 - deg,
            duration: time * 100
        }],
        easing: "linear"
    });
}


// ring逐字歌词动画
const textYrcAnime = (newVal: number) => {
    const time = mergetYrc.value![newVal + 1].time - mergetYrc.value![newVal].time;
    const rotateArr = [
        { value: 10, duration: 0 },
        ...mergetYrc.value![newVal].arr.map(item => {
            return {
                value: `-=${computeDeg(item.text)}deg`,
                duration: item.time[1]
            }
        })
    ];
    animation.value = anime({
        targets: document.querySelector("#outerRing")?.children,
        translateX: [{
            value: "-50%",
            duration: 0
        }],
        translateY: [{
            value: "-50%",
            duration: 0
        }],
        opacity: [{
            value: 0,
            duration: 0
        },
        {
            value: 1,
            duration: time * 100,

        }, {
            value: 0,
            duration: time * 100,
            delay: time * 800
        }],
        rotateZ: rotateArr,
        easing: 'linear'
    });
}

const generateArr = (newVal: number, lis: HTMLElement[], sliderBox: HTMLElement, flag: boolean) => {
    const zeroObj = { value: 0, duration: 0 };
    return [zeroObj,
        ...mergetYrc.value![newVal].arr.map((item, index) => {
            const nextLi = lis![index + 1];
            const li = lis![index];
            // if (li.offsetTop != 0) li.style.color = 'white';
            const moveValue = nextLi ? nextLi.offsetLeft : li.offsetLeft + li.offsetWidth;
            return moveValue == 0 ? [{
                // value: `${flag ? "+" : "-"}=${li.offsetWidth / sliderBox!.offsetWidth * 100}%`,
                value: flag ? sliderBox.offsetWidth : -sliderBox.offsetWidth,
                duration: item.time[1]
            }, zeroObj] : {
                value: flag ? moveValue : -moveValue,
                duration: item.time[1]
            }
            /*return {
                value: `${flag ? "+" : "-"}=${li.offsetWidth / sliderBox!.offsetWidth * 100}%`,
                duration: item.time[1]
            }*/
        })].flat();
}

// line歌词动画
const lineYrcAnime = (newVal: number) => {
    // const time = newVal + 1 != mergetYrc.value.length ? mergetYrc.value![newVal + 1].time - mergetYrc.value![newVal].time : mergetYrc.value![newVal].time;
    const lineMode = document.querySelector("#lineMode");
    const nowLi = lineMode!.querySelectorAll("li")[newVal];
    const homeHeight = document.querySelector("#home")!.clientHeight * 0.05;
    const top = nowLi.offsetTop - lineMode!.clientHeight / 2 + nowLi.clientHeight / 2 + homeHeight;

    anime.remove(lineMode, lineMode!.querySelectorAll("li"));
    animation.value = anime.timeline({
        targets: lineMode,
        scrollTop: top,
        duration: 500,
        easing: "easeInOutSine"
    }).add({
        targets: lineMode!.querySelectorAll("li"),
        translateX: (_, index: number) => {
            const newIndex = newVal - index;
            return (newIndex > 0 ? -newIndex : newIndex) * -(newIndex > 0 ? -newIndex : newIndex) + "vw"
        }
    }, 0);

    if (lyricMode.value) return;
    const sliderBox = nowLi.querySelector(".sliderBox") as HTMLElement;
    const moveBox = sliderBox!.querySelector(".moveBox");
    const lis = nowLi.querySelector(".textBox")!.children as unknown as HTMLElement[];
    anime.remove(sliderBox, moveBox);
    animation.value?.add({
        targets: sliderBox,
        translateX: generateArr(newVal, lis, sliderBox, true),
        easing: "linear"
    }, 0).add({
        targets: moveBox,
        translateX: generateArr(newVal, lis, sliderBox, false),
        easing: "linear"
    }, 0)

}

const sendLyric = () => {
    ipcRenderer.send("mainWindow-send", { lrc: ifLrc(0), tLrc: ifTLrc(0) });
}

/*const computTrans = (index: number) => {
    const newIndex = getIndex.value - index;
    // const liHeight = document.querySelectorAll(".lineBox li")[index]?.clientHeight / 5;

    // return (newIndex > 0 ? -newIndex : newIndex) - (newIndex > 0 ? newIndex : -newIndex);
    // return (newIndex > 0 ? -newIndex : newIndex) - newIndex
    return (newIndex > 0 ? -newIndex : newIndex) * -(newIndex > 0 ? -newIndex : newIndex)
    // const newIndex = index - getIndex.value;
    // return (newIndex + 2) * (-newIndex + 2)
}*/

/*const computColor = (time: number[], flag: boolean) => {
    if (flag) {
        return time[0] > props.playbackProgress * 1000 ? 'white' : 'rgb(20,24,27)';
    } else {
        return time[0] + time[1] < props.playbackProgress * 1000 ? 'rgba(0,0,0,0)' : 'white';
    }

}*/

// 触发动画
watch(getIndex, async (newVal) => {
    musicStore.lyricShow && sendLyric();
    if (musicStore.lyricMode) {
        await anime.remove(document.querySelector("#outerRing")?.children);
        lyricMode.value ? musicYrcAnime(newVal) : textYrcAnime(newVal);
    } else {
        lineYrcAnime(newVal)
    }
})

// 切歌
watch(() => props.musicId, async (newVal) => {
    animation.value?.seek(0);
    animation.value?.pause();
    // document.querySelector("#lineMode")!.scrollTop = 0;
    // musicYrc.value = musicTYrc.value = textYrc.value = yTextYrc.value = [];
    await getLyric(newVal);
}, { immediate: true })

// 播放控制
watch(() => musicStore.played, (newVal) => {
    newVal ? animation.value?.play() : animation.value?.pause();;
})

</script>
<style scoped lang="less">
.opaC {
    color: rgba(0, 0, 0, 0)
}

.whiteC {
    color: @bgiColor !important;
}

.lineSelect {
    opacity: 1 !important;

    * {
        color: @bgiSColor !important;
        font-family: 'Harmony_Bold', sans-serif !important;
    }
}

.lineYrcSelect {
    // opacity: 1 !important;

    .sliderBox {
        * {
            font-family: 'Harmony_Bold', sans-serif !important;
        }
    }

    .textBox {
        * {
            color: @bgiColor;
            font-family: 'Harmony_Bold', sans-serif !important;
        }
    }
}

.lineElapse {
    .sliderBox {
        opacity: 0;

        * {
            color: @bgiColor;
        }
    }

    .textBox {
        * {
            color: @bgiColor;
        }
    }
}

#ringMode {
    #imgBox {
        width: 10vw;
        height: 10vw;
        position: absolute;
        z-index: 1000;
        left: 50%;
        top: 45%;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        overflow: hidden;
        box-shadow: 0 0 1vw 0.5vw rgba(127.5, 127.5, 127.5, 0.15);

        .el-image {
            .absolutely();
        }
    }

    .lyricList,
    .tLyricList {
        position: absolute;
        z-index: 1000;
        left: 50%;
        top: 45%;
        width: 35vw;
        height: 35vw;
        border-radius: 50%;
        transform: translate(-50%, -50%) rotateZ(10deg);

        span {
            position: absolute;
            height: 100%;
            left: 50%;
            top: 0;
            font-size: 2vw;
            color: @fontColor;
        }
    }

    .lyricList {
        mix-blend-mode: v-bind('lyricMode ? "normal" : "difference"');

        span {
            color: v-bind('lyricMode ? colorStore.maxColor : "inherit"');
            font-family: 'Harmony_Medium', sans-serif;
        }
    }

    .tLyricList {
        width: 28vw;
        height: 28vw;

        span {
            font-size: 1.5vw;
            color: rgb(127.5, 127.5, 127.5);
        }
    }

    #innerRing {

        .lyricList,
        .tLyricList {
            opacity: 0.7 !important;
            transform: translate(-50%, -50%) rotateZ(15deg) scale(0.6) !important;
        }
    }
}

#lineMode::-webkit-scrollbar {
    display: none
}

#lineMode {
    width: 75%;
    height: 80%;
    position: absolute;
    top: 10%;
    right: 0;
    z-index: 1;
    // padding: 25% 0 25% 25vw;
    padding-left: 25vw;
    overflow: auto;
    -webkit-mask-image: linear-gradient(transparent,
            white 10%,
            white 90%,
            transparent);


    .lineBox {
        max-width: 90%;

        ul {
            margin: 50% 0;
            .yrcLi {
                .lineYrcBox {
                    height: 100%;
                    position: relative;
                    margin: 0;

                    * {
                        font-size: 1.5vw !important;
                        margin: 0;
                    }

                    .sliderBox {
                        height: 100%;
                        position: absolute;
                        top: 0;
                        left: 0;
                        overflow: hidden;
                        // opacity: 0;
                        transform: translateX(0);
                        -webkit-mask-image: linear-gradient(to right,
                                transparent,
                                @bgiColor .5vw);

                        .moveBox {
                            color: @fontColor;
                        }
                    }
                }
            }

            li {
                list-style: none;
                margin: 2.5vw 0;
                opacity: 0.75;

                * {
                    transition: color .25s ease-in-out;
                }

                div {
                    font-size: 1.5vw;
                    margin: 0.25vw 0;
                    color: @fontColor;
                }

                >div:last-child {
                    font-size: 1.1vw;
                    font-family: 'Harmony_Light', sans-serif;
                }
            }
        }
    }
}
</style>