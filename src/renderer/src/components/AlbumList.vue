<template>
    <div id="AlbumList">
        <ul>
            <li>
                <div class="indexBox">#</div>
                <div class="nameBox">标题</div>
                <div class="createrBox">作者</div>
                <div class="sizeBox">歌曲数</div>
                <div class="publishBox">发布时间</div>
            </li>
            <el-divider />
            <li v-for="(item, index) in ifList" @click="jumpPage(item.id)">
                <div class="indexBox">{{ changeIndex(index) }}</div>
                <div class="nameBox">
                    <div><el-image :src="item.picUrl" loading="lazy" :preview-src-list="[item.picUrl]"
                            :preview-teleported="true" :hide-on-click-modal="true" /></div>
                    <div>
                        <span>{{ item.name }}</span>
                        <span v-if="item.transNames?.length" class="transBox">（{{ item.transNames?.join("/") }}）</span>
                    </div>
                </div>
                <div class="createrBox">{{ item.artists.map(i => i.name).join("/") }}</div>
                <div class="sizeBox">{{ item.size }}首</div>
                <div class="publishBox">{{ dayjs(item.publishTime).format("YYYY.MM.DD") }}</div>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import dayjs from 'dayjs'
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps(["searchList", "offset", "subList"]);

const changeIndex = (index: number) => {
    const nIndex = index + (props.offset - 1) * 30 + 1;
    return nIndex < 10 ? "0" + nIndex : nIndex;
}

const jumpPage = (id: number | string) => {
    router.push({
        name: "albumdetail",
        query: {
            id
        }
    })
}

const ifList = computed(() => {
    return props.searchList || props.subList
})

onMounted(() => {
    console.log(ifList);


})
</script>

<style scoped lang="less">
#AlbumList {
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
                flex: 0.375;
                justify-content: center
            }

            .nameBox {
                flex: 2;

                >div:last-child {
                    font-size: 1vw;
                    margin-left: 1.5vw;
                }

                .el-image {
                    width: 4vw;
                    height: 4vw;
                    border-radius: .5vw;

                }

                >div:first-child {
                    position: relative;
                }

                >div:first-child::before {
                    content: "";
                    width: 95%;
                    height: 95%;
                    border-radius: 50%;
                    position: absolute;
                    left: 20%;
                    top: 0;
                    background-color: black
                }

                .transBox {
                    color: @whiteGreyColor;
                    font-family: 'Harmony_Light', sans-serif;
                }
            }

            .createrBox {
                flex: 1.25
            }
        }
    }
}
</style>