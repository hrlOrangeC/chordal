<template>
    <div id="PlayList">
        <ul>
            <li>
                <div class="indexBox">#</div>
                <div class="nameBox">标题</div>
                <div class="numBox">歌曲数</div>
                <div class="createrBox">创建者</div>
                <div class="playBox">播放量</div>
            </li>
            <el-divider />
            <li v-for="(item, index) in ifList" @click="jumpPage(item.id)">
                <div class="indexBox">{{ changeIndex(index) }}</div>
                <div class="nameBox">
                    <div><el-image :src="item.coverImgUrl" loading="lazy" :preview-src-list="[item.coverImgUrl]"
                            :preview-teleported="true" :hide-on-click-modal="true" /></div>
                    <div>{{ item.name }}</div>
                </div>
                <div class="numBox">{{ item.trackCount }}首</div>
                <div class="createrBox">{{ item.creator.nickname }}</div>
                <div class="playBox">{{ conversionNum(item.playCount) }}</div>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps(["searchList", "offset", "userPlayList", "subList"]);

const changeIndex = (index: number) => {
    const nIndex = props.offset ? index + (props.offset - 1) * 30 + 1 : index + 1;
    return nIndex < 10 ? "0" + nIndex : nIndex;
}

const conversionNum = (num: number) => {
    if (num > 10000) {
        return (num / 10000).toFixed(2) + "万";
    } else {
        return num;
    }
}

const jumpPage = (id: number | string) => {
    router.push({
        name: "playlistdetail",
        query: {
            id
        }
    })
}

const ifList = computed(() => {
    return props.searchList || props.userPlayList || props.subList
})

onMounted(() => {


})
</script>

<style scoped lang="less">
#PlayList {
    .absolutely();

    ul {
        .absolutely();

        .el-divider {
            border-color: @bgiSColor;
            margin: 0
        }

        li:not(:first-child):hover {
            background-color: @bgiSColor;
        }

        li:first-child {
            cursor: inherit;

            * {
                font-size: 0.9vw !important;
                font-style: italic;
                color: @whiteGreyColor !important; 
            }
        }

        li {
            width: 100%;
            display: flex;
            list-style: none;
            .flexCenter();
            padding: 1.25vw 0;
            transition: all .25s ease-in-out;
            cursor: pointer;

            >div {
                flex: 0.5;
                .flexCenter();
                justify-content: flex-start;
            }

            .indexBox {
                flex: 0.35;
                justify-content: center
            }

            .nameBox {
                flex: 2;

                >div:last-child {
                    font-size: 1vw;
                    margin-left: 1vw;
                }

                .el-image {
                    width: 4vw;
                    height: 4vw;
                    border-radius: .5vw;

                }
            }

            .createrBox {
                flex: 1
            }
        }
    }
}
</style>