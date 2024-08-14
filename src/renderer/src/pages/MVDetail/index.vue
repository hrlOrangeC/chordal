<template>
    <div id="MVDetail">
        <div class="mLBox">
            <div class="mvBox" ref="mvBox"></div>
        </div>
        <div class="mRBox">
            <div class="nameBox">{{ MVDetail?.name }}</div>
            <div class="singerBox">{{ MVDetail?.artists.map(i => i.name).join("/") }}</div>
            <div class="timeBox">
                <span>{{ MVDetail?.publishTime }}</span>
                <span>-</span>
                <span>{{ MVDetail?.playCount }} 次播放</span>
            </div>
            <div class="desBox">{{ MVDetail?.desc || "简介走丢了......" }}</div>
        </div>
    </div>
</template>
<script setup lang="ts">
import Player from 'xgplayer';
import 'xgplayer/dist/index.min.css';
import { useRoute } from 'vue-router';
import { ref, onMounted, onActivated } from 'vue';
import { MVDetailAPI, MVUrlAPI } from '../../api/index';

const route = useRoute();

const MVDetail = ref();
const MVUrl = ref<string>();

const mvBox = ref();
const player = ref();

const getDetail = async () => {
    MVDetail.value = { ...await MVDetailAPI({ mvid: route.query.id }) }.data.data;
    MVUrl.value = { ...await MVUrlAPI({ id: route.query.id }) }.data.data.url
}

onActivated(async () => {
    await getDetail();
    player.value.src = MVUrl.value
})

onMounted(() => {
    player.value = new Player({
        el: mvBox.value
    });
})
</script>
<style scoped lang="less">
#MVDetail {

    padding: 5%;
    display: flex;

    .mLBox {
        flex: 2;

        .mvBox {
            width: 100% !important;
            height: 35vw !important;
            border-radius: 1vw;
            overflow: hidden;

            * {
                font-size: 1vw !important;
            }

            :deep(.play),
            :deep(.pause),
            :deep(.xg-volume),
            :deep(.xg-get-cssfull),
            :deep(.xg-get-fullscreen),
            :deep(.xg-spot-info),
            :deep(.xgplayer-progress-btn),
            :deep(.xg-volume-mute),
            :deep(.xg-volume-small) {
                width: auto !important;
                height: 2vw !important
            }

            :deep(.xgplayer-progress-btn) {
                background: none
            }

            :deep(.xg-spot-info) {
                bottom: 200%;
            }

            /*:deep(.xgplayer-slider) {
                width: 2vw;
                height: 6vw;
                .xgplayer-bar, .xgplayer-drag {
                    
                    height: 4vw !important;
                    left: 50%;
                    top: 50%;
                    transform: translateX(-50%) translateY(-50%)
                }
            }*/

            :deep(.xgplayer-progress-played) {
                background: @maxColor
            }

            :deep(.xgplayer-progress-btn::before) {
                width: 1vw !important;
                height: 1vw !important;
            }

            :deep(.xg-inner-controls),
            :deep(.xgplayer) {
                height: 4vw !important;
                align-items: center !important;
            }

            :deep(.xg-left-grid),
            :deep(.xg-right-grid) {
                height: auto !important;
            }

            :deep(.xgplayer-progress) {
                height: 1vw;
                align-items: flex-start;
            }

            :deep(.xgplayer-progress-outer) {
                height: .3vw
            }

            :deep(.active) {
                height: 1.5vw;
                margin-bottom: .6vw !important
            }

        }
    }

    .mRBox {

        margin-left: 3vw;
        font-size: 1vw;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding-bottom: 2%;

        >div {
            flex: 0.75;
            .flexCenter();
            justify-content: flex-start;
        }

        .nameBox {
            font-size: 2.5vw;
            font-family: 'Harmony_Medium', sans-serif;
            line-height: 225%;
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
        }

        .singerBox {
            flex: 0.25;
            align-items: flex-start;
        }

        .timeBox {
            flex: 0.5;

            span {
                margin-right: 1vw;
            }
        }

        .desBox {
            flex: 3;
            line-height: 150%;
            font-size: 1vw;
            color: @whiteGreyColor;
            font-family: 'Harmony_Light', sans-serif;
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 15;
        }
    }
}
</style>