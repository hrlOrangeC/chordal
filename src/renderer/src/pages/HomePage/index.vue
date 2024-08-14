<template>
    <div id="HomePage">
        <div id="centerDiagram" v-show="lyricShow || !musicStore.lyricMode">
            <img id="recordBox" src="../../imgs/record3.png">
            <img id="lightBigBox" src="../../imgs/lightBig.png">
            <img id="lightSmallBox" src="../../imgs/lightSmall.png">
            <img id="needleBox" src="../../imgs/bigggg.png">
            <img id="songBox" :src="musicStore.nowMusic?.al?.picUrl" @click="lyricShow=!lyricShow">
            <div id="ringBox"></div>
            <!--<Model :nowSong="nowSong" />-->
        </div>
        <Lyrics :recordDeg="recordDeg" :musicId="musicStore.nowMusic.id" :playbackProgress="playbackProgress"
            v-show="!lyricShow" />
        <div id="shadowBox"></div>
        <div id="hCLeft">
            <div id="hCBgibox"></div>
            <div id="hcLeftBox">
                <div id="hCmenuBox">
                    <div><span>See All</span></div>
                    <div><span>Top Pick's</span></div>
                    <div><span>Recent Vynil's</span></div>
                </div>
                <div id="hCuserBox">
                    <div id="imgBox"><img :src="nowArtist.artist?.avatar" /></div>
                    <div id="userNameBox">
                        <div id="nameBox">
                            <span>{{ nowArtist.artist?.name }} ({{ nowArtist.artist?.albumSize }})</span>
                        </div>
                        <div id="aliasBox">
                            <span>{{ nowArtist.artist?.alias.join(',') }}</span>
                        </div>
                    </div>
                </div>
                <div id="hCmodeBox">
                    <div id="mNameBox"><span>A side</span></div>
                    <div id="mChangeBox">
                        <el-icon>
                            <Refresh />
                        </el-icon>
                    </div>
                </div>
                <div id="hCmusicBox">
                    <div id="musicJumpTop" v-if="musicListIndex > 0" @click="changeMusicListIndex(-1)"><el-icon>
                            <ArrowUpBold />
                        </el-icon></div>
                    <TransitionGroup name="list" tag="ul" appear mode="out-in">
                        <li v-for="(item, index) in recommList.slice(musicListIndex, musicListIndex + 4 || recommList.length % 4)"
                            :key="item.id" @click="changeMusic(item)">
                            <div id="musicBgiBox" :class="{ liSelect: item.id === musicStore.nowMusic?.id }"></div>
                            <div id="musicNumBox">{{ changeIndex(musicListIndex + index + 1) }}</div>
                            <div id="musicImgBox">
                                <img :src="item.al.picUrl" />
                            </div>
                            <div id="musicControlBox"
                                :style="{ color: item.id == musicStore.nowMusic.id ? 'rgb(238,28,37)' : 'rgb(105, 105, 105)' }">
                                <el-icon>
                                    <CaretRight />
                                </el-icon>
                            </div>
                            <div id="musicNameBox">
                                <div>{{ item.name }}</div>
                                <div>{{ item.ar.map((i: any) => i.name).join("/") }}</div>
                            </div>
                            <div id="musicTimeBox">
                                {{ dayjs(item.dt).format("m:ss") }}
                            </div>
                        </li>
                    </TransitionGroup>
                    <div id="musicJumpBottom" v-if="musicListIndex + 5 < recommList.length"
                        @click="changeMusicListIndex(1)">
                        <el-icon>
                            <ArrowDownBold />
                        </el-icon>
                    </div>
                </div>
            </div>
        </div>
        <div id="hCRight">
            <div id="bgiBox">
                <div id="bgiTop"></div>
                <div id="bgiBottom">
                    <span> {{ musicStore.nowMusic.name }}</span>
                </div>
            </div>
            <div id="contentBox">
                <div id="contentTop">
                    <div id="albumBox">
                        <ul>
                            <li v-for="(_, index) in 3">
                                <el-image
                                    :src="musicStore.musicList[albumIndex + index >= musicStore.musicList.length ? index - 1 : albumIndex + index]?.al?.picUrl"
                                    loading="lazy" />
                            </li>
                        </ul>

                    </div>
                    <div id="albumNameBox">
                        <div id="albumLeft">
                            <div>
                                <div>{{ nowAlbum.album?.subType }}</div>
                                <div>{{ nowAlbum.album?.name }}</div>
                                <div>{{ dayjs(nowAlbum.album?.publishTime).format("YYYY.MM.DD") }}</div>
                            </div>
                            <div><el-icon>
                                    <Star />
                                </el-icon></div>
                        </div>
                        <div id="albumRight">{{ getNowLocation }} - {{ nowAlbum.songs?.length }}</div>
                    </div>
                </div>
                <div id="contentBottom">
                    <div id="cBTop">
                        <div>Info</div>
                        <div>{{ nowAlbum.album?.description || "这里是空的" }}</div>
                    </div>
                    <div id="cBBottom">
                        <el-button round dark>Order</el-button>
                        <el-button link>See ArtWork</el-button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted, } from 'vue';
