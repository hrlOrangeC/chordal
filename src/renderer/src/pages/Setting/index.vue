<template>
    <div id="Setting" v-loading="loading" element-loading-background="rgba(0, 0, 0, 0.75)">
        <div class="connectivity">
            <div class="title">
                <api theme="outline" />网络与连接
            </div>
            <div class="urlBox">
                <div class="title">服务地址</div>
                <div class="form">
                    <el-input v-model="urlObj.baseUrl" style="width: 20vw" />
                    <el-button type="primary" :disabled="urlObj.disabled" :color="colorStore.maxColor" dark
                        @click="changeUrl">
                        更换
                    </el-button>
                </div>
                <div>
                    <span>版本号：{{ urlObj.version }}</span>
                </div>
            </div>
        </div>
        <!--<div class="platte">
            <div class="title">
                <platte theme="outline" />主题
            </div>
            <div class="platteBox">
                <div v-for="item in platteList" @click="paltteClick(item.id)">
                    <div>
                        <div :style="{ backgroundColor: item.bgiColor }"></div>
                        <div :style="{ backgroundColor: item.maxColor }"></div>
                    </div>
                    <span>{{ item.name }}</span>
                </div>
            </div>
        </div>-->
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { innerVersionAPI } from '../../api/index';
import request from "../../utils/request";
import { useColorStore } from '../../store/color';
import { ElMessage } from 'element-plus';
import { setTheme } from '../../style/theme';
import { Api, Platte } from '@icon-park/vue-next';

const colorStore = useColorStore();

interface isUrl {
    baseUrl: string,
    version: string,
    disabled: boolean
}

interface isPlatte {
    name: string,
    id: string,
    type: string,
    maxColor: string,
    bgiColor: string
}

const loading = ref<boolean>(false);
const urlObj = ref<isUrl>({
    baseUrl: request.defaults.baseURL as string,
    version: "",
    disabled: false
})
const nowPlatte = ref<string>();
const platteList = ref<isPlatte[]>([{
    name: "黑红",
    id: "theme0",
    type: "dark",
    maxColor: "rgb(238, 28, 37)",
    bgiColor: "rgb(20,24,27)"
}, {
    name: "黑灰",
    id: "theme1",
    type: "dark",
    maxColor: "rgb(226,217,199)",
    bgiColor: "rgb(20,24,27)"
}, {
    name: "蓝金",
    id: "theme2",
    type: "light",
    maxColor: "rgb(160,209,241)",
    bgiColor: "rgb(249,232,152)"
}])

const changeUrl = async () => {
    loading.value = true;
    await request({
        baseURL: urlObj.value.baseUrl,
        url: "/inner/version",
    }).then(_ => {
        request.defaults.baseURL = urlObj.value.baseUrl;
        localStorage.setItem("baseurl", urlObj.value.baseUrl);
        ElMessage({
            message: "更换服务地址成功",
            type: "success",
            plain: true
        });
        getVersion();
    }).catch(_ => {
        ElMessage({
            message: "服务地址无效",
            type: "error",
            plain: true
        });
        urlObj.value.baseUrl = request.defaults.baseURL as string;
    });
    loading.value = false;
}

const getVersion = async () => {
    const version = { ...await innerVersionAPI({ timestamp: Date.now() }) }.data.data.version;
    urlObj.value.version = version;
}

const paltteClick = (id: string) => {
    setTheme(id);
    nowPlatte.value = id;
}

watch(nowPlatte, () => {
    colorStore.maxColor = document.getElementsByTagName('body')[0].style.getPropertyValue('--maxColor');
})

watch(urlObj, (newVal) => {
    if (newVal!.baseUrl.trim() && newVal!.baseUrl != request.defaults.baseURL) {
        newVal!.disabled = false
    } else {
        newVal!.disabled = true
    }
}, { deep: true })

onMounted(() => {
    getVersion()
})
</script>
<style scoped lang="less">
:deep(.el-input__wrapper) {
    box-shadow: 0 0 0 0px var(--el-input-border-color, var(--el-border-color)) inset;
    border-radius: .1vw;
    height: 2.5vw;
    font-size: 1vw;
    padding: 1vw;
}

#Setting {
    .absolutely();
    padding: 5% 5% 10% 5%;

    >div {
        margin-bottom: 4vw;
        .title {
            font-size: 1.25vw;
            margin: 1.5vw 0;
            display: flex;
            align-items: center;

            span {
                font-size: 1.5vw;
                margin: 0 .5vw
            }
        }
    }

    .connectivity {
        .urlBox {
            width: 100%;

            .title {
                font-size: 1vw;

            }

            .form {
                margin: 1vw 0
            }

            .el-button {
                width: auto;
                height: 2.5vw;
                font-size: 1.1vw;
                color: @whiteGreyColor;
                border-radius: .1vw;
                margin-left: 1vw;
                padding: 1vw;

            }
        }
    }

    .platte {
        .platteBox {
            display: flex;
            >div {
                width: 7.5vw;
                height: auto;
                margin: 0 1vw;
                overflow: hidden;
                cursor: pointer;

                >span {
                    width: 100%;
                    display: block;
                    text-align: center;
                    margin: 1vw 0
                }

                >div {
                    width: 100%;
                    height: 3.5vw;
                    display: flex;
                    transform: skew(-15deg) scaleX(1.5);

                    >div {
                        flex: 1;
                    }
                }
            }
        }
    }
}
</style>