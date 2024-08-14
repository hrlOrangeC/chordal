<template>
    <div id="SearchFound">
        <div class="searchHistory" v-if="historyList.length">
            <div class="titleBox">
                <div><history-query theme="outline" fill="#FFF" strokeLinejoin="miter" strokeLinecap="butt" />
                    <span>搜索历史</span>
                </div>
                <div>
                    <el-popconfirm title="确定要清除所有搜索记录吗?" effect="dark" confirm-button-text="确定" cancel-button-text="取消"
                        :hide-icon="false" confirm-button-type="danger" @confirm="deteleH" :hide-after="25"
                        :teleported="false">
                        <template #reference>
                            <delete theme="outline" strokeLinejoin="miter" strokeLinecap="butt" />
                        </template>
                    </el-popconfirm>
                </div>
            </div>
            <div class="historyBox">
                <ul ref="historyUl">
                    <li v-for="item in historyList" @click="rSearch(item)">{{ item }}
                        <div class="closeBox" @click.stop="deteleH(item)">
                            <close theme="outline" strokeLinejoin="miter" strokeLinecap="butt" />
                        </div>
                    </li>
                </ul>
                <div class="historyBtn" v-if="nowHeight > maxHeight">
                    <div @click="changeHistoryUlShow">
                        <Transition name="el-fade-in-linear" appear mode="out-in">
                            <expand-down-one theme="outline" v-if="historyUlShow" />
                            <fold-up-one theme="outline" v-else />
                        </Transition>
                    </div>
                </div>
            </div>
        </div>
        <div class="hotSearch">
            <div class="titleBox">
                <div>
                    <fire theme="outline" fill="#fff" strokeLinejoin="miter" strokeLinecap="butt" />
                    <span>热搜榜</span>
                </div>
                <div @click="resetHotList($event)">
                    <refresh theme="outline" />
                </div>
            </div>
            <TransitionGroup tag="ul" name="list" appear mode="out-in">
                <li v-for="(item, index) in hotList" :key="item.searchWord" @click="rSearch(item.searchWord)">
                    <div class="indexBox">{{ index + 1 }}</div>
                    <div class="nameBox">
                        <div>{{ item.searchWord }}</div>
                        <div>{{ item.content }}</div>
                    </div>
                    <div class="iconBox">
                        <trending-up v-if="item.iconType == 5" theme="outline" strokeLinejoin="miter"
                            strokeLinecap="butt" />
                        <fire v-else-if="item.iconType == 4" theme="outline" strokeLinejoin="miter"
                            strokeLinecap="butt" />
                    </div>
                    <div class="numBox">{{ item.score }}</div>
                </li>
            </TransitionGroup>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted, watch, defineEmits, nextTick, onActivated } from 'vue';
import { searchHotAPI } from '../api/index';
import { HistoryQuery, Fire, TrendingUp, Delete, Refresh, ExpandDownOne, FoldUpOne } from '@icon-park/vue-next';
import { ElMessage } from 'element-plus'

const props = defineProps(["historyList"]);

const emit = defineEmits(["deteleHistory", "runSearch"]);

const hotList = ref<any[]>();
const hotListLoading = ref<boolean>(false);
const historyUl = ref<any>(Element);
const historyUlShow = ref<boolean>(true);
const maxHeight = ref<number>(0);
const nowHeight = ref<number>(0);

const getHotList = async () => {
    hotList.value = { ...await searchHotAPI({ timestamp: Date.now() }) }.data.data;
}

const deteleH = (item?: string) => {
    emit("deteleHistory", item);
}

const rSearch = (item: string) => {
    emit("runSearch", item);
}

const resetHotList = async (e) => {
    if (hotListLoading.value) return;
    hotListLoading.value = true;
    e.target.style.transform = "rotateZ(360deg)";
    e.target.style.opacity = "0.5";
    await getHotList();
    ElMessage({
        message: "刷新成功",
        type: 'success',
        plain: true,
        offset: 50
    });
    setTimeout(() => {
        hotListLoading.value = false;
        e.target.style.transform = "rotateZ(0deg)";
        e.target.style.opacity = "1";
    }, 5000)
}

const getMaxHeight = () => {
    nextTick(() => {
        const li = historyUl.value.children[0];
        maxHeight.value = Math.ceil((parseFloat(getComputedStyle(li, null).marginTop.slice(0, -2)) * 2 + li.scrollHeight)) * 3;
        nowHeight.value = historyUl.value.scrollHeight;
    })
}

