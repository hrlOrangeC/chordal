<template>
    <div id="Comments" v-loading="loading" element-loading-background="rgba(0, 0, 0, 0.75)">
        <div class="cTop">
            <div :class="{ moveBox: true, moveCenter: floorShow }">
                <el-input v-model="commentItem.content" type="textarea" maxlength="140" show-word-limit
                    :placeholder="replyItem.user ? `回复 @ ${replyItem.user?.nickname} :` : '说点什么吧'" @keyup.stop/>
                <div class="btnBox">
                    <el-button :color="colorStore.maxColor" dark @click="sendComment">
                        <send theme="outline" />
                        <div>发送</div>
                    </el-button>
                    <div v-if="!floorShow">
                        <Segmented :iconList="iconList" :moveDistance="sortType - 1" :liWidth="8"
                            @jumpSearch="changeSortType" />
                    </div>
                    <el-button v-else :color="colorStore.maxColor" link dark @click="floorComment()">
                        <div>取消发送</div>
                    </el-button>
                </div>
            </div>
        </div>
        <div class="cBottom">
            <ul>
                <li v-for="(item, index) in commentList" :class="{ select: index == selectIndex }" ref="li">
                    <div class="liTBox">
                        <div class="liLBox">
                            <el-image :src="item.user.avatarUrl" loading="lazy"
                                :preview-src-list="[item.user.avatarUrl]" :preview-teleported="true"
                                :hide-on-click-modal="true" />
                        </div>
                        <div class="liRBox">
                            <div class="nameBox">{{ item.user.nickname }}<vip-one theme="outline"
                                    v-if="item.user.vipRights?.redVipLevel" /></div>
                            <div class="contentBox">{{ item.content }}</div>
                        </div>
                    </div>
                    <div class="liBBox">
                        <div class="timeBox">
                            <div>{{ item.timeStr }}</div>
                        </div>
                        <div class="iconBox">
                            <div><good-two :theme="!item.liked ? 'outline' : 'filled'"
                                    @click="commentLike(item.commentId, !item.liked, item)" />{{ item.likedCount }}
                            </div>
                            <div>
                                <comment theme="outline" @click="floorComment(item)" />
                            </div>
                        </div>
                    </div>
                    <div class="floorBox" v-if="item.showFloorComment?.replyCount">
                        <span @click="unfoldFloor(index, item.commentId)" v-if="selectIndex != index">展开{{
                            item.showFloorComment?.replyCount }}条回复</span>
                        <ul v-else>
                            <el-icon v-if="!commentFloorList.length" class="is-loading">
                                <Loading />
                            </el-icon>
                            <li v-for="fitem in commentFloorList.slice((floorPageNo - 1) * 5, floorPageNo * 5)">
                                <div class="fTBox">
                                    <div class="inBox">
                                        <div class="imgBox">
                                            <el-image :src="fitem.user.avatarUrl" loading="lazy"
                                                :preview-src-list="[fitem.user.avatarUrl]" :preview-teleported="true"
                                                :hide-on-click-modal="true" />
                                        </div>
                                        <div class="nameBox">
                                            <span>{{ fitem.user.nickname }}<vip-one theme="outline"
                                                    v-if="fitem.user.vipRights?.redVipLevel" /></span>
                                            <span>
                                                {{ fitem.content }}
                                            </span>
                                        </div>
                                    </div>

                                    <div class="berBox" v-if="fitem.beReplied[0].beRepliedCommentId != item.commentId">
                                        <div>
                                            <span>@ {{ fitem.beReplied[0].user.nickname }} :</span>
                                            <span>{{ fitem.beReplied[0].content }}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="fBBox">
                                    <div class="timeBox">
                                        <div>{{ fitem.timeStr }}</div>
                                    </div>
                                    <div class="iconBox">
                                        <div><good-two :theme="!fitem.liked ? 'outline' : 'filled'"
                                                @click="commentLike(fitem.commentId, !fitem.liked, fitem)" />{{
                                                    fitem.likedCount }}</div>
                                        <div>
                                            <comment theme="outline" @click="floorComment(fitem)" />
                                        </div>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <el-divider />
                </li>
            </ul>
            <transition name="el-fade-in-linear" appear mode="out-in">
                <el-empty v-if="!commentList.length && !loading" description="这里没有评论哦" />
            </transition>
        </div>
        <transition name="el-fade-in-linear" appear mode="out-in">
            <div class="occBox" v-if="selectIndex != -1" @click="selectIndex = -1"></div>
        </transition>
        <PaginBox :limit="30" :total="total" :variable="commentList" v-model:offset="pageNo"
            @currentChange="currentChange" v-if="selectIndex == -1" />
        <PaginBox :limit="5" :total="commentList[selectIndex].showFloorComment?.replyCount" :varible="commentFloorList"
            v-model:offset="floorPageNo" @currentChange="currentChange" v-else />
    </div>
