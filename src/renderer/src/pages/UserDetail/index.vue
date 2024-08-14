<template>
    <div id="UserDetail">
        <div class="uTop">
            <div class="uLTop" ref="img">
                <el-image :src="userDetail?.profile.avatarUrl" loading="lazy"
                    :preview-src-list="[userDetail?.profile.avatarUrl]" :preview-teleported="true"
                    :hide-on-click-modal="true" />
            </div>
            <div class="uRTop">
                <div class="nameBox">{{ userDetail?.profile.nickname }}</div>
                <div class="timeBox">
                    <span>{{ userDetail?.profile.follows }} 关注</span>
                    <span>{{ userDetail?.profile.followeds }} 粉丝</span>
                    <span>Lv.{{ userDetail?.level }} 等级</span>
                </div>
                <div class="desBox">
                    {{ userDetail?.profile.signature || "简介走丢了......" }}
                </div>
                <div class="btnBox" v-if="isMe">
                    <el-button dark :color="colorStore.maxColor"><span
                            v-if="
                                !userDetail?.profile.followed && !userDetail?.profile.followMe
                            ">
                            <add-one theme="outline" />
                            <div>关注</div>
                        </span><span v-else-if="
                            !userDetail?.profile.followed && userDetail?.profile.followMe
                        "><span><loop-once theme="outline" size="24" fill="#333" />
                                <div>回关</div>
                            </span></span>
                        <span v-else-if="
                            userDetail?.profile.followed && userDetail?.profile.followMe
                        ">
                            <span><transfer-data theme="outline" />
                                <div>已互关{{ userDetail?.profile.followTime.slice(3) }}</div>
                            </span>
                        </span>
                        <span v-else-if="
                            userDetail?.profile.followed && !userDetail?.profile.followMe
                        "><check-one theme="outline" />
                            <div>{{ userDetail?.profile.followTime }}</div>
                        </span>
                    </el-button>
                    <el-button dark :color="colorStore.maxColor">
                        <communication theme="outline" />
                    </el-button>
                </div>
            </div>
        </div>
        <div class="uBottom">
            <div v-if="listFilter(true).length">
                <div class="titleBox">
                    <newlybuild theme="outline" />{{ !isMe ? "我" : "ta" }} 创建的歌单 ({{ listFilter(true).length }})
                </div>
                <PlayList :userPlayList="listFilter(true)" />
            </div>
            <div v-if="listFilter(false).length">
                <div class="titleBox">
                    <folder-focus theme="outline" />{{ !isMe ? "我" : "ta" }} 收藏的歌单 ({{ listFilter(false).length }})
                </div>
                <PlayList :userPlayList="listFilter(false)" />
            </div>
            <el-empty description="ta 没有收藏或创建歌单" v-if="!userPlayList.length" />
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onActivated, computed } from 'vue';
import { useRoute } from 'vue-router';
import { userDetailAPI, userPlayListAPI } from '../../api/index';
import { useColorStore } from '../../store/color';
import { useUserStore } from '../../store/user';
import { AddOne, CheckOne, TransferData, LoopOnce, Communication, Newlybuild, FolderFocus } from '@icon-park/vue-next';
import PlayList from "../../components/PlayList.vue";

const route = useRoute();

const colorStore = useColorStore();
const userStore = useUserStore();

const userDetail = ref<any>();
const userPlayList = ref<any[]>([]);

const img = ref();

const getDetail = async () => {
    userDetail.value = { ...await userDetailAPI({ uid: route.query.id }) }.data;
    userPlayList.value = { ...await userPlayListAPI({ uid: route.query.id }) }.data.playlist;
}

const listFilter = (flag: boolean) => {
    const id = userDetail.value?.profile.userId;
    return userPlayList.value.filter(i => (flag ? i.userId == id : i.userId != id))
}

const isMe = computed(() => {
    return userStore.userDetail?.userId != userDetail.value?.profile.userId
})

onActivated(async () => {
    await getDetail();
})

onMounted(() => {

})
</script>
<style scoped lang="less">
#UserDetail {
    .absolutely();
    padding-bottom: 10%;

    .uTop {
        padding: 5%;
        display: flex;

        .uLTop {
            color: @maxColor;

            .el-image {
                width: 20vw;
                height: 20vw;
                border-radius: 50%;
                box-shadow: 0 0 2.5vw 2.5vw @bgiSColor;
            }
        }

        .uRTop {
            margin-left: 3vw;
            font-size: 1vw;
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;

            >div {
                flex: 0.75;
                .flexCenter();
                justify-content: flex-start;
            }

            .nameBox {
                font-size: 2.5vw;
                font-family: 'Harmony_Medium', sans-serif;
            }

            .timeBox {
                flex: 0.5;
                align-items: flex-start;

                span {
                    margin-right: 1vw;
                }
            }

            .desBox {
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
                >* {
                    margin-right: 1.5vw;
                }

                .el-button {
                    width: auto;
                    height: 2.5vw;
                    font-size: 1.1vw;
                    color: @whiteGreyColor;
                    border-radius: .1vw;
                    padding: 1vw;

                    span :first-child {
                        font-size: 1.5vw;
                        line-height: 100%;
                    }

                    span {
                        line-height: 100%;
                        .flexCenter();
                    }

                    div {
                        margin-left: .5vw;
                        font-size: 1.1vw;
                    }
                }

            }
        }
    }

    .uBottom {
        >div {
            .titleBox {
                font-size: 1.4vw;
                margin: 2vw 0;
                padding: 0 2%;
                font-size: 1vw;
                display: flex;

                >span {
                    font-size: 1.4vw;
                    margin-right: .5vw;
                }
            }
        }
    }

}
</style>