import { recommendSongsAPI, songDetailAPI, artistDetailAPI, albumDetailAPI, anonimousAPI } from '../../api/index';
import { useMusicStore } from '../../store/music';
import Lyrics from "../../components/Lyrics.vue"
import dayjs from 'dayjs';

defineProps(['playbackProgress']);

const musicStore = useMusicStore();

const nowArtist = ref<any>({});
const nowAlbum = ref<any>({});
const recommList = ref<any[]>([]);
const recordDeg = ref<number>(0);
const timer = ref();
const musicListIndex = ref<number>(0);
const exist = ref<boolean>(true);
const lyricShow = ref<boolean>(false);

const getRecommendList = async () => {
    recommList.value = { ...await recommendSongsAPI({ timestamp: Date.now() }) }.data.data.dailySongs;
}

// 更新数据
const updateItem = async () => {
    await getArtistDetail(musicStore.nowMusic?.ar[0].id);
    await getAlbumDetail(musicStore.nowMusic.al.id);
}

// 获取歌曲数据
const getSongDetail = async (ids: number | string) => {
    musicStore.nowMusic = { ...await songDetailAPI({ ids }) }.data.songs[0];
}

const getArtistDetail = async (id: number | string) => {
    nowArtist.value = { ...await artistDetailAPI({ id }) }.data.data;
}

const getAlbumDetail = async (id: number | string) => {
    nowAlbum.value = { ...await albumDetailAPI({ id }) }.data;
}

// 转化索引
const changeIndex = (index: number) => {
    return index < 10 ? "0" + index : index;
}

const changeMusic = async item => {
    await getSongDetail(item.id);
}

// 转换索引
const changeMusicListIndex = (flag: number) => {
    flag < 0 ? musicListIndex.value -= 4 : musicListIndex.value += 4;
}

// 获取歌曲在专辑中所处位置
const getNowLocation = computed(() => {
    return nowAlbum.value.songs?.findIndex(item => item.id == musicStore.nowMusic.id) + 1
})

// 获取列表中当前专辑
const albumIndex = computed(() => {
    return musicStore.musicList.findIndex(i => i.id == musicStore.nowMusic.id);
})

// played
watch(() => musicStore.played, (nowValue) => {
    if (nowValue) {
        timer.value = setInterval(() => {
            recordDeg.value += 2;
        }, 100);
    } else {
        window.clearInterval(timer.value)
    }
}, { immediate: true })

// 切歌
watch(() => musicStore.nowMusic, async () => {
    await updateItem();
})

onMounted(async () => {
    !localStorage.getItem("cookie") && localStorage.setItem("cookie", { ...await anonimousAPI({ timestamp: Date.now() }) }.data.cookie);
    await getRecommendList();

    // 每日推荐第一首
    !musicStore.nowMusic.id && (musicStore.nowMusic = recommList.value[0]);
    await updateItem();
})

onUnmounted(() => {
    exist.value = false;
})