</template>
<script setup lang="ts">
import { ref, onActivated, nextTick, watch } from 'vue';
import { commentNewAPI, commentFloorAPI, commentSendAPI, commentLikeAPI } from '../../api/index';
import { useRoute } from 'vue-router';
import { useColorStore } from '../../store/color';
import { useUserStore } from '../../store/user';
import PaginBox from "../../components/PaginBox.vue";
import Segmented from "../../components/Segmented.vue";
import { GoodTwo, Comment, VipOne, Send } from '@icon-park/vue-next';
import { ElMessage } from 'element-plus'

const emit = defineEmits(["jumpScroll"]);
const props = defineProps(["scrollNum"]);

const route = useRoute();

const colorStore = useColorStore();
const userStore = useUserStore();

const pageNo = ref<number>(1);
const floorPageNo = ref<number>(1);
const pageSize = ref<number>(30);
const sortType = ref<number>(1);
const total = ref<number>(0);
const commentList = ref<any[]>([]);
const commentFloorList = ref<any[]>([]);
const selectIndex = ref<number>(-1);
const loading = ref<boolean>(false);
const floorShow = ref<boolean>(false);
const replyItem = ref<any>({});
const commentItem = ref<any>({
    t: 1,
    type: route.query.ctype,
    id: route.query.id,
    content: null,
    commentId: null
});
const iconList = ref<object[]>([
    {
        name: "推荐",
        type: 1
    },
    {
        name: "热度",
        type: 2
    },
    {
        name: "时间",
        type: 3.
    },
])

const li = ref();

const getList = async () => {
    loading.value = true;
    const clist = await commentNewAPI({
        id: route.query.id,
        type: route.query.ctype,
        pageNo: pageNo.value,
        pageSize: pageSize.value,
        cursor: sortType.value == 3 && pageNo.value != 1
            ? commentList.value.slice(-1)[0].time
            : null,
        sortType: sortType.value,
        timestamp: Date.now()
    });
    commentList.value = clist.data.data.comments;
    total.value = clist.data.data.totalCount;
    loading.value = false;
}

const getFloorList = async (parentCommentId: string) => {
    if (floorPageNo.value * 5 < commentFloorList.value.length) return;
    const length = commentFloorList.value?.length;
    const limit = length > 0 ? length + 40 : 40;
    const time = length > 0 ? commentFloorList.value.slice(-1)[0].time : null;
    const clist =
        await commentFloorAPI({
            parentCommentId,
            id: route.query.id,
            type: route.query.ctype,
            limit,
            time,
            timestamp: Date.now()
        })
    commentFloorList.value.push(...clist.data.data.comments);
}

const unfoldFloor = async (index: number, parentCommentId: string) => {
    if (selectIndex.value != index) {
        commentFloorList.value = [];
        floorPageNo.value = 1;
    }
    selectIndex.value = index;
    nextTick(() => {
        emit("jumpScroll", li.value[index].offsetTop)
    })
    await getFloorList(parentCommentId);
}

const currentChange = async () => {
    if (sortType.value == 3) return;
    selectIndex.value == -1 ? await getList() : await getFloorList(commentList.value[selectIndex.value].commentId);
}

