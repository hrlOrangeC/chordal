<template>
    <div id="AlbumDetail">
        <div class="aTop">
            <div class="aLTop" ref="img">
                <el-image :src="albumDetail?.blurPicUrl" loading="lazy" :preview-src-list="[albumDetail?.blurPicUrl]"
                    :preview-teleported="true" :hide-on-click-modal="true" />
            </div>
            <div class="aRTop">
                <div class="nameBox">{{ albumDetail?.name }}</div>
                <div class="timeBox">
                    <span>{{ albumDetail?.artist.name }}</span>
                </div>
                <!--<div class="tagBox">
                        <span>{{ albumDetail.subType }}</span>
                        <span>-</span>
                        <span>{{ albumDetail.company }}</span>
                    </div>-->
                <div class="desBox">
                    {{ albumDetail?.description || "简介走丢了......" }}
                </div>
                <div class="btnBox">
                    <el-button-group>
                        <el-button :color="colorStore.maxColor" dark class="bigBtn">
                            <play-one theme="outline" />播放全部
                        </el-button>
                        <el-button :color="colorStore.maxColor" dark class="smallBtn">
                            <plus theme="outline" />
                        </el-button>
                    </el-button-group>
                    <el-button-group>
                        <el-button type="primary" :color="colorStore.maxColor" dark class="bigBtn">
                            <folder-focus theme="outline" />
                            <!--<div>{{ albumDetail?.info.likedCount }}</div>-->
                        </el-button>
                        <el-button type="primary" :color="colorStore.maxColor" dark class="bigBtn" @click="jumpPage">
                            <comments theme="outline" />
                            <div>{{ albumDetail?.info.commentCount }}</div>
                        </el-button>
                    </el-button-group>
                </div>
            </div>
        </div>
        <div class="aCenter">
            <MusicList :albumSongList="albumSongList.slice((offset - 1) * 30, (offset) * 30)" :offset="offset" />
        </div>
        <div class="aBottom">
            <span>{{ dayjs(albumDetail?.publishTime).format("YYYY-MM-DD") }}</span>
            <span>{{ albumDetail?.company }}</span>
            <span>{{ albumDetail?.subType }}</span>
        </div>
        <PaginBox :limit="30" :total="albumSongList.length" :variable="albumSongList.length" v-model:offset="offset" />
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onActivated } from 'vue';
import { albumDetailAPI } from '../../api/index';
import MusicList from "../../components/MusicList.vue";
import PaginBox from "../../components/PaginBox.vue";
import { useColorStore } from '../../store/color';
import { useRoute, useRouter } from 'vue-router';
import { Plus, FolderFocus, Comments, PlayOne } from '@icon-park/vue-next';
import dayjs from 'dayjs'

const route = useRoute();
const router = useRouter();

const colorStore = useColorStore();

const albumDetail = ref();
const albumSongList = ref<object[]>([]);
const img = ref();
const offset = ref<number>(1);

// 获取详情
const getDetail = async () => {
    const { album, songs } = { ...await albumDetailAPI({ id: route.query.id }) }.data;
    albumDetail.value = album;
    albumSongList.value = songs;
}

// 跳转页面
const jumpPage = () => {
    router.push({
        name: "comments",
        query: {
            id: albumDetail.value.id,
            ctype: 3
        }

    })
}

// 重置offset
watch(albumDetail, () => {
    offset.value = 1;
}, { deep: true })

onActivated(async () => {
    await getDetail();
})

</script>

<style scoped lang="less">
#AlbumDetail {
    .absolutely();
    padding-bottom: 10%;

    .aTop {
        padding: 5%;
        display: flex;

        .aLTop {
            color: @maxColor;

            .el-image {
                width: 20vw;
                height: 20vw;
                border-radius: .5vw;
                box-shadow: 0 0 2.5vw 2.5vw @bgiSColor;
            }
        }

        .aRTop {
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
                flex: 0.5;
                align-items: flex-start;

                span {
                    margin-right: 1vw;
                }
            }

            .desBox {
                flex: 0.6;
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

    .aBottom {
        padding: 5%;
        color: @whiteGreyColor;

        span {
            display: block;
            margin: .5vw 0;
            font-style: italic;
        }
    }
}
</style>