<template>
    <div id="MVList">
        <ul>
            <li v-for="item in ifList" @click="jumpPage(item.id)">
                <div class="imgBox">
                    <el-image :src="item.cover || item.imgurl || item.coverUrl" loading="lazy" />
                    <div class="occBox">
                        <movie theme="outline" strokeLinejoin="miter" strokeLinecap="butt" />
                        <div class="playCountBox"><play-one theme="filled"/>{{
                            conversionNum(item.playCount || item.playTime) }}</div>
                        <div class="dtBox">{{ dayjs(item.duration || item.durationms).format("mm:ss") }}</div>
                    </div>
                </div>
                <div class="nameBox">
                    {{ item.name || item.title }}
                </div>
                <div class="createrBox">{{ (item.artists || item.creator)?.map(i => i.name || i.userName).join("/") }}</div>
            </li>
            <i v-for="_ in ifList.length % 4 == 0 ? 0 : 4 - ifList.length % 4"></i>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Movie, PlayOne } from '@icon-park/vue-next';
import dayjs from 'dayjs'

const router = useRouter();

const props = defineProps(['searchList', "subList"]);

const conversionNum = (num: number) => {
    if (num > 10000) {
        return (num / 10000).toFixed(2) + "万";
    } else {
        return num;
    }
}

const jumpPage = (id: number | string) => {
    router.push({
        name: "mvdetail",
        query: {
            id
        }
    })
}

const ifList = computed(() => {
    return props.searchList || props.subList
})

onMounted(() => {


})
</script>

<style scoped lang="less">
#MVList {
    .absolutely();

    ul {
        .absolutely();
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        padding: 0 2vw;

        li:hover {
            background-color: @bgiSColor;

            >.imgBox {
                .el-image {
                    transform: scale(1.1);
                }

                .occBox {
                    opacity: 0.75;
                }
            }
        }

        li {
            flex: 1;
            list-style: none;
            padding: 2vw;
            cursor: pointer;
            transition: all .25s ease-in-out;

            .imgBox {
                width: 20vw;
                height: 11vw;
                overflow: hidden;
                border-radius: .5vw;
                position: relative;
                .flexCenter();

                .el-image {
                    transition: all .25s ease-in-out;
                }

                .occBox {
                    .absolutely();
                    .flexCenter();
                    position: absolute;
                    opacity: 0;
                    background-color: @bgiColor;
                    transition: all .25s ease-in-out;
                    font-size: 4vw;

                    .playCountBox,
                    .dtBox {
                        position: absolute;
                        font-size: 1vw;
                        bottom: 7.5%;
                    }

                    .playCountBox {
                        left: 5%
                    }

                    .dtBox {
                        right: 5%;
                    }
                }
            }

            .nameBox,
            .createrBox {
                overflow: hidden;
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 1;
            }

            .nameBox {
                font-size: 1vw;
                margin: 1vw 0 .5vw 0;
            }

            .createrBox {
                color: @whiteGreyColor
            }
        }

        i {
            flex: 1;
            padding: 2vw;
        }
    }
}
</style>