const changeSortType = async (type: number) => {
    sortType.value = type;
    pageNo.value = 1;
    await getList();
}

const sendComment = async () => {
    if (!userStore.notLogin()) return;
    if (!commentItem.value.content?.trim()) {
        ElMessage({
            message: "评论内容不能为空",
            type: "error",
            plain: true,
        });
        return;
    }
    commentItem.value.t = replyItem.value.commentId ? 2 : 1;
    commentItem.value.commentId = replyItem.value.commentId ? replyItem.value.commentId : null;
    const { code } = { ...await commentSendAPI(commentItem.value) }.data;
    if (code == 200) {
        ElMessage({
            message: "评论发送成功",
            type: "success",
            plain: true
        });
        commentItem.value.content = null;
        floorShow.value = false;
    }
}

const floorComment = (item: object = {}) => {
    floorShow.value = Object.keys(item).length === 0 ? false : true;
    replyItem.value = item
}

const commentLike = async (cid: string, liked: boolean, item: { liked: boolean, likedCount: number }) => {
    if (!userStore.notLogin()) return;
    const { code, msg } =
        {
            ...await commentLikeAPI({
                id: route.query.id,
                cid,
                t: liked ? 1 : 0,
                type: route.query.ctype,
                timestamp: Date.now()
            })
        }.data
    if (code == 200) {
        item.liked = liked;
        liked ? item.likedCount++ : item.likedCount--;
    } else {
        ElMessage({
            message: msg,
            type: "error",
            plain: true
        });
    }
}

watch(() => props.scrollNum, () => {
    if (commentFloorList.value.length != 0)
        selectIndex.value = -1
})

onActivated(async () => {
    await getList();
})
</script>
<style scoped lang="less">
:deep(.el-scrollbar__wrap) {
    scroll-behavior: v-bind('selectIndex == -1 ? "auto" : "smooth"');
    overflow: v-bind('selectIndex == -1 ? "auto" : "hidden"');
}

:deep(.el-textarea__inner) {
    box-shadow: 0 0 0 0px var(--el-input-border-color, var(--el-border-color)) inset;
    font-size: 1vw;
    padding: .5vw 1vw;
    min-height: 2.5vw !important;
    max-height: 10vw;
    border-radius: .25vw;
}

:deep(.el-input__count) {
    font-size: 1vw;
    bottom: .5vw;
    line-height: 100%;
    right: 1vw;
}

.select {
    position: relative;
    z-index: 1001;
}

.moveCenter {
    position: absolute !important;
    top: 50% !important;
    left: 50% !important;
    transform: translateX(-50%) translateY(-50%);
    background-color: @bgiSColor;
    width: 50% !important;
    padding: 1.5% 2.5% 0 2.5%;
    border-radius: .5vw;
    z-index: 2000
}