const changeHistoryUlShow = () => {
    historyUlShow.value = !historyUlShow.value;
}

watch(() => props.historyList, () => {
    getMaxHeight();
}, { deep: true })

onActivated(() => {
    getMaxHeight();
    window.onresize = () => {
        getMaxHeight();
    }
})

onMounted(async () => {
    await getHotList();
})
</script>
<style lang="less" scoped>
.list-move,
.list-enter-active,
.list-leave-active {
    transition: all .75s ease-in-out !important;
    transform: translateX(0) !important;
}

.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: translateX(-100%) !important;
}

/* 确保将离开的元素从布局流中删除
  以便能够正确地计算移动的动画。 */
.list-leave-active {
    position: absolute;
}

#SearchFound {
    .absolutely();

    .searchHistory {
        width: 100%;
        padding: 0 2%;
        margin: 2vw 0;

        .titleBox {
            display: flex;
            justify-content: space-between;
            margin: 1vw 0;

            >div {
                display: flex;
                font-size: 1.4vw;
            }

            >div:last-child:hover {
                background-color: @bgiSColor
            }

            >div:last-child {
                cursor: pointer;
                transition: all .25s ease-in-out;
            }

            :first-child span:last-child {
                font-size: 1vw;
                margin: 0 .5vw;
                font-family: 'Harmony_Medium', sans-serif;
            }
        }

        .historyBox {
            ul {
                width: 100%;
                display: flex;
                flex-wrap: wrap;
                max-height: v-bind('historyUlShow ? maxHeight + "px" : "100%"');
                overflow: hidden;

                li:hover .closeBox {
                    width: 1.1vw;
                    height: 1.1vw;
                    padding: .1vw;
                }

                li {
                    list-style: none;
                    background-color: @bgiSColor;
                    padding: 0.5vw 1vw;
                    margin: 0.75vw;
                    cursor: pointer;
                    position: relative;
                    font-family: 'Harmony_Light', sans-serif;

                    .closeBox {
                        position: absolute;
                        right: 0;
                        top: 0;
                        background-color: @maxColor;
                        transform: translateX(50%) translateY(-50%);
                        width: 0;
                        height: 0;
                        border-radius: 50%;
                        padding: 0;
                        display: flex;
                        transition: all .1s ease-in-out;
                    }
                }
            }

            .historyBtn {
                width: 100%;
                height: v-bind('maxHeight / 3 + "px"');
                .flexCenter();

                div {
                    width: 5vw;
                    height: 1.5vw;
                    background-color: @bgiSColor;
                    color: @maxColor;
                    font-size: 1.2vw;
                    cursor: pointer;
                    .flexCenter();
                }

            }
        }

    }

    .hotSearch {
        width: 100%;
        margin: 2vw 0;

        .titleBox {
            display: flex;
            font-size: 1.4vw;
            margin: 1vw 0;
            padding: 0 2%;
            justify-content: space-between;

            >div {
                display: flex;
            }

            >div:last-child:hover {
                background-color: @bgiSColor
            }

            >div:last-child {
                cursor: pointer;
                transition: all .25s ease-in-out;

                * {
                    font-size: 1.4vw;
                    transition: all 1s ease-in-out !important;
                }
            }

            :first-child span:last-child {
                font-size: 1vw;
                margin: 0 .5vw;
                font-family: 'Harmony_Medium', sans-serif;
            }
        }

        ul {
            width: 100%;
            display: flex;
            flex-wrap: wrap;

            li:hover {
                background-color: @bgiSColor
            }

            li {
                width: 50%;
                list-style: none;
                padding: 1vw;
                .flexCenter();
                justify-content: flex-start;
                cursor: pointer;
                transition: all .25s ease-in-out;

                >div {
                    flex: 1;
                }

                .indexBox {
                    flex: 0.2;
                    font-size: 1vw;
                    font-family: 'Harmony_Bold', sans-serif;
                    .flexCenter();
                }

                .nameBox {
                    flex: 2;
                    font-size: 1vw;

                    >div:last-child {
                        font-size: 0.8vw;
                        color: @whiteGreyColor;
                        font-family: 'Harmony_Light', sans-serif;
                    }
                }

                .numBox {
                    flex: 0.2;
                    font-style: italic;
                }

                .iconBox {
                    flex: 0.15;
                    font-size: 1.4vw;
                    color: @maxColor;
                    .flexCenter();
                }
            }
        }
    }
}
</style>