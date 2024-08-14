<template>
    <div id="Welcome">
        <transition name="el-fade-in-linear" appear mode="out-in" @enter="onEnter">
            <div class="onePage" v-if="nowPage == 1">
                <div>chordal</div>
                <div>
                    <el-button type="primary" color="rgb(238, 28, 37)" dark @click="jumpPage(2)">开始</el-button>
                </div>
            </div>
            <div class="twoPage" v-else-if="nowPage == 2">
                <div class="onlineBox" ref="onlineBox">
                    <div class="titleBox">
                        <earth theme="outline" />
                        在线模式
                    </div>
                    <el-input v-model="url" placeholder="请输入服务地址" style="width: 17.5vw" />
                    <el-button type="primary" color="rgb(238, 28, 37)" dark :disabled="!url?.trim()"
                        @click="getVersion">
                        <el-icon v-if="loading" class="is-loading">
                            <Loading />
                        </el-icon>
                        <span v-else>开始</span>
                    </el-button>
                </div>
                <div class="centerBox">或</div>
                <div class="localBox" ref="localBox">
                    <div class="titleBox">
                        <local-pin theme="outline" />
                        本地模式
                    </div>
                    <el-button type="primary" color="rgb(238, 28, 37)" dark disabled>敬请期待</el-button>
                </div>
            </div>
            <div class="threePage" v-else>
                欢迎
            </div>
        </transition>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import request from "../../utils/request";
// import { innerVersionAPI } from '../../api/index';
import anime from 'animejs/lib/anime.es.js';
import { Earth, LocalPin } from '@icon-park/vue-next';
import { useRouter } from 'vue-router';

const router = useRouter();

const nowPage = ref<number>(1);
const url = ref<string>();
const loading = ref<boolean>(false);


const onlineBox = ref();
const localBox = ref();

const jumpPage = (num: number) => {
    nowPage.value = num;

}

const twoAnime = () => {
    anime({
        targets: [onlineBox.value, localBox.value],
        opacity: [{
            value: 0,
            duration: 0
        }, {
            value: 1,
            duration: 1000
        }],
        scale: [{
            value: 0,
            duration: 0
        }, {
            value: 1,
            duration: 1000
        }],
        easing: "easeInOutExpo"
    })
}

const onEnter = () => {
    nowPage.value == 2 && twoAnime();
    nowPage.value == 3 && setTimeout(() => {
        router.push({
            name: "homepage"
        });
    }, 1000)
}

const urlError = () => {
    anime({
        targets: onlineBox.value,
        boxShadow: [{
            value: "0 0 0 0 rgb(238, 28, 37)",
            duration: 0
        }, {
            value: "0 0 0 .5vw rgb(238, 28, 37)",
            duration: 450
        }, {
            value: "0 0 0 0vw rgb(238, 28, 37)",
            duration: 450,
        }],
        rotateZ: [{
            value: "0deg",
            duration: 150,
        }, {
            value: "3.75deg",
            duration: 150,
        }, {
            value: "-3.75deg",
            duration: 150,
        }, {
            value: "3.75deg",
            duration: 150,
        }, {
            value: "-3.75deg",
            duration: 150,
        }, {
            value: "0deg",
            duration: 150,
        }],
        easing: "easeInOutExpo"
    })
}

const getVersion = async () => {
    loading.value = true;
    await request({
        baseURL: url.value,
        url: "/inner/version",
    }).then(_ => {
        request.defaults.baseURL = url.value;
        localStorage.setItem("baseurl", url.value as string);
        jumpPage(3);
    }).catch(_ => {
        urlError();
    });
    loading.value = false;
}
</script>
<style scoped lang="less">
:deep(.el-input__wrapper) {
    box-shadow: 0 0 0 0px var(--el-input-border-color, var(--el-border-color)) inset;
    border-radius: .1vw;
    height: 2.5vw;
    font-size: 1vw;
    padding: 1vw;
}

.el-button {
    width: auto;
    height: 3vw;
    font-size: 1.5vw;
    color: @whiteGreyColor;
    border-radius: .1vw;
    padding: 1.5vw;

}

#Welcome {
    .absolutely();
    .flexCenter();
    background-color: @bgiColor;
    -webkit-app-region: drag;

    /*.anime::before {
        content: "";
        width: 90%;
        height: 90%;
        border: .25vw solid @whiteGreyColor;
        position: absolute;
    }*/
    >div {
        -webkit-app-region: no-drag;

        .titleBox {
            font-size: 2vw;
            font-family: 'Harmony_Medium', sans-serif;
            display: flex;
            align-items: center;

            >span {
                font-size: 1.75vw;
                margin: 0 0.5vw;
            }
        }
    }

    .onePage {
        .flexCenter();
        flex-direction: column;
        width: 20%;
        height: auto;
        position: relative;
        font-size: 5vw;

        >* {
            font-family: 'Harmony_Bold', sans-serif;
        }
    }

    .twoPage {
        .flexCenter();
        width: 80%;

        .el-button {
            transform: scale(0.8)
        }

        >div {
            .flexCenter();
            flex-direction: column;
            width: 30%;
            height: 30vw;
            background-color: @bgiSColor;
            padding: 0 5%;

            >* {
                margin: 7.5% 0;
            }
        }

        .centerBox {
            width: 10%;
            margin: 0 5%;
            font-size: 2.5vw;
            background-color: rgba(0, 0, 0, 0)
        }

    }

    .threePage {
        .absolutely();
        .flexCenter();
        font-size: 5vw;

        >* {
            font-family: 'Harmony_Bold', sans-serif;
        }
    }
}
</style>