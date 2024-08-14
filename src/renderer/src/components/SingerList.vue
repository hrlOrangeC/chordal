<template>
    <div id="SingerList">
        <ul>
            <li v-for="item in ifList" @click="jumpPage(item.id)">
                <div class="imgBox">
                    <el-image :src="item.img1v1Url" loading="lazy" />
                    <div class="occBox">
                        <microphone-one theme="outline" />
                    </div>
                </div>
                <div class="nameBox">
                    <span>{{ item.name }}</span>
                    <span v-if="item.transNames" class="tranBox">（{{ item.transNames?.join("/") }}）</span>
                </div>
                <div class="numBox">
                    <span>专辑：{{ item.albumSize }}</span>
                    <span v-if="item.mvSize">MV：{{ item.mvSize }}</span>
                </div>
            </li>
            <i v-for="_ in ifList.length % 6 == 0 ? 0 : 6 - ifList.length % 6"></i>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { MicrophoneOne } from '@icon-park/vue-next';
import { useRouter } from 'vue-router';
import { useMusicStore } from '../store/music';

const musicStore = useMusicStore();

const router = useRouter();

const props = defineProps(['searchList', "subList"]);

const jumpPage = (id: number | string) => {
    router.push({
        name: "singerdetail",
        query: { stype: musicStore.singerHistory.stype || null, id }
    })
}

const ifList = computed(() => {
    return props.searchList || props.subList
})

onMounted(() => {


})
</script>

<style scoped lang="less">
#SingerList {
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

        i {
            flex: 1;
            padding: 2vw;
        }

        li {
            flex: 1;
            list-style: none;
            padding: 2vw;
            cursor: pointer;
            transition: all .25s ease-in-out;
            .flexCenter();
            flex-direction: column;

            >div {
                .flexCenter();
            }

            .imgBox {
                overflow: hidden;
                width: 10vw;
                height: 10vw;
                border-radius: 50%;
                position: relative;

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
                    font-size: 3vw;
                }
            }

            .nameBox {
                font-size: 1vw;
                margin: 1vw 0 .5VW 0;
                overflow: hidden;
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 1;
                text-align: center;

                .tranBox {
                    color: @whiteGreyColor;
                    font-family: 'Harmony_Light', sans-serif;
                }
            }

            .numBox {
                font-size: 0.8vw;

                >span {
                    margin: 0 .25vw;
                    color: @whiteGreyColor;
                }
            }
        }
    }
}
</style>