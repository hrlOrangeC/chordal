<template>
    <div id="MusicList">
        <ul>
            <li>
                <div class="indexBox">#</div>
                <div class="nameBox">标题</div>
                <div class="albumBox"  v-if="!props.albumSongList">专辑</div>
                <div class="likeBox">喜欢</div>
                <div class="dtBox">时长</div>
            </li>
            <el-divider />
            <li v-for="(item, index) in ifList" @dblclick="playMusic(item)"
                :class="{ select: item.id === musicStore.nowMusic?.id }">
                <div class="indexBox">
                    {{ changeIndex(index) }} </div>
                <div class="nameBox">
                    <div class="nameTopBox">
                        <div class="imgBox" v-if="item.al.picUrl"><el-image :src="item.al.picUrl" loading="lazy"
                                :preview-src-list="[item.al.picUrl]" :preview-teleported="true"
                                :hide-on-click-modal="true" /></div>
                        <div class="nBox">
                            <div><span>{{ item.name }}</span><span v-if="item.tns" class="tnsBox">（{{ item.tns?.join("/")
                                    }}）</span></div>
                            <div>{{ item.ar.map(i => i.name).join("/") }}</div>
                        </div>
                    </div>
                    <div class="nameBottomBox" v-if="item.alia">
                        {{ item.alia?.join("/") }}
                    </div>
                </div>
                <div class="albumBox" v-if="!props.albumSongList">{{ item.al.name || "未知专辑" }}</div>
                <div class="likeBox">
                    <like theme="outline" fill="white" />
                </div>
                <div class="dtBox">{{ dayjs(item.dt).format("mm:ss") }}</div>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import dayjs from 'dayjs';
import { Like } from '@icon-park/vue-next';
import { useMusicStore } from '../store/music';

const musicStore = useMusicStore();

const props = defineProps(["searchList", "offset", "playList", "albumSongList", "subList"]);

const playMusic = (item: object) => {
    musicStore.nowMusic = item;
}

const changeIndex = (index: number) => {
    const nIndex = index + (props.offset - 1) * 30 + 1;
    return nIndex < 10 ? "0" + nIndex : nIndex;
}

const ifList = computed(() => {
    return props.searchList || props.playList || props.albumSongList || props.subList
})

onMounted(() => {
    
})
</script>

<style scoped lang="less">
.select {
    background-color: @maxColor !important;
}

.el-image-viewer__close {
    -webkit-app-region: no-drag;
}

#MusicList {
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
            list-style: none;
            .flexCenter();
            padding: 1.25vw 0;
            color: @whiteGreyColor;
            transition: all .25s ease-in-out;
            cursor: pointer;

            >div {
                flex: 0.5;
                .flexCenter();

            }

            .nameBox {
                .flexCenter();
                flex: 3;
                align-items: flex-start;
                flex-direction: column;

                .nameTopBox {
                    .flexCenter();
                }

                .nameBottomBox {
                    margin: .5vw 1vw 0 0;
                    font-family: 'Harmony_Light', sans-serif;
                }

                .imgBox {
                    margin-right: 1vw;
                    .flexCenter();
                }

                .nBox {
                    >div {
                        margin: .5vw 0;
                        overflow: hidden;
                        display: -webkit-box;
                        -webkit-box-orient: vertical;
                        -webkit-line-clamp: 1;
                    }

                    :first-child {
                        :first-child {
                            color: @fontColor;
                        }
                        font-size: 1vw;

                    }
                    .tnsBox {
                        font-family: 'Harmony_Light', sans-serif;
                    }
                }
            }

            .albumBox {
                flex: 2;
                justify-content: flex-start;
                color: @fontColor;
            }

            .likeBox {
                flex: 0.25;
                font-size: 1.25vw;
            }

            .el-image {
                width: 4vw;
                height: 4vw;
                border-radius: .5vw;

            }
        }
    }
}
</style>