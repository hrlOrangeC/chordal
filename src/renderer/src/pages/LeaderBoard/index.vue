<template>
    <div id="LeaderBoard">
        <div class="titleBox"><crown-two theme="outline" />官方榜</div>
        <div class="lTop">
            <div class="topList" v-for="(item, index) in topList?.filter((i) => i.ToplistType)" :key="index"
                @click="jumpDetail(item.id)" v-wave>
                <div class="nameBox">
                    <span class="big">{{ item.name }}</span><span class="textgrey">{{ item.updateFrequency }}</span>
                </div>
                <div class="imgBox">
                    <div><el-image :src="item.coverImgUrl" loading="lazy" />
                        <div class="occBox">
                            <ranking theme="outline" />
                        </div>
                    </div>
                    <div>
                        <div class="trackBox" v-for="(tItem, tIndex) in item.tracks" :key="tIndex">
                            <span class="sBig">{{ tIndex + 1 }} &nbsp; </span>{{ tItem.first }} -
                            <span class="textgrey">{{ tItem.second }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="titleBox">
            <creative theme="outline" />精选榜
        </div>
        <div class="lBottom">
            <div class="list" v-for="(item, index) in topList?.filter((i) => !i.ToplistType)" :key="index"
                @click="jumpDetail(item.id)" v-wave>
                <div class="imgBox">
                    <el-image :src="item.coverImgUrl" loading="lazy" />
                    <div class="occBox">
                        <ranking theme="outline" />
                    </div>
                </div>
                <div class="nameBox">
                    <div class="sBig">{{ item.name }}</div>
                    <div class="textgrey">{{ item.updateFrequency }}</div>
                </div>
            </div>
            <i
                v-for="_ in topList?.filter((i) => !i.ToplistType).length % 5 == 0 ? 0 : 5 - topList?.filter((i) => !i.ToplistType).length % 5"></i>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted} from 'vue';
import { topListAPI } from '../../api/index';
import { Ranking, CrownTwo, Creative } from '@icon-park/vue-next';
import { useRouter } from 'vue-router';

const router = useRouter();

const topList = ref<any[]>([]);

const getList = async () => {
    topList.value = { ...await topListAPI({ timestamp: Date.now() }) }.data.list;
}

const jumpDetail = (id: number | string) => {
    router.push({
        name: "playlistdetail",
        query: {
            id
        }
    })
}

onMounted(() => {
    getList();
})
</script>
<style lang="less">
.big {
    font-size: 1.3vw;
}

.sBig {
    font-size: 1.1vw;
}

#LeaderBoard {
    .absolutely();
    padding: 5% 0 10% 0;

    .titleBox {
        font-size: 1.5vw;
        margin: 2vw;
        font-family: 'Harmony_Medium', sans-serif;

        span {
            margin: 0 .5vw;
        }
    }

    .lTop,
    .lBottom {
        display: flex;
        flex-wrap: wrap;
        padding: 0 2vw;

        >div {
            flex: 1;
            min-width: 50%;
            box-sizing: border-box;
            padding: 2vw;
            background-color: rgba(0, 0, 0, 0.05);
            transition: transform 0.1s ease-in;
            cursor: pointer;

            .imgBox {
                position: relative;
                overflow: hidden;

                >div {
                    position: relative;
                    overflow: hidden;
                }

                .el-image {
                    .absolutely();
                    transition: all .25s ease-in-out;
                }

                .occBox {
                    .absolutely();
                    .flexCenter();
                    position: absolute;
                    top: 0;
                    left: 0;
                    opacity: 0;
                    background-color: @bgiColor;
                    transition: all .25s ease-in-out;
                    font-size: 3vw;
                }
            }
        }

        i {
            flex: 1;
            padding: 2vw;
        }

        >div:hover {
            background-color: @bgiSColor;

            .imgBox {
                .el-image {
                    transform: scale(1.1);
                }

                .occBox {
                    opacity: 0.75;
                }
            }
        }
    }

    .lTop {
        .nameBox {
            padding-bottom: 1vw;
            display: flex;
            justify-content: space-between;
            align-items: center;

            >span:last-child {
                font-family: 'Harmony_Light', sans-serif;
            }

        }

        .imgBox {
            display: flex;

            >div:first-child {
                width: 7.5vw;
                height: 7.5vw;
                border-radius: .5vw;
            }

            >div:last-child {
                margin-left: 1vw;
                padding: .5vw;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }

            .trackBox {
                flex: 1;
                width: 100%;
                text-overflow: ellipsis;
                overflow: hidden;
                word-break: break-all;
                white-space: nowrap;
                line-height: 200%;
            }

        }
    }

    .lBottom {
        >div {
            min-width: 20%;
            display: flex;
            flex-direction: column;
            justify-content: space-around;
            align-items: center;
        }

        .imgBox {
            width: 10vw;
            height: 10vw;
            border-radius: .5vw;
            margin-bottom: .5vw;
        }

        .nameBox {
            text-align: center;
            width: 100%;

            >div {
                width: 100%;
                text-overflow: ellipsis;
                overflow: hidden;
                word-break: break-all;
                white-space: nowrap;
                line-height: 200%;
            }

            >div:last-child {
                font-family: 'Harmony_Light', sans-serif;
            }
        }

    }

}
</style>