#Comments {
    .absolutely();
    padding: 5% 0 10% 0;

    .el-divider {
        border-color: @bgiSColor;
        margin: 1.5vw 0 0 0;
    }

    .cTop {
        min-height: 9vw;
        padding: 0 5%;

        .moveBox {
            width: 100%;
            padding-top: 1.5%;
        }

        .btnBox {
            margin: 1.5vw 0;
            display: flex;
            justify-content: space-between;
            align-items: center;

            .el-button {
                width: auto;
                height: 2vw;
                font-size: 1vw;
                color: @whiteGreyColor;
                border-radius: .1vw;
                padding: .5vw 1vw;

                span {
                    font-size: 1.3vw;
                }

                div {
                    margin-left: .5vw
                }
            }
        }

    }

    .cBottom {
        ul {
            li {
                list-style: none;
                padding-top: 1.5vw;

                >div {
                    padding: 0 5%;
                }

                .liTBox {
                    .flexCenter();
                    justify-content: flex-start;
                    margin-bottom: .5vw;

                    .liLBox {
                        margin-right: 1vw;

                        .el-image {
                            width: 4vw;
                            height: 4vw;
                            border-radius: 50%;
                            box-shadow: 0 0 0.75vw 0.75vw @bgiSColor;
                        }
                    }

                    .liRBox {

                        >div {
                            margin: .5vw 0;
                        }

                        .nameBox {
                            font-family: 'Harmony_Medium', sans-serif;
                            color: @whiteGreyColor;
                            display: flex;
                            align-items: center;

                            span {
                                font-size: 1.3vw;
                                margin-left: .5vw;
                                color: @maxColor;
                            }
                        }

                        .contentBox {
                            font-size: 1vw;
                            font-family: 'Harmony_Light', sans-serif;
                        }
                    }
                }

                .liBBox {
                    color: @whiteGreyColor;
                    display: flex;
                    justify-content: space-between;
                    margin: .25vw 0;

                    .timeBox {
                        display: flex;
                        align-items: flex-start;
                        flex-direction: column;

                    }

                    .iconBox {
                        display: flex;
                        .flexCenter();

                        >div {
                            margin: 0 1vw;
                            cursor: pointer;

                        }

                        span {
                            font-size: 1.3vw;
                            margin-right: .25vw;

                        }
                    }
                }

                .floorBox {
                    margin: .25vw 0;
                    color: @whiteGreyColor;

                    >span {
                        cursor: pointer;
                    }

                    .el-icon {
                        font-size: 1.6vw;
                        color: @maxColor;
                        margin: 1.5vw 0;
                    }

                    ul {
                        text-align: center;

                        li {
                            list-style: none;
                            display: flex;
                            flex-direction: column;
                            margin: 1.5vw 0;
                            padding: 0;

                            >div {
                                padding: 0
                            }

                            .el-image {
                                width: 2.5vw;
                                height: 2.5vw;
                                border-radius: 50%;
                                margin-right: 1vw;
                                box-shadow: 0 0 .25vw .25vw @bgiSColor;
                            }

                            .fTBox {
                                .inBox {
                                    display: flex;
                                    align-items: center;

                                    .nameBox {
                                        display: flex;
                                        align-items: center;
                                        line-height: 100%;

                                        >span:first-child {
                                            font-family: 'Harmony_Medium', sans-serif;
                                            color: @whiteGreyColor;
                                            display: flex;
                                            align-items: center;
                                            white-space:nowrap;

                                            span {
                                                font-size: 1.3vw;
                                                margin-left: .5vw;
                                                color: @maxColor;
                                            }
                                        }

                                        >span:last-child {
                                            margin-left: 1vw;
                                            font-size: 1vw;
                                            font-family: 'Harmony_Light', sans-serif;
                                            text-align: left;
                                            display: flex;

                                        }
                                    }
                                }

                                .berBox {
                                    margin: .25vw 0 .75vw 3.5vw;
                                    display: flex;

                                    >div {
                                        padding: 1vw;
                                        background-color: @bgiSColor;
                                        border-radius: .1vw;

                                        >span {
                                            font-family: 'Harmony_Light', sans-serif;
                                            text-align: left;
                                        }

                                        >span:first-child {
                                            margin-right: 1vw;
                                            font-style: italic;
                                        }
                                    }

                                }

                            }

                            .fBBox {
                                margin: .25vw 0;
                                color: @whiteGreyColor;
                                display: flex;
                                justify-content: space-between;
                                margin: .25vw 0;
                                padding-left: 3.5vw;

                                .timeBox {
                                    display: flex;
                                    align-items: flex-start;
                                    flex-direction: column;

                                }

                                .iconBox {
                                    display: flex;
                                    .flexCenter();

                                    >div {
                                        margin: 0 1vw;
                                        cursor: pointer;

                                    }

                                    span {
                                        font-size: 1.3vw;
                                        margin-right: .25vw;

                                    }
                                }
                            }

                        }
                    }
                }

            }
        }
    }

    .occBox {
        position: absolute;
        .absolutely();
        z-index: 1000;
        background-color: rgba(0, 0, 0, 0.75);
        left: 0;
        top: 0;
    }
}
</style>