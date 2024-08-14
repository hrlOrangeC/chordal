<template>
    <div id="Collection" v-loading="loading" element-loading-background="rgba(0, 0, 0, 0.75)" ref="scroll">
        <div class="cTop">
            <div class="titleBox">
                <star theme="outline" />我的收藏
            </div>
            <el-affix :offset="80" ref="affix">
                <Segmented :iconList="iconList" :moveDistance="active" :liWidth="10" @jumpSearch="getList" />
            </el-affix>
        </div>
        <div class="cBottom">
            <div v-if="iconList[active].subList?.length">
                <transition name="el-fade-in-linear" appear mode="out-in">
                    <KeepAlive>
                        <component :is="iconList[active].component" :subList="iconList[active].subList"
                            :offset="iconList[active].offset" />
                    </KeepAlive>
                </transition>
            </div>
            <el-empty :description="`您未收藏${iconList[active].name}`" v-else-if="!loading" />
            <PaginBox :limit="30" :total="iconList[active].subList?.length" :variable="active"
                v-model:offset="iconList[active].offset" @currentChange="getList" />
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onActivated } from 'vue';
import { userSubcountAPI, userPlayListAPI, albumSubListAPI, artistSubListAPI, MVSubListAPI } from '../../api/index';
import Segmented from "../../components/Segmented.vue";
import PaginBox from "../../components/PaginBox.vue";
import PlayList from "../../components/PlayList.vue";
import AlbumList from "../../components/AlbumList.vue";
import SingerList from "../../components/SingerList.vue";
import MVList from "../../components/MVList.vue";
import { useUserStore } from '../../store/user';
import { Star } from '@icon-park/vue-next';

const userStore = useUserStore();

const affix = ref();

interface ILIst {
    name: string,
    type: number,
    component: object,
    subList: object[],
    offset: number,
    api: any
}

const active = ref<number>(0);
const loading = ref<boolean>(false);
const iconList = ref<ILIst[]>([
    {
        name: "歌单",
        type: 0,
        component: PlayList,
        subList: [],
        offset: 1,
        api: userPlayListAPI,
    },
    {
        name: "专辑",
        type: 1,
        component: AlbumList,
        subList: [],
        offset: 1,
        api: albumSubListAPI,
    },
    {
        name: "歌手",
        type: 2,
        component: SingerList,
        subList: [],
        offset: 1,
        api: artistSubListAPI,
    },
    {
        name: "MV",
        type: 3,
        component: MVList,
        subList: [],
        offset: 1,
        api: MVSubListAPI,
    },
])

const getDetail = async () => {
    await userSubcountAPI({ timestamp: Date.now() });
}

const getList = async (type: number) => {
    loading.value = true;
    active.value = type;
    const iList = iconList.value[type];
    iList.subList = {
        ...await iList.api({
            uid: type == 0 ? userStore.userDetail.userId : null,
            limit: 30,
            offset: iList.offset - 1,
            timestamp: Date.now()
        })
    }.data[type == 0 ? "playlist" : "data"];
    loading.value = false;
}

onMounted(async () => {
    await getDetail();
    await getList(active.value);
})

onActivated(() => {
    affix.value.update();
    affix.value.updateRoot();
})
</script>
<style lang="less">
#Collection {
    .absolutely();
    padding: 5% 0 10% 0;

    .cTop {
        margin-bottom: 5%;

        .titleBox {
            font-size: 1.5vw;
            margin: 2vw;
            font-family: 'Harmony_Medium', sans-serif;

            span {
                margin: 0 .5vw;
            }
        }
    }
}
</style>