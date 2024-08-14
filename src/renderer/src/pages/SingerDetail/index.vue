<template>
    <div id="SingerDetail" v-loading="loading" element-loading-background="rgba(0, 0, 0, 0.75)">
        <div class="sTop">
            <div class="imgBox" ref="img">
                <el-image :src="singerDetail?.picUrl" />
            </div>
            <div class="detailBox">
                <div class="nameBox">{{ singerDetail?.name }}</div>
                <div class="aliaBox" v-if="singerDetail?.alias">{{ singerDetail?.alias.join("/") }}</div>
                <div class="briBox">{{ singerDetail?.briefDesc }}</div>
                <div class="btnBox">
                    <el-button :color="colorStore.maxColor" dark class="bigBtn">
                        <div v-if="singerDetail?.followed">
                            <success theme="outline" />已关注
                        </div>
                        <div v-else>
                            <concern theme="outline" />关注
                        </div>
                    </el-button>
                </div>
            </div>
        </div>
        <div class="sCenter">
            <el-affix :offset="60" ref="affix">
                <Segmented :iconList="iconList" :moveDistance="moveDistance" :liWidth="12" @jumpSearch="jumpSearch" />
            </el-affix>
        </div>
        <div class="sBottom">
            <div class="componentBox" v-if="iconList[moveDistance]?.searchList?.length">
                <transition name="el-fade-in-linear" appear mode="out-in">
                    <KeepAlive>
                        <component :is="iconList[moveDistance].component"
                            :searchList="iconList[moveDistance].searchList.slice((iconList[moveDistance].offset - 1) * limit, iconList[moveDistance].offset * limit)"
                            :offset="iconList[moveDistance].offset" />
                    </KeepAlive>
                </transition>
            </div>
            <el-empty :description="`未能找到与 “${singerDetail?.name}” 相关的${iconList[moveDistance].name}`"
                v-else-if="!loading" />
        </div>
        <PaginBox :limit="limit" :total="iconList[moveDistance].searchList?.length" :variable="moveDistance"
            v-model:offset="iconList[moveDistance].offset" />
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted, watch, onActivated,  shallowRef, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { singerDeatilAPI, singerSongsAPI, singerAlbumsAPI, singerMVsAPI } from "../../api/index";
import { Concern, Success } from '@icon-park/vue-next';
import MusicList from "../../components/MusicList.vue";
import AlbumList from "../../components/AlbumList.vue";
import MVList from "../../components/MVList.vue";
import PaginBox from "../../components/PaginBox.vue";
import Segmented from "../../components/Segmented.vue";
import { useColorStore } from '../../store/color';
import { useMusicStore } from '../../store/music';

const musicStore = useMusicStore();
const colorStore = useColorStore();

const route = useRoute();
const router = useRouter();


const singerDetail = ref<any>();
const limit = ref<number>(30);
const loading = ref<boolean>(false);
const iconList = ref<any[]>([
    {
        name: "单曲",
        component: shallowRef(MusicList),
        api: singerSongsAPI,
        type: 1,
        offset: 1,
        list: "songs",
        searchList: []
    },
    {
        name: "专辑",
        component: shallowRef(AlbumList),
        api: singerAlbumsAPI,
        type: 10,
        offset: 1,
        list: "hotAlbums",
        searchList: []
    },
    {
        name: "MV",
        component: shallowRef(MVList),
        api: singerMVsAPI,
        type: 1004,
        list: "mvs",
        offset: 1,
        searchList: []
    }
])

const img = ref();
const affix = ref();

const getDetail = async () => {
    singerDetail.value = { ...await singerDeatilAPI({ id: route.query.id }) }.data.artist;
}

const getList = async () => {
    loading.value = true;
    const iList = iconList.value[moveDistance.value];
    const slist = await iList.api({ id: route.query.id });
    iList.searchList = slist.data[iList.list];
    loading.value = false;
}

const moveDistance = computed(() => {
    return iconList.value.map(i => i.type).findIndex(i => i == (route.query.stype || musicStore.singerHistory.stype));
})

const jumpSearch = async (stype: number) => {
    const query = { stype, id: route.query.id };
    musicStore.singerHistory = query;
    await router.push({
        query
    });
    await getList()
}

watch(singerDetail, () => {
    iconList.value.map(i => i.offset = 1);
    jumpSearch(1);
}, { deep: true })

onActivated(async () => {
    affix.value.updateRoot();
    await getDetail();
    await getList();
})

onMounted(() => {

})
</script>
<style scoped lang="less">
#SingerDetail {
    .absolutely();
    padding-bottom: 10%;

    .sTop {
        padding: 5%;
        display: flex;

        >div {
            flex: 1
        }

        .imgBox {
            height: 20vw;
            overflow: hidden;
            border-radius: .5vw;
            box-shadow: 0 0 2.5vw 2.5vw @bgiSColor;
            color: @maxColor;
            margin-right: 3vw;
            .flexCenter();

            .el-image {
                width: 100%;

            }
        }

        .detailBox {
            display: flex;
            flex-direction: column;

            >div {
                flex: 0.75;
                .flexCenter();
                justify-content: flex-start;
            }

            .nameBox {
                font-size: 2.5vw;
            }

            .aliaBox {
                flex: 0.5;
                font-size: 1.1vw;
                color: @whiteGreyColor;
                align-items: flex-start;
            }

            .briBox {
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

                .el-button {
                    width: auto;
                    height: 2.5vw;
                    font-size: 1.1vw;
                    color: @whiteGreyColor;
                    border-radius: .1vw;
                    padding: 1vw;

                    div {
                        .flexCenter();
                    }

                    span {
                        font-size: 1.5vw;
                        margin-right: .5vw;
                        line-height: 100%;
                    }

                }
            }
        }
    }

    .sCenter {
        width: 100%;
        margin-bottom: 3vw;
        transition: opacity .25s ease-in-out;
        position: relative;
        z-index: 1000;
        // opacity: v-bind('sCenterShow ? 1 : 0');
    }

}
</style>