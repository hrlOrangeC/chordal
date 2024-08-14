<template>
    <div id="PlayListDetail" v-loading="loading" element-loading-background="rgba(0, 0, 0, 0.75)">
        <div class="pTop">
            <div class="pLTop" ref="img">
                <el-image :src="playListDetail?.coverImgUrl" loading="lazy"
                    :preview-src-list="[playListDetail?.coverImgUrl]" :preview-teleported="true"
                    :hide-on-click-modal="true" />
            </div>
            <div class="pRTop">
                <div class="nameBox">{{ playListDetail?.name }}</div>
                <div class="timeBox">
                    <span>{{ playListDetail?.creator.nickname }}</span>
                    <span>-</span>
                    <span>{{ dayjs(playListDetail?.createTime).format("YYYY年MM月DD日") }}</span>
                </div>
                <div class="tagBox">
                    <ul>
                        <li v-for="item in playListDetail?.tags" ref="li"><span>{{ item }}</span></li>
                    </ul>
                </div>
                <div class="desBox">
                    {{ playListDetail?.description || "简介走丢了......" }}
                </div>
                <div class="btnBox">
                    <el-button-group>
                        <el-button :color="colorStore.maxColor" dark class="bigBtn" @click="playAll(false)">
                            <play-one theme="outline" />播放全部
                        </el-button>
                        <el-button :color="colorStore.maxColor" dark class="smallBtn" @click="playAll(true)">
                            <plus theme="outline" />
                        </el-button>
                    </el-button-group>
                    <el-button-group>
                        <el-button type="primary" :color="colorStore.maxColor" dark class="bigBtn">
                            <folder-focus theme="outline" />
                            <div>{{ playListDetail?.subscribedCount }}</div>
                        </el-button>
                        <el-button type="primary" :color="colorStore.maxColor" dark class="bigBtn" @click="jumpPage()">
                            <comments theme="outline" />
                            <div>{{ playListDetail?.commentCount }}</div>
                        </el-button>
                    </el-button-group>
                </div>
            </div>
        </div>
        <div class="pCenter"></div>
        <div class="pBottom">
            <MusicList :playList="playList" :offset="offset" />
        </div>
        <PaginBox :limit="30" :total="playListDetail?.trackCount" :variable="playList.length" v-model:offset="offset"
            @currentChange="getList" />
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onActivated } from 'vue';
import { playlistDetailAPI, playlistTrackAllAPI } from '../../api/index';
import MusicList from "../../components/MusicList.vue";
import PaginBox from "../../components/PaginBox.vue";
import { useColorStore } from '../../store/color';
import { useRoute, useRouter } from 'vue-router';
import { Plus, FolderFocus, Comments, PlayOne } from '@icon-park/vue-next';
import dayjs from 'dayjs'
import { useMusicStore } from '../../store/music';
import { ElMessage } from 'element-plus'

const musicStore = useMusicStore();

const route = useRoute();
const router = useRouter();

const colorStore = useColorStore();

interface IDetail {
    id: number;
    trackCount: number;
    commentCount: number;
    subscribedCount: number;
    description: string;
    tags: string[];
    createTime: string;
    creator: { nickname: string };
    coverImgUrl: string;
    name: string
}

const playListDetail = ref<IDetail>();
const playList = ref<object[]>([]);
const img = ref();
const offset = ref<number>(1);
const loading = ref<boolean>(false);

const getDetail = async () => {
    playListDetail.value = { ...await playlistDetailAPI({ id: route.query.id }) }.data.playlist;
}

const getList = async () => {
    loading.value = true;
    playList.value = {
        ...await playlistTrackAllAPI({
            id: route.query.id,
            offset: (offset.value - 1) * 30,
            limit: 30
        })
    }.data.songs;
    loading.value = false;
}

const playAll = async (flag: boolean) => {
    const list = {
        ...await playlistTrackAllAPI({
            id: route.query.id
        })
    }.data.songs;
    if (flag) {
        list.map(item => {
            if (musicStore.musicList.findIndex(sitem => sitem.id == item.id) == -1) {
                musicStore.musicList.push(item);
            }
        })
        ElMessage({
            message: "添加到播放列表成功",
            type: "success",
            plain: true
        });
    } else {
        musicStore.musicList = list;
        musicStore.nowMusic = musicStore.musicList[0];
        ElMessage({
            message: "播放全部成功",
            type: "success",
            plain: true
        });
    }
    localStorage.setItem("musicList", JSON.stringify(musicStore.musicList))
}

const jumpPage = () => {
    router.push({
        name: "comments",
        query: {
            id: playListDetail.value!.id,
            ctype: 2
        }
    })
}

watch(() => playListDetail, () => {
    offset.value = 1;
}, { deep: true })

onActivated(async () => {
    await getDetail();
    await getList();
})

</script>

<style scoped lang="less">
#PlayListDetail {
    .absolutely();
    padding-bottom: 10%;

    .pTop {
        padding: 5%;
        display: flex;

        .pLTop {
            color: @maxColor;

            .el-image {
                width: 20vw;
                height: 20vw;
                border-radius: .5vw;
                box-shadow: 0 0 2.5vw 2.5vw @bgiSColor;
            }
        }

        .pRTop {
            margin-left: 3vw;
            font-size: 1vw;
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;

            >div {
                flex: 0.75;
                .flexCenter();
                justify-content: flex-start;
            }

            .nameBox {
                font-size: 2.5vw;
                font-family: 'Harmony_Medium', sans-serif;
            }

            .timeBox {
                flex: 0.25;
                align-items: flex-start;

                span {
                    margin-right: 1vw;
                }
            }

            .tagBox {
                ul {
                    display: flex;

                    li {
                        list-style: none;
                        background-color: @maxColor;
                        margin: 0 .5vw;
                        padding: .25vw .75vw;
                        transform: skewX(-15deg);
                        position: relative;

                        span {
                            display: block;
                            transform: skewX(15deg);
                        }
                    }

                    li:first-child {
                        span {
                            position: relative;
                            left: -7.5%
                        }
                    }

                    li:last-child {
                        span {
                            position: relative;
                            right: -7.5%
                        }
                    }

                    li:first-child::before,
                    li:last-child::before {
                        .absolutely();
                        position: absolute;
                        content: "";
                        top: 0;
                        transform: skewX(15deg);
                        z-index: -1;
                        background-color: @maxColor
                    }

                    li:first-child::before {
                        left: -7.5%;
                    }

                    li:last-child::before {
                        right: -7.5%
                    }
                }

            }

            .desBox {
                line-height: 150%;
                font-size: 1vw;
                color: @whiteGreyColor;
                font-family: 'Harmony_Light', sans-serif;
                overflow: hidden;
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 3;
            }

            .btnBox {
                >* {
                    margin-right: 3vw;
                }

                .el-button {
                    width: auto;
                    height: 2.5vw;
                    font-size: 1.1vw;
                    color: @whiteGreyColor;
                    border-radius: .1vw;

                    span {
                        font-size: 1.5vw;
                        line-height: 100%;
                    }

                    div {
                        margin-left: .5vw
                    }
                }

                .bigBtn {
                    padding: 1vw;
                    border-right: .2vw solid @bgiColor;
                }

                .smallBtn {
                    padding: .5vw;
                }
            }
        }
    }
}
</style>