</script>
<style scoped lang="less">
.list-move,
.list-enter-active,
.list-leave-active {
    transition: all .5s ease-in-out;
}

.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: translateX(-100%) translateY(-100%);
}

.list-leave-active {
    position: absolute !important;
}

.liSelect {
    opacity: 0.75 !important;
}

#HomePage {
    position: absolute;
    display: flex;
    .absolutely();

    #centerDiagram,
    #shadowBox {
        position: absolute;
        left: v-bind('musicStore.lyricMode || lyricShow ? "50%" : "25%"');
        top: 45%;
        transform: translate(-50%, -50%);
        width: 35vw;
        height: 35vw;
        z-index: 999;
        border-radius: 50%;
        transition: all 1s ease-in-out;
        // box-shadow: 0 0 0 2vw rgb(255, 255, 255);

        .flexCenter();

        #recordBox {
            border-radius: 50%;
            width: 105%;
            transform: rotate(v-bind('recordDeg + "deg"'));
            filter: brightness(1.6);
            transition: all .3s linear;
        }

        #lightBigBox,
        #lightSmallBox {
            position: absolute;
            width: 100%;
            height: 100%;
            transform: rotateZ(-45deg);
            mix-blend-mode: soft-light;
            border-radius: 50%;
            overflow: hidden;
        }

        #songBox {
            position: absolute;
            width: 10vw;
            height: 10vw;
            border-radius: 50%;
            transform: rotate(v-bind('recordDeg + "deg"')) translateX(1%) translateY(-1%);
            transition: all .3s linear;
            box-shadow: 0 0 0 1vw @maxColor;
            cursor: pointer;
        }

        #ringBox {
            position: absolute;
            background-color: white;
            width: 2.5%;
            height: 2.5%;
            border-radius: 50%;
            box-shadow: 0 0 0 3px rgb(29, 38, 35);
        }

        #needleBox {
            position: absolute;
            top: -30%;
            left: 38%;
            width: 37.5%;
            transform-origin: right top;
            transform: rotateZ(v-bind('musicStore.played ? 0 : 25 + "deg"'));
            transition: all 1s ease-in-out;
        }
    }

    #shadowBox {
        width: 40vw;
        height: 40vw;
        z-index: 1;
        background-color: @fontColor;
    }

    #hCLeft,
    #hCRight {
        transition: all 1s ease-in-out;
    }

    #hCLeft {
        flex: 1;
        // transform: v-bind('exist ? "translateX(0) scaleX(1)" : "translateX(100%) scaleX(2)"');
        position: relative;
        z-index: 2;
        transform: translateX(v-bind('musicStore.lyricMode || lyricShow ? "" : "-50%"'));
        #hCBgibox {
            position: absolute;
            z-index: -1;
            background-color: @bgiColor;
            transform: skew(-15deg);
            .absolutely();
            
        }

        #hcLeftBox {
            width: 45%;
            height: 65%;
            left: 7.5%;
            position: absolute;
            top: 17.5%;
            display: flex;
            flex-direction: column;
            opacity: v-bind('musicStore.lyricMode || lyricShow ? 1 : 0');
            transition: all .25s ease-in-out;

            >div {
                flex: 1;
            }

            #hCmenuBox {
                width: 90%;
                display: flex;
                padding: 5%;
                flex: 0.2;
                justify-content: space-between;

                >div {
                    .flexCenter();

                    >span {
                        font-family: 'Harmony_Bold', sans-serif;
                        color: @greyColor;
                    }
                }
            }

            #hCuserBox {
                width: 90%;
                display: flex;
                flex: 0.3;

                >div {
                    padding-left: 5%;
                    .flexCenter();
                }

                #userNameBox {
                    flex-direction: column;
                    align-items: flex-start;

                }

                img {
                    width: 3vw;
                    border-radius: .5vw;
                }

                #nameBox {
                    font-size: 1.3vw;
                    overflow: hidden;
                    display: -webkit-box;
                    -webkit-box-orient: vertical;
                    -webkit-line-clamp: 1;
                }

                #aliasBox {
                    font-size: 0.7vw;
                    color: @greyColor;

                    span {
                        font-family: 'Harmony_Bold', sans-serif;
                    }

                }
            }

            #hCmodeBox {
                display: flex;
                flex: 0.4;

                >div {
                    .flexCenter();
                }

                #mNameBox {
                    flex: 1;
                    font-size: 7vw;

                    >span {
                        font-family: 'Harmony_Bold', sans-serif;
                        color: black;
                    }
                }

                #mChangeBox {
                    justify-content: flex-end;
                    flex: 0.1;
                    font-size: 1.7vw;
                    color: @greyColor;
                }
            }

            #hCmusicBox:hover #musicJumpTop,
            #hCmusicBox:hover #musicJumpBottom {
                z-index: 0;
                opacity: 1;
                transform: translateX(-50%) translateY(0) skew(-15deg);
            }

            #hCmusicBox {
                flex: 2;
                .absolutely();
                position: relative;
                top: -10%;

                #musicJumpTop,
                #musicJumpBottom {
                    position: absolute;
                    width: 5vw;
                    height: 3vh;
                    left: 50%;
                    background-color: rgba(255, 255, 255, 0.2);
                    cursor: pointer;
                    z-index: -2;
                    opacity: 0;
                    transition: all .25s ease-in-out;
                    .flexCenter()
                }

                #musicJumpTop {
                    top: -8%;
                    transform: translateX(-50%) translateY(-100%) skew(-15deg);
                }

                #musicJumpBottom {
                    bottom: -8%;
                    transform: translateX(-50%) translateY(100%) skew(-15deg);
                }

                ul {
                    .absolutely();
                    position: absolute;
                }

                li {
                    width: 100%;
                    height: 25%;
                    list-style: none;
                    display: flex;
                    position: relative;
                    cursor: pointer;

                    >div {
                        flex: 1;
                        .flexCenter();
                        z-index: 1;
                    }

                    #musicBgiBox {
                        position: absolute;
                        width: 110%;
                        height: 100%;
                        background-color: @bgiSColor;
                        box-shadow: 0.7vw 2.5vw 1.5vw 1.5vw rgb(20, 20, 20);
                        left: -5%;
                        top: 0;
                        transform: skew(-15deg);
                        z-index: 0;
                        opacity: 0;
                        transition: all .25s ease-in-out;
                    }

                    #musicNumBox {
                        flex: 0.25;
                        font-family: 'Harmony_Medium', sans-serif;
                    }

                    #musicImgBox {
                        flex: 0.3;

                        img {
                            width: 2.8vw;
                            height: 2.8vw;
                            border-radius: .5vw;
                        }
                    }

                    #musicControlBox {
                        flex: 0.25;
                        font-size: 1.7vw;
                        transition: all .25s ease-in-out;
                    }

                    #musicNameBox {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        align-items: flex-start;
                        overflow: hidden;

                        >div {
                            width: 100%;
                            font-family: 'Harmony_Medium', sans-serif;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        }

                        :last-child {
                            font-size: 0.7vw;
                            color: @greyColor;
                            font-family: 'Harmony_Bold', sans-serif;
                        }
                    }

                    #musicTimeBox {
                        flex: 0.3;
                        font-size: 0.9vw;
                        font-family: 'Harmony_Bold', sans-serif;
                        color: grey
                    }
                }
            }
        }
    }

    #hCRight {
        flex: 1;
        position: relative;
        background-color: @hslColor;
        transform: translateX(v-bind('musicStore.lyricMode || lyricShow ? "" : "-50%"'));

        #bgiBox {
            .absolutely();
            display: flex;
            flex-direction: column;
            background-image: linear-gradient(@hslColor, @maxColor);
            transform: skew(-15deg);
            width: v-bind('musicStore.lyricMode || lyricShow ? "200%" : "300%"');

            >div {
                flex: 1;
                .absolutely();
            }

            #bgiTop {
                // background-color: @maxColor;
                transition: all 1s ease-in-out;
            }

            #bgiBottom {
                // background-color: @secColor;
                transition: all 1s ease-in-out;
                position: relative;

                >span {

                    width: 60%;
                    display: block;
                    position: absolute;
                    font-size: 15vw;
                    line-height: 100%;
                    bottom: 5%;
                    left: 0;
                    white-space: normal;
                    word-wrap: break-word;
                    word-break: break-all;
                    color: rgba(0, 0, 0, 0.1);
                    font-family: 'Harmony_Bold', sans-serif;
                    transform: skew(15deg)
                }
            }
        }

        #contentBox {
            .absolutely();
            position: absolute;
            top: 17.5%;
            left: 47.5%;
            width: 52.5%;
            height: 65%;
            display: flex;
            flex-direction: column;
            opacity: v-bind('musicStore.lyricMode || lyricShow ? 1 : 0');
            transition: all .25s ease-in-out;

            >div {
                flex: 1
            }

            #contentTop {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: flex-end;

                #albumBox {
                    flex: 1;
                    overflow: auto;

                    >ul {
                        display: flex;
                        align-items: flex-end;
                        .absolutely();
                    }

                    li:first-child {
                        opacity: 1;
                    }

                    li {
                        list-style: none;
                        margin-right: 7.5%;
                        opacity: 0.5;
                        width: 10vw;
                        height: 10vw;
                        position: relative;
                        transition: all .25s ease-in-out;

                        .el-image {
                            width: 10vw;
                        }

                    }
                }

                #albumBox::-webkit-scrollbar {
                    display: none
                }

                #albumNameBox {
                    .absolutely();
                    display: flex;
                    flex: 0.6;

                    >div {
                        flex: 1;
                        .flexCenter();
                    }

                    #albumLeft {
                        flex: 1;
                        display: flex;
                        justify-content: flex-start;
                        overflow: hidden;

                        >div {
                            flex: 1;
                            flex-direction: column;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            word-break: break-all;
                            white-space: nowrap;
                        }

                        >div:first-child {
                            font-size: 1.2vw;
                            flex: 6;

                            >div {
                                font-family: 'Harmony_Medium', sans-serif;
                                overflow: hidden;
                                text-overflow: ellipsis;
                                word-break: break-all;
                                white-space: nowrap;
                                margin: 1% 0;
                                color: @fontColor;
                                .blendMode()
                            }

                            :first-child,
                            :last-child {
                                font-size: 0.9vw;
                                font-family: 'Harmony_Regular', sans-serif;
                                color: @whiteGreyColor
                            }
                        }

                        >div:last-child {
                            font-size: 1.3vw;
                            align-items: center;
                            color: @bgiColor;
                            .blendMode()
                        }
                    }

                    #albumRight {
                        flex: 0.5;
                        font-size: 1.3vw;
                        font-family: 'Harmony_Medium', sans-serif;
                        color: @fontColor;
                        .blendMode()
                    }
                }
            }

            #contentBottom {
                flex: 1;
                display: flex;
                flex-direction: column;

                #cBTop {
                    flex: 2;

                    >div {
                        line-height: 175%;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        -webkit-line-clamp: 6;
                        display: -webkit-box;
                        -webkit-box-orient: vertical;
                        margin: 2.5% 0;
                        .blendMode()
                    }

                    :first-child {
                        height: 20%;
                        line-height: 300%;
                        font-family: 'Harmony_Bold', sans-serif;
                    }

                    :last-child {
                        width: 80%;
                        font-size: 0.8vw;
                        color: @whiteGreyColor
                    }
                }

                #cBBottom {
                    flex: 1;
                    .flexCenter();

                    .el-button:first-child {
                        color: @bgiColor;
                    }

                    .el-button {
                        width: 50%;
                        height: 5vh;
                        border: none;
                        color: @fontColor;
                        font-family: 'Harmony_Bold', sans-serif;

                        >* {
                            font-family: 'Harmony_Bold', sans-serif;
                            font-size: 0.9vw;
                        }
                    }
                }
            }
        }
    }
}
</style>